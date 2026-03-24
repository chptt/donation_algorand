'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { useRouter } from 'next/navigation'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves, Plus } from 'lucide-react'

const charityTypes = [
  { name: 'Housing',       icon: Home,          color: 'charity-housing' },
  { name: 'Meals',         icon: Utensils,       color: 'charity-meals' },
  { name: 'Medical',       icon: Heart,          color: 'charity-medical' },
  { name: 'Education',     icon: GraduationCap,  color: 'charity-education' },
  { name: 'Equipment',     icon: Wrench,         color: 'charity-equipment' },
  { name: 'River Cleaning',icon: Waves,          color: 'charity-rivercleaning' },
]

export default function CreateCampaign() {
  const { createCampaign, isConnected } = useWallet()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ charityType: 0, goalAlgo: '', influencerName: '', profileImageURL: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected) return
    setLoading(true)
    try {
      const goalMicro = Math.round(parseFloat(form.goalAlgo) * 1_000_000)
      await createCampaign(
        form.charityType,
        goalMicro,
        form.influencerName,
        form.profileImageURL || 'https://via.placeholder.com/150'
      )
      router.push('/dashboard')
    } catch (e: any) {
      console.error(e)
      alert(`Error creating campaign: ${e?.message || 'Please try again.'}`)
    } finally { setLoading(false) }
  }

  if (!isConnected) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your Pera Wallet to create a campaign</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
            <p className="text-gray-600">Start your fundraising journey on Algorand</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Charity type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Charity Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {charityTypes.map((type, i) => {
                  const Icon = type.icon
                  return (
                    <motion.button key={i} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setForm(p => ({ ...p, charityType: i }))}
                      className={`p-4 rounded-lg border-2 transition-all ${form.charityType === i ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
              <input type="text" required className="input-field" placeholder="Enter campaign name"
                value={form.influencerName} onChange={e => setForm(p => ({ ...p, influencerName: e.target.value }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Goal Amount (ALGO)</label>
              <input type="number" required min="1" step="0.1" className="input-field" placeholder="e.g. 100"
                value={form.goalAlgo} onChange={e => setForm(p => ({ ...p, goalAlgo: e.target.value }))} />
              <p className="text-xs text-gray-500 mt-1">1 ALGO = 1,000,000 microALGO</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL (Optional)</label>
              <input type="url" className="input-field" placeholder="https://example.com/image.jpg"
                value={form.profileImageURL} onChange={e => setForm(p => ({ ...p, profileImageURL: e.target.value }))} />
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Creating Campaign...</span>
                </div>
              ) : 'Create Campaign'}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your campaign is stored on the Algorand blockchain</li>
              <li>• Donors contribute 1 ALGO per donation</li>
              <li>• You can withdraw funds at any time</li>
              <li>• All transactions are transparent and verifiable</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
