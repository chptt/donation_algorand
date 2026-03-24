'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useWallet as useUseWallet } from '@txnlab/use-wallet-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, Heart, Plus, BarChart3, History, X, KeyRound } from 'lucide-react'

export default function Navbar() {
  const { account, isConnected } = useWallet()
  const { wallets, activeWallet } = useUseWallet()
  const [showModal, setShowModal] = useState(false)
  const [mnemonic, setMnemonic] = useState('')
  const [mnemonicWallet, setMnemonicWallet] = useState<any>(null)

  const fmt = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleConnect = async (wallet: any) => {
    if (wallet.id === 'mnemonic') {
      setMnemonicWallet(wallet)
      return
    }
    try {
      await wallet.connect()
      setShowModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleMnemonicConnect = async () => {
    if (!mnemonicWallet || !mnemonic.trim()) return
    try {
      await mnemonicWallet.connect({ mnemonic: mnemonic.trim() })
      setShowModal(false)
      setMnemonic('')
      setMnemonicWallet(null)
    } catch (e: any) {
      alert('Invalid mnemonic: ' + (e?.message || e))
    }
  }

  const handleDisconnect = () => activeWallet?.disconnect()

  return (
    <>
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="bg-white shadow-lg border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">DonateChain</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Algorand</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">Home</Link>
              <Link href="/create" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                <Plus className="h-4 w-4" /><span>Create Campaign</span>
              </Link>
              <Link href="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                <BarChart3 className="h-4 w-4" /><span>Dashboard</span>
              </Link>
              <Link href="/contributions" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                <History className="h-4 w-4" /><span>My Contributions</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 font-mono">{fmt(account!)}</span>
                  <button onClick={handleDisconnect} className="btn-secondary text-sm">Disconnect</button>
                </div>
              ) : (
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
                  <Wallet className="h-4 w-4" /><span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowModal(false); setMnemonicWallet(null); setMnemonic('') }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {mnemonicWallet ? 'Enter Mnemonic' : 'Connect Wallet'}
                </h2>
                <button onClick={() => { setShowModal(false); setMnemonicWallet(null); setMnemonic('') }}
                  className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
              </div>

              {mnemonicWallet ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Enter your 25-word Algorand mnemonic (testnet account)</p>
                  <textarea
                    value={mnemonic}
                    onChange={e => setMnemonic(e.target.value)}
                    placeholder="word1 word2 word3 ... word25"
                    rows={4}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setMnemonicWallet(null)} className="btn-secondary flex-1 text-sm">Back</button>
                    <button onClick={handleMnemonicConnect} className="btn-primary flex-1 text-sm">Connect</button>
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    For testing only. Never enter a mainnet mnemonic here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {wallets?.map(wallet => (
                    <button key={wallet.id} onClick={() => handleConnect(wallet)}
                      className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all">
                      {wallet.id === 'mnemonic' ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <KeyRound className="h-4 w-4 text-amber-600" />
                        </div>
                      ) : wallet.metadata.icon ? (
                        <img src={wallet.metadata.icon} alt={wallet.metadata.name} className="w-8 h-8 rounded-lg" />
                      ) : null}
                      <div className="text-left">
                        <span className="font-medium text-gray-800 block">{wallet.metadata.name}</span>
                        {wallet.id === 'mnemonic' && (
                          <span className="text-xs text-amber-600">For testing — paste your mnemonic</span>
                        )}
                      </div>
                    </button>
                  ))}
                  <p className="text-xs text-gray-400 mt-2 text-center">Make sure your wallet is set to Testnet</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}