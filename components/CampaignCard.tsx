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
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -6 }}
      className="card hover:shadow-2xl hover:border-gray-700 transition-all duration-300">

      {/* Banner */}
      <div className={colorClass + ' h-36 flex items-center justify-center relative'}>
        <Icon className="h-14 w-14 text-white/80" />
        <span className="absolute top-3 left-3 text-xs font-semibold bg-black/40 text-white px-2 py-1 rounded-full">
          {charityTypes[campaign.charityType]}
        </span>
        <span className={
          'absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ' +
          (campaign.active ? 'bg-green-900/80 text-green-300' : 'bg-gray-700/80 text-gray-400')
        }>
          {campaign.active ? 'Active' : 'Completed'}
        </span>
      </div>

      <div className="p-5">
        {/* Creator row */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center shrink-0">
            <Heart className="h-4 w-4 text-gray-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{campaign.influencerName}</h3>
            <p className="text-xs text-gray-500">Campaign #{campaign.campaignId}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{raised.toFixed(2)} ALGO raised</span>
            <span className="text-primary-400 font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-primary-500 to-blue-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: progress + '%' }} />
          </div>
          <p className="text-xs text-gray-600 mt-1">Goal: {goal.toFixed(2)} ALGO</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={'/campaign/' + campaign.campaignId} className="flex-1">
            <button className="w-full btn-secondary text-sm py-2">Details</button>
          </Link>
          <Link href={'/campaign/' + campaign.campaignId} className="flex-1">
            <button className="w-full btn-primary text-sm py-2">Donate</button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}