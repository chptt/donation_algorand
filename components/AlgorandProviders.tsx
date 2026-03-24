'use client'

import { ReactNode } from 'react'
import { WalletProvider as UseWalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react'
import { WalletProvider } from '@/contexts/WalletContext'

const manager = new WalletManager({
  wallets: [
    WalletId.DEFLY,
    WalletId.PERA,
    WalletId.EXODUS,
    WalletId.LUTE,
    {
      id: WalletId.MNEMONIC,
      options: { persistToStorage: false },
    },
    {
      id: WalletId.WALLETCONNECT,
      options: { projectId: 'fcfde0713d43baa0d23be0773c80a72b' },
    },
  ],
  network: NetworkId.TESTNET,
} as any)

export default function AlgorandProviders({ children }: { children: ReactNode }) {
  return (
    <UseWalletProvider manager={manager}>
      <WalletProvider>
        {children}
      </WalletProvider>
    </UseWalletProvider>
  )
}
