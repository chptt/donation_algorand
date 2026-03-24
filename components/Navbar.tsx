'use client'

import Link from 'next/link'
import { useWallet } from '@/contexts/WalletContext'
import { useWallet as useUseWallet } from '@txnlab/use-wallet-react'
import { motion } from 'framer-motion'
import { Wallet, Heart, Plus, BarChart3, History } from 'lucide-react'

export default function Navbar() {
  const { account, isConnected } = useWallet()
  const { wallets, activeWallet } = useUseWallet()
  const fmt = (addr: string) => addr.slice(0,6) + '...' + addr.slice(-4)
  const peraWallet = wallets?.find(w => w.id === 'pera')
  const handleConnect = async () => { if (!peraWallet) return; try { await peraWallet.connect() } catch (e) { console.error(e) } }
  const handleDisconnect = () => activeWallet?.disconnect()
  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="bg-gray-900 border-b border-gray-800 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-white">DonateChain</span>
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full font-medium">Algorand</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/create" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"><Plus className="h-4 w-4" /><span>Create Campaign</span></Link>
            <Link href="/dashboard" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"><BarChart3 className="h-4 w-4" /><span>Dashboard</span></Link>
            <Link href="/contributions" className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"><History className="h-4 w-4" /><span>My Contributions</span></Link>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 font-mono">{fmt(account!)}</span>
                <button onClick={handleDisconnect} className="btn-secondary text-sm">Disconnect</button>
              </div>
            ) : (
              <button onClick={handleConnect} className="btn-primary flex items-center space-x-2">
                <Wallet className="h-4 w-4" /><span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}