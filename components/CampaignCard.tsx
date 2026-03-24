'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, Utensils, Heart, GraduationCap, Wrench, Waves } from 'lucide-react'
import { Campaign } from '@/contexts/WalletContext'

interface Props { campaign: Campaign }

const charityTypes  = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'River Cleaning']
const charityIcons  = [Home, Utensils, Heart, GraduationCap, Wrench, Waves]
const charityColors = ['charity-housing','charity-meals','charity-medical','charity-education','charity-equipment','charity-rivercleaning']

export default function CampaignCard({ campaign }: Props) {
  const Icon       = charityIcons[campaign.charityType]
  const colorClass = charityColors[campaign.charityType]
  const raised     = campaign.totalDonations / 1_000_000
  const goal       = campaign.goalAmount / 1_000_000
  const progress   = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5 }}
      className="card hover:shadow-2xl hover:border-gray-700 transition-all duration-300">
      <div className={colorClass + ' h-32 flex items-center justify-center'}>
        <Icon className="h-16 w-16 text-white" />
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{campaign.influencerName}</h3>
            <p className="text-sm text-gray-400">{charityTypes[campaign.charityType]}</p>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium text-gray-200">{raised.toFixed(2)} / {goal.toFixed(2)} ALGO</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% funded</p>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
          <span>{raised.toFixed(4)} ALGO raised</span>
          <span className={campaign.active ? 'px-2 py-1 rounded-full text-xs bg-green-900 text-green-300' : 'px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400'}>
            {campaign.active ? 'Active' : 'Completed'}
          </span>
        </div>
        <Link href={'/campaign/' + campaign.campaignId}>
          <button className="w-full btn-primary">View Campaign</button>
        </Link>
      </div>
    </motion.div>
  )
}