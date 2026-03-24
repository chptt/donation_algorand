'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet, Campaign } from '@/contexts/WalletContext'
import Link from 'next/link'
import { History, Heart, Coins, Calendar, Eye } from 'lucide-react'

const charityTypes = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'River Cleaning']

interface Contribution { campaign: Campaign; donationAmount: number }

export default function Contributions() {
  const { getAllCampaigns, getDonorAmount, account, isConnected } = useWallet()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (isConnected && account) fetchContributions() }, [account, isConnected])

  const fetchContributions = async () => {
    setLoading(true)
    try {
      const all = await getAllCampaigns()
      const results: Contribution[] = []
      for (const c of all) {
        const amt = await getDonorAmount(c.campaignId, account!)
        if (amt > 0) results.push({ campaign: c, donationAmount: amt })
      }
      setContributions(results)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const totalAlgo = contributions.reduce((s, c) => s + c.donationAmount, 0) / 1_000_000
  const avgAlgo   = contributions.length > 0 ? totalAlgo / contributions.length : 0

  if (!isConnected) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400">Please connect your Pera Wallet to view your contributions</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Contributions</h1>
          <p className="text-gray-400">Track your donation history on Algorand</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Contributions',    value: contributions.length,    icon: Heart,   fg: 'text-primary-400', bg: 'bg-primary-900' },
            { label: 'Total Donated (ALGO)',   value: totalAlgo.toFixed(4),    icon: Coins,   fg: 'text-green-400',   bg: 'bg-green-900' },
            { label: 'Average Donation (ALGO)',value: avgAlgo.toFixed(4),      icon: History, fg: 'text-blue-400',    bg: 'bg-blue-900' },
          ].map(({ label, value, icon: Icon, fg, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${fg}`}>{value}</p>
                </div>
                <div className={`${bg} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${fg}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Donation History</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">You have not made any donations yet</p>
              <Link href="/"><button className="btn-primary">Explore Campaigns</button></Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {contributions.map(({ campaign: c, donationAmount }) => {
                const algo = donationAmount / 1_000_000
                return (
                  <motion.div key={c.campaignId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-6 hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{c.influencerName}</h3>
                          <p className="text-sm text-gray-400">{charityTypes[c.charityType]} Campaign</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(c.createdAt * 1000).toLocaleDateString()}</span>
                            </span>
                            <span>Campaign ID: {c.campaignId}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">{algo.toFixed(4)} ALGO</div>
                        <Link href={`/campaign/${c.campaignId}`}>
                          <button className="mt-2 text-primary-400 hover:text-primary-300 inline-flex items-center space-x-1 text-sm">
                            <Eye className="h-4 w-4" /><span>View Campaign</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {contributions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-primary-900 to-blue-900 border border-primary-800 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Your Impact</h3>
            <p className="text-primary-300 mb-4">Thank you for your generosity on Algorand!</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center"><div className="text-2xl font-bold">{contributions.length}</div><div className="text-sm text-primary-300">Campaigns Supported</div></div>
              <div className="text-center"><div className="text-2xl font-bold">{totalAlgo.toFixed(2)}</div><div className="text-sm text-primary-300">ALGO Donated</div></div>
              <div className="text-center"><div className="text-2xl font-bold">{new Set(contributions.map(c => charityTypes[c.campaign.charityType])).size}</div><div className="text-sm text-primary-300">Cause Types</div></div>
              <div className="text-center"><div className="text-2xl font-bold">100%</div><div className="text-sm text-primary-300">Transparency</div></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
