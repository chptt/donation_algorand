'use client'

import { ReactNode } from 'react'
import { WalletProvider } from '@/contexts/WalletContext'

export default function AlgorandProviders({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  )
}