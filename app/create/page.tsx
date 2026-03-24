'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { useRouter } from 'next/navigation'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves, Plus, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import algosdk from 'algosdk'

const charityTypes = [
  { name: 'Housing',        icon: Home,         color: 'charity-housing' },
  { name: 'Meals',          icon: Utensils,      color: 'charity-meals' },
  { name: 'Medical',        icon: Heart,         color: 'charity-medical' },
  { name: 'Education',      icon: GraduationCap, color: 'charity-education' },
  { name: 'Equipment',      icon: Wrench,        color: 'charity-equipment' },
  { name: 'River Cleaning', icon: Waves,         color: 'charity-rivercleaning' },
]

type Step = 'idle' | 'fetching-fee' | 'awaiting-payment' | 'verifying' | 'creating' | 'done' | 'error'
interface FeeInfo { microAlgo: number; algoNeeded: string; algoUsd: number; feeUsd: number }

const STEP_LABELS: Record<Step, string> = {
  'idle':             '',
  'fetching-fee':     'Fetching platform fee...',
  'awaiting-payment': 'Waiting for Pera Wallet payment...',
  'verifying':        'Verifying payment & processing x402...',
  'creating':         'Creating campaign on Algorand...',
  'done':             'Campaign created!',
  'error':            '',
}

const PROGRESS_STEPS: Step[] = ['fetching-fee', 'awaiting-payment', 'verifying', 'creating']
const PROGRESS_LABELS = ['Fee', 'Pay', 'Verify', 'Create']

export default function CreateCampaign() {
  const { createCampaign, isConnected, account, algodClient, peraWallet } = useWallet()
  const router = useRouter()
  const [step, setStep]       = useState<Step>('idle')
  const [errMsg, setErrMsg]   = useState('')
  const [feeInfo, setFeeInfo] = useState<FeeInfo | null>(null)
  const [form, setForm] = useState({
    charityType: 0, goalAlgo: '', influencerName: '', profileImageURL: ''
  })

  // Pre-fetch fee so user sees it before clicking
  useEffect(() => {
    if (!isConnected) return
    fetch('/api/algo-fee').then(r => r.json()).then(setFeeInfo).catch(() => {})
  }, [isConnected])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !account) return
    setErrMsg('')

    try {
      // Step 1: fetch current fee
      setStep('fetching-fee')
      const feeRes = await fetch('/api/algo-fee')
      if (!feeRes.ok) throw new Error('Could not fetch platform fee')
      const fee: FeeInfo = await feeRes.json()
      setFeeInfo(fee)

      // Step 2: user pays platform fee in ALGO via Pera
      setStep('awaiting-payment')
      const serverAddr = process.env.NEXT_PUBLIC_SERVER_ALGO_ADDRESS
      if (!serverAddr) throw new Error('Platform address not configured')

      const sp = await algodClient.getTransactionParams().do()
      const feeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender:          account,
        receiver:        serverAddr,
        amount:          fee.microAlgo,
        suggestedParams: sp,
        note:            new TextEncoder().encode('x402-campaign-fee'),
      })

      const signed = await peraWallet.signTransaction([[{ txn: feeTxn, signers: [account] }]])
      const { txid } = await algodClient.sendRawTransaction(signed).do()
      await algosdk.waitForConfirmation(algodClient, txid, 6)

      // Step 3: backend verifies + triggers x402 on Base
      setStep('verifying')
      const verifyRes = await fetch('/api/verify-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ txId: txid, expectedMicroAlgo: fee.microAlgo }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.approved) {
        throw new Error(verifyData.error || 'Payment verification failed')
      }

      // Step 4: create campaign on Algorand
      setStep('creating')
      const goalMicro = Math.round(parseFloat(form.goalAlgo) * 1_000_000)
      await createCampaign(
        form.charityType,
        goalMicro,
        form.influencerName,
        form.profileImageURL || 'https://via.placeholder.com/150'
      )

      setStep('done')
      setTimeout(() => router.push('/dashboard'), 1500)

    } catch (e: any) {
      setErrMsg(e?.message || 'Something went wrong')
      setStep('error')
    }
  }

  if (!isConnected) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your Pera Wallet to create a campaign</p>
      </div>
    </div>
  )

  const isLoading = PROGRESS_STEPS.includes(step as any)

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-8">

          <div className="text-center mb-8">
            <div className="bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Campaign</h1>
            <p className="text-gray-400">Start your fundraising journey on Algorand</p>
          </div>

          {/* Progress stepper */}
          <AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center space-x-3 mb-3">
                  <Loader2 className="h-5 w-5 text-primary-400 animate-spin flex-shrink-0" />
                  <span className="text-gray-200 text-sm">{STEP_LABELS[step]}</span>
                </div>
                <div className="flex items-center">
                  {PROGRESS_STEPS.map((s, i) => {
                    const currentIdx = PROGRESS_STEPS.indexOf(step as any)
                    const done   = i < currentIdx
                    const active = i === currentIdx
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full transition-colors ${
                            done ? 'bg-green-500' : active ? 'bg-primary-400 ring-2 ring-primary-400/30' : 'bg-gray-600'
                          }`} />
                          <span className="text-xs text-gray-500 mt-1">{PROGRESS_LABELS[i]}</span>
                        </div>
                        {i < PROGRESS_STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-4 mx-1 transition-colors ${done ? 'bg-green-500' : 'bg-gray-600'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success */}
          <AnimatePresence>
            {step === 'done' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-950 border border-green-800 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300">Campaign created! Redirecting to dashboard...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {step === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-6 p-4 bg-red-950 border border-red-800 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-medium">Creation failed</p>
                  <p className="text-red-400 text-sm mt-1">{errMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Charity Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {charityTypes.map((type, i) => {
                  const Icon = type.icon
                  return (
                    <motion.button key={i} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setForm(p => ({ ...p, charityType: i }))}
                      className={`p-4 rounded-lg border-2 transition-all ${form.charityType === i
                        ? 'border-primary-500 bg-primary-950'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800'}`}>
                      <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-200">{type.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
              <input type="text" required className="input-field" placeholder="Enter campaign name"
                value={form.influencerName} onChange={e => setForm(p => ({ ...p, influencerName: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Goal Amount (ALGO)</label>
              <input type="number" required min="1" step="0.1" className="input-field" placeholder="e.g. 100"
                value={form.goalAlgo} onChange={e => setForm(p => ({ ...p, goalAlgo: e.target.value }))} />
              <p className="text-xs text-gray-500 mt-1">1 ALGO = 1,000,000 microALGO</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Profile Image URL (Optional)</label>
              <input type="url" className="input-field" placeholder="https://example.com/image.jpg"
                value={form.profileImageURL} onChange={e => setForm(p => ({ ...p, profileImageURL: e.target.value }))} />
            </div>

            <motion.button type="submit" disabled={isLoading || step === 'done'}
              whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading
                ? <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" /><span>{STEP_LABELS[step]}</span>
                  </div>
                : step === 'done' ? 'Done!' : 'Create Campaign'}
            </motion.button>
          </form>

          {/* Fee info */}
          <div className="mt-6 p-4 bg-blue-950 border border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-300 mb-2">Campaign creation requires two steps:</h3>
            <ul className="text-sm text-blue-400 space-y-1">
              <li>1. Pay platform fee in ALGO via Pera
                {feeInfo && feeInfo.algoUsd > 0 && (
                  <span className="text-blue-300 ml-1">
                    (~{feeInfo.algoNeeded} ALGO ≈ ${feeInfo.feeUsd} USD)
                  </span>
                )}
              </li>
              <li>2. Sign the campaign creation transaction in Pera</li>
              <li className="text-blue-500 text-xs mt-1">
                The fee is verified on-chain and relayed as an x402 payment on Base network
              </li>
            </ul>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
