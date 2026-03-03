'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'
import { ethers } from 'ethers'
import Link from 'next/link'
import { History, Heart, DollarSign, Calendar, Eye } from 'lucide-react'

interface Contribution {
  tokenId: number
  campaign: {
    influencerName: string
    profileImageURL: string
    charityType: number
    creator: string
    createdAt: number
  }
  donationAmount: string
}

const charityTypes = ['Housing', 'Meals', 'Medical', 'Education', 'Equipment', 'RiverCleaning']

export default function Contributions() {
  const { contract, account, isConnected, ethPrice } = useWallet()
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && account) {
      fetchUserContributions()
    }
  }, [contract, account, isConnected])

  const fetchUserContributions = async () => {
    if (!contract || !account) return
    
    try {
      const contributedTokenIds = await contract.getUserContributions(account)
      
      const contributionPromises = contributedTokenIds.map(async (tokenId: bigint) => {
        const campaignData = await contract.campaigns(tokenId)
        const donationAmount = await contract.getUserDonationAmount(account, tokenId)
        
        return {
          tokenId: Number(tokenId),
          campaign: {
            influencerName: campaignData.influencerName,
            profileImageURL: campaignData.profileImageURL,
            charityType: Number(campaignData.charityType),
            creator: campaignData.creator,
            createdAt: Number(campaignData.createdAt)
          },
          donationAmount: donationAmount.toString()
        }
      })
      
      const userContributions = await Promise.all(contributionPromises)
      setContributions(userContributions)
    } catch (error: any) {
      console.error('Error fetching user contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalContributions = () => {
    // Calculate total based on actual ETH donated: each 0.0003 ETH = $1
    return contributions.reduce((sum: number, contribution: any) => {
      const donationInETH = Number(ethers.formatEther(contribution.donationAmount))
      const donationInUSD = (donationInETH / 0.0003) * 1.00
      return sum + donationInUSD
    }, 0)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your contributions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Contributions</h1>
          <p className="text-gray-600">Track your donation history and impact</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contributions</p>
                <p className="text-2xl font-bold text-primary-600">{contributions.length}</p>
              </div>
              <Heart className="h-8 w-8 text-primary-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donated</p>
                <p className="text-2xl font-bold text-green-600">${calculateTotalContributions().toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Donation</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${contributions.length > 0 ? (calculateTotalContributions() / contributions.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <History className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>
        </div>

        {/* Contributions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Donation History</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't made any donations yet</p>
              <Link href="/">
                <button className="btn-primary">Explore Campaigns</button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {contributions.map((contribution) => {
                const donationInETH = Number(ethers.formatEther(contribution.donationAmount))
                // Calculate actual USD value: each 0.0003 ETH = $1
                const donationInUSD = (donationInETH / 0.0003) * 1.00

                return (
                  <motion.div
                    key={`${contribution.tokenId}-${contribution.donationAmount}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <Heart className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contribution.campaign.influencerName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {charityTypes[contribution.campaign.charityType]} Campaign
                          </p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(contribution.campaign.createdAt * 1000).toLocaleDateString()}</span>
                            </span>
                            <span>Campaign ID: {contribution.tokenId}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${donationInUSD.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donationInETH.toFixed(4)} ETH
                        </div>
                        <Link href={`/campaign/${contribution.tokenId}`}>
                          <button className="mt-2 text-primary-600 hover:text-primary-800 inline-flex items-center space-x-1 text-sm">
                            <Eye className="h-4 w-4" />
                            <span>View Campaign</span>
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

        {/* Impact Summary */}
        {contributions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-gradient-to-r from-primary-500 to-blue-600 rounded-lg p-6 text-white"
          >
            <h3 className="text-xl font-semibold mb-2">Your Impact</h3>
            <p className="text-primary-100 mb-4">
              Thank you for your generosity! Your contributions are making a real difference in the world.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{contributions.length}</div>
                <div className="text-sm text-primary-100">Campaigns Supported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${calculateTotalContributions().toFixed(0)}</div>
                <div className="text-sm text-primary-100">Total Donated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {new Set(contributions.map(c => charityTypes[c.campaign.charityType])).size}
                </div>
                <div className="text-sm text-primary-100">Cause Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-primary-100">Transparency</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}