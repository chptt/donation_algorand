# Pre-Deployment Checklist ✅

Use this checklist before deploying to Vercel.

## Smart Contract

- [ ] Algorand smart contract deployed to TestNet
- [ ] App ID saved: `757438126` (update if redeployed)
- [ ] Contract tested with test transactions
- [ ] Verified on [AlgoExplorer TestNet](https://testnet.algoexplorer.io/application/757438126)

## Code Repository

- [ ] All code committed to Git
- [ ] `.env.local` is in `.gitignore` (DO NOT commit secrets!)
- [ ] `.env.example` is updated with correct values
- [ ] `package.json` has all dependencies
- [ ] Code pushed to GitHub

## Environment Variables

Copy these to Vercel (replace with your values):

```
NEXT_PUBLIC_ALGORAND_APP_ID=757438126
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_ALGOD_PORT=
```

- [ ] App ID is correct
- [ ] Server URL is correct (TestNet or MainNet)
- [ ] All variables start with `NEXT_PUBLIC_` (required for client-side access)

## Vercel Configuration

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Root directory set to `Donatechain` (if in subdirectory)
- [ ] Environment variables added in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Framework: Next.js (auto-detected)

## Testing

Before going live, test locally:

```bash
cd Donatechain
npm install
npm run build
npm run start
```

- [ ] Build completes without errors
- [ ] App runs on localhost:3000
- [ ] Wallet connection works
- [ ] Can view campaigns
- [ ] Can create campaign (with TestNet ALGO)
- [ ] Can make donation (with TestNet ALGO)

## User Requirements

Make sure users know they need:

- [ ] Pera Wallet or Defly Wallet installed
- [ ] Wallet set to Algorand TestNet
- [ ] TestNet ALGO from [dispenser](https://bank.testnet.algorand.network/)

## Documentation

- [ ] README.md updated with deployment URL
- [ ] User guide created (how to use the platform)
- [ ] Wallet setup instructions provided
- [ ] TestNet vs MainNet clearly indicated

## Security

- [ ] No private keys in code
- [ ] No mnemonics in code
- [ ] `.env.local` in `.gitignore`
- [ ] Only public environment variables exposed
- [ ] Contract permissions reviewed

## Performance

- [ ] Images optimized
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states for transactions

## Post-Deployment

After deploying:

- [ ] Visit Vercel URL and test
- [ ] Connect wallet and verify network
- [ ] Create test campaign
- [ ] Make test donation
- [ ] Check transaction on AlgoExplorer
- [ ] Test on mobile device
- [ ] Share URL with test users

## MainNet Migration (Future)

When ready for production:

- [ ] Smart contract audited
- [ ] Deployed to Algorand MainNet
- [ ] Environment variables updated to MainNet
- [ ] Thoroughly tested with real ALGO
- [ ] Emergency procedures documented
- [ ] Monitoring set up

## Support

- [ ] Contact information provided
- [ ] Issue reporting process defined
- [ ] FAQ created
- [ ] Community channel set up (Discord/Telegram)

---

## Quick Deploy Command

Once checklist is complete:

```bash
# 1. Ensure you're in the Donatechain directory
cd Donatechain

# 2. Install Vercel CLI (if not installed)
npm install -g vercel

# 3. Deploy
vercel

# 4. For production
vercel --prod
```

Or use the Vercel dashboard at [vercel.com/new](https://vercel.com/new)

---

**Ready to deploy? Follow QUICKSTART.md for step-by-step instructions!**
