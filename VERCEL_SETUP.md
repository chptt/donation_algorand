# Vercel Setup - Complete Guide

Your Donatechain project is ready to deploy! Here's everything you need.

## 🎯 What You Have

Your project includes:
- ✅ Next.js 14 frontend with Algorand integration
- ✅ Smart contract deployed to Algorand TestNet (App ID: 757438126)
- ✅ Wallet integration (Pera Wallet, Defly Wallet)
- ✅ Campaign creation and donation features
- ✅ Responsive UI with Tailwind CSS

## 📦 Files Created for Deployment

1. **QUICKSTART.md** - Deploy in 10 minutes
2. **DEPLOYMENT.md** - Detailed deployment guide
3. **CHECKLIST.md** - Pre-deployment checklist
4. **USER_GUIDE.md** - Guide for your users
5. **vercel.json** - Vercel configuration
6. **deploy-to-vercel.bat** - Windows deployment script
7. **deploy-to-vercel.sh** - Linux/Mac deployment script

## 🚀 Three Ways to Deploy

### Option 1: Vercel Dashboard (Easiest)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)

3. Import your GitHub repository

4. Configure:
   - Root Directory: `Donatechain`
   - Framework: Next.js (auto-detected)

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_ALGORAND_APP_ID=757438126
   NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
   NEXT_PUBLIC_ALGOD_TOKEN=
   NEXT_PUBLIC_ALGOD_PORT=
   ```

6. Click "Deploy"

7. Done! Your site is live in 2-3 minutes

### Option 2: Vercel CLI (For Developers)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd Donatechain
   vercel
   ```

4. Follow prompts and add environment variables

5. For production:
   ```bash
   vercel --prod
   ```

### Option 3: Deployment Scripts (Automated)

**Windows:**
```bash
cd Donatechain
deploy-to-vercel.bat
```

**Linux/Mac:**
```bash
cd Donatechain
chmod +x deploy-to-vercel.sh
./deploy-to-vercel.sh
```

## 🔑 Environment Variables (CRITICAL!)

These MUST be set in Vercel for your app to work:

| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_ALGORAND_APP_ID` | `757438126` | ✅ Yes |
| `NEXT_PUBLIC_ALGOD_SERVER` | `https://testnet-api.algonode.cloud` | ✅ Yes |
| `NEXT_PUBLIC_ALGOD_TOKEN` | (empty) | No |
| `NEXT_PUBLIC_ALGOD_PORT` | (empty) | No |

**How to add in Vercel:**
1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable
4. Click "Save"
5. Redeploy if already deployed

## ✅ Pre-Deployment Checklist

- [ ] Smart contract deployed (App ID: 757438126)
- [ ] Code pushed to GitHub
- [ ] `.env.local` NOT committed (it's in .gitignore)
- [ ] Vercel account created
- [ ] Environment variables ready to add

## 🧪 Testing Your Deployment

After deployment:

1. **Visit your Vercel URL**
   - Example: `https://donatechain.vercel.app`

2. **Test wallet connection**
   - Click "Connect Wallet"
   - Use Pera Wallet or Defly Wallet
   - Ensure you're on Algorand TestNet

3. **Get TestNet ALGO**
   - Visit [TestNet Dispenser](https://bank.testnet.algorand.network/)
   - Get free TestNet ALGO

4. **Test features**
   - Create a campaign
   - Make a donation
   - View dashboard
   - Check contributions

5. **Verify on blockchain**
   - Visit [AlgoExplorer TestNet](https://testnet.algoexplorer.io/application/757438126)
   - See your transactions

## 📱 User Instructions

Share this with your users:

### For Donors:
1. Install Pera Wallet: [perawallet.app](https://perawallet.app/)
2. Get TestNet ALGO: [bank.testnet.algorand.network](https://bank.testnet.algorand.network/)
3. Visit your site and connect wallet
4. Browse campaigns and donate!

### For Campaign Creators:
1. Connect wallet
2. Go to "Create Campaign"
3. Fill in details
4. Submit and share your campaign URL

**Full guide**: Share `USER_GUIDE.md` with your users

## 🔄 Automatic Deployments

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically deploys!
```

- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview with unique URL

## 🌐 Custom Domain (Optional)

1. Go to Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `donatechain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

## 💰 Pricing

**Vercel Hobby Plan (FREE)**
- Perfect for your project
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Custom domains

**Vercel Pro ($20/month)**
- More bandwidth
- Team collaboration
- Advanced analytics
- Priority support

## 🚨 Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Solution: Install dependencies locally first
cd Donatechain
npm install
npm run build
```

**Error: "Environment variable missing"**
- Check all `NEXT_PUBLIC_*` variables are set in Vercel
- Redeploy after adding variables

### Wallet Won't Connect

- Ensure users have Pera or Defly Wallet installed
- Check they're on Algorand TestNet
- Verify `NEXT_PUBLIC_ALGORAND_APP_ID` is correct

### Transactions Fail

- Users need TestNet ALGO for transactions
- Check contract App ID is correct
- Verify Algorand node URL is accessible

## 📊 Monitoring

### Vercel Analytics
1. Go to project dashboard
2. Click "Analytics"
3. Enable (free on Hobby plan)
4. See visitor stats, performance metrics

### Algorand Explorer
- Monitor your contract: [testnet.algoexplorer.io/application/757438126](https://testnet.algoexplorer.io/application/757438126)
- See all transactions
- Track total donations

## 🎓 Next Steps

After successful deployment:

1. **Test thoroughly**
   - All features working
   - Wallet connections
   - Transactions completing

2. **Share with users**
   - Post on social media
   - Share in communities
   - Get feedback

3. **Monitor usage**
   - Check Vercel analytics
   - Watch blockchain transactions
   - Track user feedback

4. **Plan for MainNet**
   - When ready for real money
   - Deploy contract to MainNet
   - Update environment variables
   - Thorough testing required

## 📚 Documentation

- **QUICKSTART.md** - Fast 10-minute deployment
- **DEPLOYMENT.md** - Detailed step-by-step guide
- **CHECKLIST.md** - Pre-deployment checklist
- **USER_GUIDE.md** - Complete user documentation
- **Vercel Docs** - [vercel.com/docs](https://vercel.com/docs)
- **Algorand Docs** - [developer.algorand.org](https://developer.algorand.org/)

## 🆘 Need Help?

1. Check troubleshooting sections in guides
2. Review Vercel documentation
3. Check Algorand developer portal
4. Review error messages carefully
5. Test locally first: `npm run build && npm start`

## 🎉 You're Ready!

Your Donatechain platform is ready to deploy. Choose your deployment method and follow the guide.

**Recommended path for beginners:**
1. Read QUICKSTART.md
2. Follow Option 1 (Vercel Dashboard)
3. Share USER_GUIDE.md with users
4. Monitor and iterate

**Good luck with your deployment! 🚀**

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Test build locally
npm run build

# Run locally
npm run dev

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

**Questions? Check the guides or Vercel documentation!**
