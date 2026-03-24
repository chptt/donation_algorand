# DonationPlatform — Algorand Smart Contract

Algorand equivalent of the Solidity `DonationPlatform.sol`, written in Algorand Python (ARC4).

## Features
- Create donation campaigns (stored in Box storage)
- Donate ALGO to any active campaign
- Creator withdraws funds; campaign marked inactive
- Per-donor donation tracking via Box storage

## Prerequisites
- Python 3.12+
- [AlgoKit](https://developer.algorand.org/docs/get-started/algokit/) v2+
- Docker (for LocalNet)

## Setup

```bash
cd algorand
pip install -r requirements.txt
cp .env.example .env
# Fill in your DEPLOYER_MNEMONIC and node details
```

## Compile

```bash
algokit compile contracts/donation_platform.py
# Outputs TEAL + ARC32 JSON to ./artifacts/
```

## Deploy

```bash
# Start LocalNet first
algokit localnet start

python deploy/deploy.py
```

## Test

```bash
pytest tests/ -v
```

## Charity Types
| Value | Type |
|-------|------|
| 0 | Housing |
| 1 | Meals |
| 2 | Medical |
| 3 | Education |
| 4 | Equipment |
| 5 | River Cleaning |

## Contract Methods
| Method | Description |
|--------|-------------|
| `create_campaign(charity_type, goal_amount, influencer_name, profile_image_url)` | Create a new campaign, returns campaign_id |
| `donate(campaign_id, payment)` | Donate ALGO (attach PaymentTxn) |
| `withdraw(campaign_id)` | Creator withdraws all donations |
| `get_campaign(campaign_id)` | Read campaign data |
| `get_total_campaigns()` | Total campaigns created |
| `get_donor_amount(campaign_id, donor)` | Donor's total contribution to a campaign |
