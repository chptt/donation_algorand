'use client'

import { ReactNode } from 'react'
import { WalletProvider as UseWalletProvider, WalletManager, WalletId, NetworkId } from '@txnlab/use-wallet-react'
import { WalletProvider } from '@/contexts/WalletContext'

const manager = new WalletManager({
  wallets: [WalletId.PERA],
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
