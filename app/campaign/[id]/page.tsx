'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet, Campaign, DONATION_AMOUNT_MICRO } from '@/contexts/WalletContext'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves, Coins, Clock, User } from 'lucide-react'

const charityTypes  = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'River Cleaning']
const charityIcons  = [Home, Utensils, Heart, GraduationCap, Wrench, Waves]
const charityColors = ['charity-housing','charity-meals','charity-medical','charity-education','charity-equipment','charity-rivercleaning']

export default function CampaignDetail({ params }: { params: { id: string } }) {
  const { getCampaign, donate, isConnected, account } = useWallet()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading]   = useState(true)
  const [donating, setDonating] = useState(false)

  useEffect(() => { fetchCampaign() }, [params.id])

  const fetchCampaign = async () => {
    setLoading(true)
    try {
      const c = await getCampaign(parseInt(params.id))
      setCampaign(c)
    } catch (e) { console.error(e) }
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
      const msg = e?.message || 'Unknown error'
      alert(`Donation failed: ${msg}`)
    } finally { setDonating(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  )

  if (!campaign) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
        <p className="text-gray-600">The campaign you're looking for doesn't exist.</p>
      </div>
    </div>
  )

  const Icon       = charityIcons[campaign.charityType]
  const colorClass = charityColors[campaign.charityType]
  const raised     = campaign.totalDonations / 1_000_000
  const goal       = campaign.goalAmount / 1_000_000
  const progress   = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
  const donationAlgo = DONATION_AMOUNT_MICRO / 1_000_000

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className={`h-48 ${colorClass} flex items-center justify-center relative`}>
            <Icon className="h-24 w-24 text-white" />
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {campaign.active ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-15 h-15 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{campaign.influencerName}</h1>
                <p className="text-lg text-gray-600">{charityTypes[campaign.charityType]} Campaign</p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Campaign Progress</h2>
                <span className="text-2xl font-bold text-primary-600">{progress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="bg-primary-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-900">{raised.toFixed(4)} ALGO</p>
                  <p className="text-sm text-gray-600">Raised</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-900">{goal.toFixed(4)} ALGO</p>
                  <p className="text-sm text-gray-600">Goal</p>
                </div>
              </div>
            </div>

            {/* Donate */}
            {campaign.active && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-primary-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Make a Donation</h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-primary-600" />
                    <span className="text-lg font-medium">Fixed Amount: {donationAlgo} ALGO</span>
                  </div>
                  <span className="text-sm text-gray-500">≈ ${(donationAlgo * 0.18).toFixed(2)} USD</span>
                </div>
                {isConnected ? (
                  <motion.button onClick={handleDonate} disabled={donating}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {donating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Processing...</span>
                      </div>
                    ) : `Donate ${donationAlgo} ALGO`}
                  </motion.button>
                ) : (
                  <p className="text-center text-gray-600">Connect your Pera Wallet to donate</p>
                )}
              </motion.div>
            )}

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Creator</p>
                  <p className="font-medium text-gray-900 text-xs break-all">{campaign.creator.slice(0,8)}...{campaign.creator.slice(-4)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{new Date(campaign.createdAt * 1000).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Coins className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Total Raised</p>
                  <p className="font-medium text-gray-900">{raised.toFixed(4)} ALGO</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
