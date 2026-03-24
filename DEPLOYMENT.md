# Deploying Donatechain to Vercel

This guide will help you deploy your Algorand-based donation platform to Vercel so everyone can use it.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Deployed Algorand Smart Contract**: Your contract must be deployed to Algorand TestNet or MainNet

## Step 1: Prepare Your Smart Contract

### Deploy to Algorand TestNet

1. Navigate to the algorand directory:
   ```bash
   cd algorand
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your deployer wallet in `algorand/.env`:
   ```
   DEPLOYER_MNEMONIC=your 25 word mnemonic phrase here
   ALGOD_SERVER=https://testnet-api.algonode.cloud
   ALGOD_TOKEN=
   ALGOD_PORT=
   ```

4. Deploy the contract:
   ```bash
   python deploy/deploy.py
   ```

5. **Save the App ID** from the deployment output - you'll need this for Vercel!

## Step 2: Push to GitHub

1. Initialize git (if not already done):
   ```bash
   cd ..
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)

2. Click "Import Project" and select your GitHub repository

3. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `Donatechain` (if your Next.js app is in a subdirectory)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_ALGORAND_APP_ID=YOUR_APP_ID_FROM_DEPLOYMENT
   NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_ALGOD_PORT=
   ```

   Replace `YOUR_APP_ID_FROM_DEPLOYMENT` with the App ID from Step 1.

5. Click "Deploy"

6. Wait 2-3 minutes for deployment to complete

7. Your app will be live at `https://your-project-name.vercel.app`

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Navigate to your project:
   ```bash
   cd Donatechain
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Follow the prompts and add environment variables when asked

6. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Environment Variables in Vercel

After deployment, you can manage environment variables:

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add/edit these variables:

### Required Variables:
```
NEXT_PUBLIC_ALGORAND_APP_ID=123456789
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_ALGOD_PORT=
```

### For MainNet (when ready):
```
NEXT_PUBLIC_ALGORAND_APP_ID=your_mainnet_app_id
NEXT_PUBLIC_ALGOD_SERVER=https://mainnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_TOKEN=
NEXT_PUBLIC_ALGOD_PORT=
```

4. Click "Save"
5. Redeploy for changes to take effect

## Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-project-name.vercel.app`

2. Test wallet connection:
   - Click "Connect Wallet"
   - Connect with Pera Wallet or Defly Wallet
   - Ensure you're on Algorand TestNet

3. Test creating a campaign:
   - Go to "Create Campaign"
   - Fill in details
   - Submit transaction

4. Test donations:
   - Browse campaigns
   - Make a test donation
   - Verify transaction on [AlgoExplorer TestNet](https://testnet.algoexplorer.io/)

## Step 6: Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

## Troubleshooting

### Build Fails

**Error: Module not found**
- Check that all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: Environment variable missing**
- Verify all `NEXT_PUBLIC_*` variables are set in Vercel
- Redeploy after adding variables

### Wallet Connection Issues

**Wallet won't connect**
- Ensure users have Pera Wallet or Defly Wallet installed
- Check that `NEXT_PUBLIC_ALGORAND_APP_ID` is correct
- Verify Algorand node URL is accessible

### Transaction Failures

**"Application does not exist"**
- Double-check your `NEXT_PUBLIC_ALGORAND_APP_ID`
- Ensure contract is deployed to the correct network (TestNet/MainNet)

**"Insufficient funds"**
- Users need ALGO in their wallet for transactions
- Provide link to [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics in project settings
- Check for large images (optimize with Next.js Image component)
- Review bundle size with `npm run build`

## Going to MainNet

When ready for production:

1. **Deploy contract to MainNet**:
   ```bash
   cd algorand
   # Update .env with MainNet settings
   python deploy/deploy.py
   ```

2. **Update Vercel environment variables**:
   - Change `NEXT_PUBLIC_ALGOD_SERVER` to MainNet
   - Update `NEXT_PUBLIC_ALGORAND_APP_ID` to MainNet App ID

3. **Test thoroughly** before announcing

4. **Security considerations**:
   - Audit your smart contract
   - Test all functions with real ALGO
   - Have emergency pause mechanism
   - Monitor transactions

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Algorand Explorer**: Monitor contract activity
   - TestNet: https://testnet.algoexplorer.io/application/YOUR_APP_ID
   - MainNet: https://algoexplorer.io/application/YOUR_APP_ID

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [AlgoKit Documentation](https://developer.algorand.org/docs/get-started/algokit/)

## Cost

- **Vercel Hobby Plan**: FREE
  - Unlimited deployments
  - Automatic HTTPS
  - 100GB bandwidth/month
  - Perfect for testing and small projects

- **Vercel Pro Plan**: $20/month
  - More bandwidth
  - Team collaboration
  - Advanced analytics
  - Recommended for production

## Next Steps

After deployment:

1. Share your Vercel URL with users
2. Create user documentation
3. Set up monitoring and alerts
4. Plan for MainNet migration
5. Gather user feedback
6. Iterate and improve

Your donation platform is now live and accessible to everyone! 🎉
