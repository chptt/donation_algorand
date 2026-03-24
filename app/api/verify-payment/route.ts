import { NextRequest, NextResponse } from 'next/server'
import algosdk from 'algosdk'
import { ethers } from 'ethers'

const ALGOD_SERVER      = process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const SERVER_ALGO_ADDR  = process.env.SERVER_ALGO_ADDRESS!
const SERVER_EVM_KEY    = process.env.SERVER_EVM_PRIVKEY
const X402_PAYTO_ADDR   = process.env.PLATFORM_X402_ADDR
const BASE_RPC          = process.env.BASE_RPC_URL || 'https://mainnet.base.org'
const USDC_BASE         = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const USDC_AMOUNT       = 100_000n  // $0.10 USDC (6 decimals)
const USDC_ABI          = ['function transfer(address to, uint256 amount) returns (bool)']

// Simple in-memory set to prevent double-spend of same txId
// In production use Redis or a DB
const usedTxIds = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    const { txId, expectedMicroAlgo } = await req.json()

    if (!txId || !expectedMicroAlgo) {
      return NextResponse.json({ error: 'Missing txId or expectedMicroAlgo' }, { status: 400 })
    }

    // Prevent replay attacks
    if (usedTxIds.has(txId)) {
      return NextResponse.json({ error: 'Transaction already used' }, { status: 400 })
    }

    // ── Step 1: Verify Algorand payment ──────────────────────────────────────
    const algod = new algosdk.Algodv2('', ALGOD_SERVER, '')

    let txInfo: any
    try {
      // Try confirmed transactions first
      txInfo = await algod.pendingTransactionInformation(txId).do()
    } catch {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 400 })
    }

    const confirmedRound = txInfo['confirmed-round']
    if (!confirmedRound || confirmedRound === 0) {
      return NextResponse.json({ error: 'Transaction not yet confirmed' }, { status: 400 })
    }

    const txnData   = txInfo.txn?.txn
    const receiver  = txnData?.rcv
    const amount    = txnData?.amt

    if (!receiver || !amount) {
      return NextResponse.json({ error: 'Invalid transaction data' }, { status: 400 })
    }

    const receiverAddr = algosdk.encodeAddress(
      receiver instanceof Uint8Array ? receiver : Buffer.from(receiver, 'base64')
    )

    if (receiverAddr !== SERVER_ALGO_ADDR) {
      return NextResponse.json({ error: 'Wrong receiver address' }, { status: 400 })
    }

    // Allow up to 5% underpayment tolerance for timing/rounding
    const minAccepted = Math.floor(expectedMicroAlgo * 0.95)
    if (Number(amount) < minAccepted) {
      return NextResponse.json({
        error: `Insufficient payment. Got ${amount} microALGO, expected at least ${minAccepted}`
      }, { status: 400 })
    }

    // Mark txId as used
    usedTxIds.add(txId)

    // ── Step 2: Trigger x402 USDC payment on Base ────────────────────────────
    // Skip if env vars not configured (e.g. on TestNet dev)
    if (SERVER_EVM_KEY && X402_PAYTO_ADDR) {
      try {
        const provider = new ethers.JsonRpcProvider(BASE_RPC)
        const signer   = new ethers.Wallet(SERVER_EVM_KEY, provider)
        const usdc     = new ethers.Contract(USDC_BASE, USDC_ABI, signer)
        const tx       = await usdc.transfer(X402_PAYTO_ADDR, USDC_AMOUNT)
        await tx.wait(1)
        console.log('[x402] USDC transfer confirmed:', tx.hash)
        return NextResponse.json({ approved: true, evmTxHash: tx.hash })
      } catch (evmErr: any) {
        console.error('[x402] EVM transfer failed:', evmErr.message)
        // Still approve — don't block campaign creation if Base is down
        // In production you'd queue a retry here
        return NextResponse.json({ approved: true, evmTxHash: null, warning: 'x402 relay pending' })
      }
    }

    // Dev mode: no EVM key configured, just approve after Algorand verification
    return NextResponse.json({ approved: true, evmTxHash: null, mode: 'dev' })

  } catch (e: any) {
    console.error('[verify-payment]', e)
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}