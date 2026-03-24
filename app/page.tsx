'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet, Campaign } from '@/contexts/WalletContext'
import CampaignCard from '@/components/CampaignCard'
import { Heart, TrendingUp, Users, Coins, Plus } from 'lucide-react'

export default function Home() {
  const { getAllCampaigns, appId } = useWallet()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalCampaigns: 0, totalRaised: 0, activeCampaigns: 0 })

  useEffect(() => { fetchCampaigns() }, [appId])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const all = await getAllCampaigns()
      setCampaigns(all)
      const totalRaised = all.reduce((s, c) => s + c.totalDonations, 0)
      setStats({ totalCampaigns: all.length, totalRaised, activeCampaigns: all.filter(c => c.active).length })
    } catch (e) {
      console.error('Error fetching campaigns:', e)
    } finally {
      setLoading(false)
    }
  }

  const microToAlgo = (micro: number) => (micro / 1_000_000).toFixed(2)

  const statItems = [
    { icon: Heart,      bg: 'bg-primary-900', fg: 'text-primary-400', label: 'TOTAL CAMPAIGNS',  value: stats.totalCampaigns },
    { icon: Coins,      bg: 'bg-green-900',   fg: 'text-green-400',   label: 'TOTAL RAISED',     value: microToAlgo(stats.totalRaised) + ' ALGO' },
    { icon: TrendingUp, bg: 'bg-orange-900',  fg: 'text-orange-400',  label: 'ACTIVE CAMPAIGNS', value: stats.activeCampaigns },
    { icon: Users,      bg: 'bg-purple-900',  fg: 'text-purple-400',  label: 'DONORS',           value: '1000+' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Hero */}
      <section className="hero-bg py-24 px-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-block text-xs font-semibold tracking-widest text-primary-400 uppercase bg-primary-900/50 border border-primary-800 px-4 py-1.5 rounded-full mb-6">
              Powered by Algorand
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              Support Creators<br />
              <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                With Transparency
              </span>
            </h1>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Every donation is tracked on-chain. Support meaningful causes and see exactly where your ALGO goes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#campaigns">
                <button className="btn-primary text-base px-8 py-3 rounded-xl">Explore Campaigns</button>
              </a>
              <a href="/create">
                <button className="btn-secondary text-base px-8 py-3 rounded-xl flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Start a Campaign
                </button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map(({ icon: Icon, bg, fg, label, value }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-gray-900/60 border border-gray-700 rounded-2xl px-4 py-5 text-center">
              <div className={bg + ' w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3'}>
                <Icon className={'h-5 w-5 ' + fg} />
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Campaigns */}
      <section id="campaigns" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white">Active Campaigns</h2>
              <p className="text-gray-500 mt-1">Support these causes and make a real difference</p>
            </div>
            <a href="/create">
              <button className="btn-primary text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" /> New Campaign
              </button>
            </a>
          </motion.div>

          {appId === 0 ? (
            <div className="text-center py-20 bg-yellow-950 rounded-2xl border border-yellow-800">
              <p className="text-yellow-300 text-lg font-medium">App not deployed yet.</p>
              <p className="text-yellow-500 mt-2 text-sm">Set <code className="bg-yellow-900 px-1 rounded">NEXT_PUBLIC_ALGORAND_APP_ID</code> in your <code className="bg-yellow-900 px-1 rounded">.env.local</code></p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
            </div>
          ) : campaigns.filter(c => c.active).length === 0 ? (
            <div className="text-center py-24 border border-dashed border-gray-700 rounded-2xl">
              <Heart className="h-14 w-14 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-1">No active campaigns yet</p>
              <p className="text-gray-600 text-sm mb-6">Be the first to start one</p>
              <a href="/create"><button className="btn-primary px-8">Create Campaign</button></a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.filter(c => c.active).map(c => (
                <CampaignCard key={c.campaignId} campaign={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}