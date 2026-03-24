'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet, Campaign } from '@/contexts/WalletContext'
import CampaignCard from '@/components/CampaignCard'
import { Heart, TrendingUp, Users, Coins } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gray-950">
      <section className="py-20 px-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Donate with <span className="text-primary-500">Transparency</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Support meaningful causes through Algorand-powered campaigns. Every donation is tracked,
              transparent, and directly impacts the communities that need it most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#campaigns"><button className="btn-primary text-lg px-8 py-3">Explore Campaigns</button></a>
              <a href="/create"><button className="btn-secondary text-lg px-8 py-3">Start a Campaign</button></a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Heart,      bg: 'bg-primary-900', fg: 'text-primary-400', label: 'Total Campaigns',     value: stats.totalCampaigns },
            { icon: Coins,      bg: 'bg-green-900',   fg: 'text-green-400',   label: 'Total Raised (ALGO)', value: microToAlgo(stats.totalRaised) },
            { icon: TrendingUp, bg: 'bg-orange-900',  fg: 'text-orange-400',  label: 'Active Campaigns',    value: stats.activeCampaigns },
            { icon: Users,      bg: 'bg-purple-900',  fg: 'text-purple-400',  label: 'Donors',              value: '1000+' },
          ].map(({ icon: Icon, bg, fg, label, value }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className={`${bg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-8 w-8 ${fg}`} />
              </div>
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              <p className="text-gray-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="campaigns" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Active Campaigns</h2>
            <p className="text-xl text-gray-400">Support these amazing causes and make a real difference</p>
          </motion.div>

          {appId === 0 ? (
            <div className="text-center py-20 bg-yellow-950 rounded-xl border border-yellow-800">
              <p className="text-yellow-300 text-lg font-medium">App not deployed yet.</p>
              <p className="text-yellow-500 mt-2">Set <code className="bg-yellow-900 px-1 rounded">NEXT_PUBLIC_ALGORAND_APP_ID</code> in your <code className="bg-yellow-900 px-1 rounded">.env.local</code> after deploying the contract.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : campaigns.filter(c => c.active).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No active campaigns yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
