"""
Deploy DonationPlatform to Algorand testnet.
Uses httpx (better TLS on Windows) for all API calls.

Usage:
    python deploy/deploy.py
"""

import os
import base64
from pathlib import Path
from dotenv import load_dotenv
import httpx
import msgpack
from algosdk import mnemonic, account, transaction, encoding
from algosdk.logic import get_application_address

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

COMPILE_URL = "https://testnet-api.4160.nodely.dev"   # supports /compile
SUBMIT_URL  = os.environ.get("ALGOD_SERVER", "https://testnet-api.algonode.cloud").rstrip("/")
TOKEN       = os.environ.get("ALGOD_TOKEN", "")
HEADERS     = {"X-Algo-API-Token": TOKEN} if TOKEN else {}
BASE_URL    = SUBMIT_URL  # used for status/params/accounts


def api_get(path: str) -> dict:
    with httpx.Client(timeout=30, verify=True) as client:
        r = client.get(f"{BASE_URL}/v2{path}", headers=HEADERS)
        r.raise_for_status()
        return r.json()


def api_post(path: str, data: bytes, content_type: str = "application/x-binary") -> dict:
    with httpx.Client(timeout=30, verify=True) as client:
        r = client.post(f"{BASE_URL}/v2{path}", content=data,
                        headers={**HEADERS, "Content-Type": content_type})
        r.raise_for_status()
        return r.json()


def compile_teal(teal: str) -> bytes:
    with httpx.Client(timeout=30, verify=True) as client:
        r = client.post(f"{COMPILE_URL}/v2/teal/compile", content=teal.encode(),
                        headers={**HEADERS, "Content-Type": "application/x-binary"})
        r.raise_for_status()
        return base64.b64decode(r.json()["result"])


def wait_for_confirmation(txid: str, rounds: int = 6) -> dict:
    status = api_get("/status")
    last_round = status["last-round"]
    for _ in range(rounds * 2):
        try:
            result = api_get(f"/transactions/pending/{txid}")
            if result.get("confirmed-round", 0) > 0:
                return result
            if result.get("pool-error"):
                raise Exception(f"Tx pool error: {result['pool-error']}")
        except httpx.HTTPStatusError:
            pass
        last_round += 1
        api_get(f"/status/wait-for-block-after/{last_round}")
    raise TimeoutError(f"Transaction {txid} not confirmed after {rounds} rounds")


def get_deployer_key():
    mn = os.environ.get("DEPLOYER_MNEMONIC", "").strip()
    if not mn:
        raise ValueError("DEPLOYER_MNEMONIC not set in algorand/.env")
    private_key = mnemonic.to_private_key(mn)
    addr = account.address_from_private_key(private_key)
    return private_key, addr


def deploy():
    private_key, addr = get_deployer_key()
    print(f"Deployer: {addr}")

    info = api_get(f"/accounts/{addr}")
    balance = info.get("amount", 0)
    print(f"Balance:  {balance / 1_000_000:.4f} ALGO")
    if balance < 1_000_000:
        raise ValueError("Need at least 1 ALGO. Fund at https://bank.testnet.algorand.network/")

    artifacts = Path(__file__).resolve().parent.parent / "contracts" / "artifacts"
    approval_teal = (artifacts / "DonationPlatform.approval.teal").read_text()
    clear_teal    = (artifacts / "DonationPlatform.clear.teal").read_text()

    print("Compiling TEAL...")
    approval_bytes = compile_teal(approval_teal)
    clear_bytes    = compile_teal(clear_teal)
    print(f"  Approval: {len(approval_bytes)} bytes")
    print(f"  Clear:    {len(clear_bytes)} bytes")

    sp_raw = api_get("/transactions/params")
    sp = transaction.SuggestedParams(
        fee=sp_raw.get("min-fee", 1000),
        first=sp_raw["last-round"],
        last=sp_raw["last-round"] + 1000,
        gh=sp_raw["genesis-hash"],
        gen=sp_raw["genesis-id"],
        flat_fee=True,
    )

    txn = transaction.ApplicationCreateTxn(
        sender=addr,
        sp=sp,
        on_complete=transaction.OnComplete.NoOpOC,
        approval_program=approval_bytes,
        clear_program=clear_bytes,
        global_schema=transaction.StateSchema(num_uints=1, num_byte_slices=0),
        local_schema=transaction.StateSchema(num_uints=0, num_byte_slices=0),
    )

    signed = txn.sign(private_key)
    raw_bytes = msgpack.packb(signed.dictify(), use_bin_type=True)

    print("Sending transaction...")
    # Try AlgoNode first, fall back to Nodely
    for submit_url in ["https://testnet-api.algonode.cloud", "https://testnet-api.4160.nodely.dev"]:
        try:
            with httpx.Client(timeout=30) as client:
                r = client.post(f"{submit_url}/v2/transactions", content=raw_bytes,
                                headers={"Content-Type": "application/x-binary"})
                r.raise_for_status()
                txid = r.json()["txId"]
                print(f"Tx: {txid}")
                break
        except Exception as e:
            print(f"  {submit_url} failed: {e}, trying next...")
    else:
        raise Exception("All submit endpoints failed")

    print("Waiting for confirmation...")
    confirmed = wait_for_confirmation(txid)
    app_id = confirmed["application-index"]
    app_addr = get_application_address(app_id)

    print(f"\nDeployed successfully!")
    print(f"  App ID:      {app_id}")
    print(f"  App Address: {app_addr}")
    print(f"\nAdd to Donatechain/.env.local:")
    print(f"  NEXT_PUBLIC_ALGORAND_APP_ID={app_id}")

    return app_id


if __name__ == "__main__":
    deploy()