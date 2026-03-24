'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet, Campaign } from '@/contexts/WalletContext'
import Link from 'next/link'
import { BarChart3, Coins, TrendingUp, Wallet, Eye, Download, Heart } from 'lucide-react'

const charityTypes = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'River Cleaning']

export default function Dashboard() {
  const { getCampaignsByCreator, withdraw, account, isConnected } = useWallet()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading]     = useState(true)
  const [withdrawing, setWithdrawing] = useState<number | null>(null)

  useEffect(() => { if (isConnected && account) fetchCampaigns() }, [account, isConnected])

  const fetchCampaigns = async () => {
    setLoading(true)
    try { setCampaigns(await getCampaignsByCreator(account!)) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleWithdraw = async (id: number) => {
    setWithdrawing(id)
    try {
      await withdraw(id)
      await fetchCampaigns()
      alert('Withdrawal successful!')
    } catch (e: any) {
      alert(`Withdrawal failed: ${e?.message || 'Please try again.'}`)
    } finally { setWithdrawing(null) }
  }

  const totalRaised = campaigns.reduce((s, c) => s + c.totalDonations, 0) / 1_000_000
  const totalGoal   = campaigns.reduce((s, c) => s + c.goalAmount, 0) / 1_000_000
  const active      = campaigns.filter(c => c.active).length

  if (!isConnected) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your Pera Wallet to view your dashboard</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your Algorand campaigns</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Campaigns', value: campaigns.length, icon: BarChart3, color: 'primary' },
            { label: 'Active Campaigns', value: active, icon: TrendingUp, color: 'green' },
            { label: 'Total Raised (ALGO)', value: totalRaised.toFixed(2), icon: Coins, color: 'blue' },
            { label: 'Total Goal (ALGO)', value: totalGoal.toFixed(2), icon: TrendingUp, color: 'purple' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                </div>
                <Icon className={`h-8 w-8 text-${color}-600`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No campaigns yet</p>
              <Link href="/create"><button className="btn-primary">Create Your First Campaign</button></Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Campaign','Type','Goal (ALGO)','Raised (ALGO)','Status','Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map(c => {
                    const raised   = c.totalDonations / 1_000_000
                    const goal     = c.goalAmount / 1_000_000
                    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
                    return (
                      <tr key={c.campaignId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                              <Heart className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{c.influencerName}</div>
                              <div className="text-sm text-gray-500">ID: {c.campaignId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{charityTypes[c.charityType]}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{raised.toFixed(4)}</div>
                          <div className="text-xs text-gray-500">{progress.toFixed(1)}% of goal</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${c.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {c.active ? 'Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link href={`/campaign/${c.campaignId}`}>
                            <button className="text-primary-600 hover:text-primary-900 inline-flex items-center space-x-1">
                              <Eye className="h-4 w-4" /><span>View</span>
                            </button>
                          </Link>
                          {c.active && c.totalDonations > 0 && (
                            <button onClick={() => handleWithdraw(c.campaignId)} disabled={withdrawing === c.campaignId}
                              className="text-green-600 hover:text-green-900 inline-flex items-center space-x-1 disabled:opacity-50">
                              {withdrawing === c.campaignId
                                ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                                : <Download className="h-4 w-4" />}
                              <span>Withdraw</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
