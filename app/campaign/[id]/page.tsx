'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet, Campaign, DONATION_AMOUNT_MICRO } from '@/contexts/WalletContext'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves, Coins, Clock, User } from 'lucide-react'

const charityTypes  = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'River Cleaning']
const charityIcons  = [Home, Utensils, Heart, GraduationCap, Wrench, Waves]
const charityColors = ['charity-housing','charity-meals','charity-medical','charity-education','charity-equipment','charity-rivercleaning']

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const { getCampaign, donate, isConnected } = useWallet()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading]   = useState(true)
  const [donating, setDonating] = useState(false)

  useEffect(() => { fetchCampaign() }, [params.id])

  const fetchCampaign = async () => {
    setLoading(true)
    try { setCampaign(await getCampaign(parseInt(params.id))) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleDonate = async () => {
    if (!campaign) return
    setDonating(true)
    try {
      await donate(campaign.campaignId, DONATION_AMOUNT_MICRO)
      await fetchCampaign()
      alert('Donation successful! Thank you.')
    } catch (e: any) {
      alert('Donation failed: ' + (e?.message || 'Unknown error'))
    } finally { setDonating(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
    </div>
  )

  if (!campaign) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h2>
        <p className="text-gray-400">The campaign you are looking for does not exist.</p>
      </div>
    </div>
  )

  const Icon        = charityIcons[campaign.charityType]
  const colorClass  = charityColors[campaign.charityType]
  const raised      = campaign.totalDonations / 1_000_000
  const goal        = campaign.goalAmount / 1_000_000
  const progress    = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
  const donationAlgo = DONATION_AMOUNT_MICRO / 1_000_000

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">

          <div className={`h-48 ${colorClass} flex items-center justify-center relative`}>
            <Icon className="h-24 w-24 text-white" />
            <div className="absolute top-4 right-4">
              <span className={campaign.active
                ? 'px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-300'
                : 'px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-400'}>
                {campaign.active ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{campaign.influencerName}</h1>
                <p className="text-lg text-gray-400">{charityTypes[campaign.charityType]} Campaign</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Campaign Progress</h2>
                <span className="text-2xl font-bold text-primary-400">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div className="bg-primary-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white">{raised.toFixed(4)} ALGO</p>
                  <p className="text-sm text-gray-400">Raised</p>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-2xl font-bold text-white">{goal.toFixed(4)} ALGO</p>
                  <p className="text-sm text-gray-400">Goal</p>
                </div>
              </div>
            </div>

            {campaign.active && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Make a Donation</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-primary-400" />
                    <span className="text-lg font-medium text-gray-200">Fixed Amount: {donationAlgo} ALGO</span>
                  </div>
                  <span className="text-sm text-gray-500">per donation</span>
                </div>
                {isConnected ? (
                  <button onClick={handleDonate} disabled={donating}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {donating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Processing...</span>
                      </div>
                    ) : `Donate ${donationAlgo} ALGO`}
                  </button>
                ) : (
                  <p className="text-center text-gray-400">Connect your Pera Wallet to donate</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Creator</p>
                  <p className="font-medium text-gray-200 text-sm break-all">{campaign.creator.slice(0,8)}...{campaign.creator.slice(-4)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-200">{new Date(campaign.createdAt * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Coins className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Total Raised</p>
                  <p className="font-medium text-gray-200">{raised.toFixed(4)} ALGO</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
