# Quick Start Guide - Deploy in 10 Minutes

Get your Donatechain platform live on Vercel in just a few steps!

## 🚀 Fast Track Deployment

### 1. Deploy Smart Contract (2 minutes)

```bash
cd algorand
pip install -r requirements.txt
```

Edit `algorand/.env`:
```
DEPLOYER_MNEMONIC=your 25 word mnemonic here
ALGOD_SERVER=https://testnet-api.algonode.cloud
```

Deploy:
```bash
python deploy/deploy.py
```

**Copy the App ID from output!** You'll need it next.

### 2. Push to GitHub (1 minute)

```bash
cd ..
git init
git add .
git commit -m "Deploy Donatechain"
git remote add origin https://github.com/YOUR_USERNAME/donatechain.git
git push -u origin main
```

### 3. Deploy to Vercel (3 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set Root Directory to: `Donatechain`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_ALGORAND_APP_ID=YOUR_APP_ID
   NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_ALGOD_PORT=
   ```
5. Click "Deploy"

### 4. Test It! (2 minutes)

1. Visit your Vercel URL
2. Connect Pera Wallet or Defly Wallet
3. Create a test campaign
4. Make a test donation

## ✅ You're Live!

Share your URL: `https://your-project.vercel.app`

## 📱 User Instructions

Tell your users:

1. **Install a wallet**:
   - [Pera Wallet](https://perawallet.app/) (Mobile & Web)
   - [Defly Wallet](https://defly.app/) (Mobile & Web)

2. **Get TestNet ALGO**:
   - Visit [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)
   - Enter wallet address
   - Receive free TestNet ALGO

3. **Use the platform**:
   - Connect wallet on your site
   - Browse campaigns
   - Donate or create campaigns

## 🔄 Updates

Every time you push to GitHub, Vercel automatically redeploys!

```bash
git add .
git commit -m "Update feature"
git push
```

## 🌐 Going to MainNet

When ready for real money:

1. Deploy contract to MainNet
2. Update Vercel env vars:
   ```
   NEXT_PUBLIC_ALGOD_SERVER=https://mainnet-api.algonode.cloud
   NEXT_PUBLIC_ALGORAND_APP_ID=mainnet_app_id
   ```
3. Test thoroughly!

## 💡 Tips

- **Free hosting**: Vercel Hobby plan is free forever
- **Custom domain**: Add in Vercel settings
- **Analytics**: Enable Vercel Analytics for insights
- **Monitoring**: Watch transactions on [AlgoExplorer](https://testnet.algoexplorer.io/)

## 🆘 Need Help?

Check `DEPLOYMENT.md` for detailed troubleshooting!

---

**That's it! Your blockchain donation platform is now live and ready for users worldwide! 🎉**
