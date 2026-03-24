'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { useWallet as useUseWallet } from '@txnlab/use-wallet-react'
import { motion } from 'framer-motion'
import { Wallet, Heart, Plus, BarChart3, History } from 'lucide-react'

export default function Navbar() {
  const { account, isConnected } = useWallet()
  const { wallets, activeWallet } = useUseWallet()

  const fmt = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4)
  const peraWallet = wallets?.find(w => w.id === 'pera')

  const handleConnect = async () => {
    if (!peraWallet) return
    // If already connected, disconnect first then reconnect
    try {
      if (peraWallet.isConnected) {
        await peraWallet.disconnect()
      }
      await peraWallet.connect()
    } catch (e: any) {
      if (e?.message?.includes('Session currently connected')) {
        // Already connected — just ignore, wallet state will sync
        return
      }
      console.error(e)
    }
  }

  const handleDisconnect = () => activeWallet?.disconnect()

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-white">DonateChain</span>
            <span className="text-xs bg-primary-900 text-primary-300 px-2 py-0.5 rounded-full font-medium">Algorand</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link>
            <Link href="/create" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm">
              <Plus className="h-4 w-4" /><span>Create</span>
            </Link>
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm">
              <BarChart3 className="h-4 w-4" /><span>Dashboard</span>
            </Link>
            <Link href="/contributions" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm">
              <History className="h-4 w-4" /><span>Contributions</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 font-mono bg-gray-800 px-3 py-1 rounded-full">{fmt(account!)}</span>
                <button onClick={handleDisconnect} className="btn-secondary text-sm py-1.5">Disconnect</button>
              </div>
            ) : (
              <button onClick={handleConnect} className="btn-primary flex items-center space-x-2 py-1.5">
                <Wallet className="h-4 w-4" /><span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}