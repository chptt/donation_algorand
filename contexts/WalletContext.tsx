'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import algosdk from 'algosdk'
import { PeraWalletConnect } from '@perawallet/connect'

export interface Campaign {
  campaignId: number
  charityType: number
  goalAmount: number
  totalDonations: number
  creator: string
  influencerName: string
  profileImageURL: string
  active: boolean
  createdAt: number
}

interface AlgorandContextType {
  account: string | null
  isConnected: boolean
  algodClient: algosdk.Algodv2
  appId: number
  peraWallet: PeraWalletConnect
  connect: () => Promise<void>
  disconnect: () => void
  createCampaign: (charityType: number, goalMicroAlgo: number, name: string, imageUrl: string) => Promise<void>
  donate: (campaignId: number, amountMicroAlgo: number) => Promise<void>
  withdraw: (campaignId: number) => Promise<void>
  getCampaign: (campaignId: number) => Promise<Campaign | null>
  getAllCampaigns: () => Promise<Campaign[]>
  getTotalCampaigns: () => Promise<number>
  getDonorAmount: (campaignId: number, donor: string) => Promise<number>
  getCampaignsByCreator: (creator: string) => Promise<Campaign[]>
}

const ALGOD_TOKEN  = process.env.NEXT_PUBLIC_ALGOD_TOKEN  || ''
const ALGOD_SERVER = process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://testnet-api.algonode.cloud'
const ALGOD_PORT   = process.env.NEXT_PUBLIC_ALGOD_PORT   || ''
export const APP_ID = parseInt(process.env.NEXT_PUBLIC_ALGORAND_APP_ID || '0')
export const DONATION_AMOUNT_MICRO = 1_000_000

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)
const AlgorandContext = createContext<AlgorandContextType | undefined>(undefined)

// Single shared PeraWalletConnect instance
const peraWallet = new PeraWalletConnect({ chainId: 416002 })

function encodeUint8(v: number): Uint8Array { return new Uint8Array([v]) }

function encodeUint64(v: number | bigint): Uint8Array {
  const buf = new Uint8Array(8)
  let tmp = BigInt(v)
  for (let i = 7; i >= 0; i--) { buf[i] = Number(tmp & BigInt(0xff)); tmp >>= BigInt(8) }
  return buf
}

function encodeString(s: string): Uint8Array {
  const bytes = new TextEncoder().encode(s)
  return new Uint8Array([(bytes.length >> 8) & 0xff, bytes.length & 0xff, ...bytes])
}

function decodeUint64(bytes: Uint8Array, offset = 0): number {
  let v = BigInt(0)
  for (let i = 0; i < 8; i++) v = (v << BigInt(8)) | BigInt(bytes[offset + i])
  return Number(v)
}

function decodeString(bytes: Uint8Array, offset: number): { value: string; end: number } {
  const len = (bytes[offset] << 8) | bytes[offset + 1]
  return { value: new TextDecoder().decode(bytes.slice(offset + 2, offset + 2 + len)), end: offset + 2 + len }
}

function campaignBoxName(campaignId: number): Uint8Array {
  return new Uint8Array([...new TextEncoder().encode('c_'), ...encodeUint64(campaignId)])
}

function donorBoxName(campaignId: number, donor: string): Uint8Array {
  return new Uint8Array([
    ...new TextEncoder().encode('d_'),
    ...algosdk.decodeAddress(donor).publicKey,
    ...encodeUint64(campaignId),
  ])
}

function boxRef(name: Uint8Array): algosdk.BoxReference {
  return { appIndex: 0, name }
}

let METHODS: { create_campaign: Uint8Array; donate: Uint8Array; withdraw: Uint8Array } | null = null
function getMethods() {
  if (!METHODS) {
    METHODS = {
      create_campaign: new Uint8Array(algosdk.ABIMethod.fromSignature('create_campaign(uint8,uint64,string,string)uint64').getSelector()),
      donate:          new Uint8Array(algosdk.ABIMethod.fromSignature('donate(uint64,pay)void').getSelector()),
      withdraw:        new Uint8Array(algosdk.ABIMethod.fromSignature('withdraw(uint64)void').getSelector()),
    }
  }
  return METHODS
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    // Reconnect existing session on page load
    peraWallet.reconnectSession().then(accounts => {
      if (accounts.length > 0) setAccount(accounts[0])
    }).catch(() => {})

    peraWallet.connector?.on('disconnect', () => setAccount(null))
  }, [])

  const connect = async () => {
    try {
      const accounts = await peraWallet.connect()
      setAccount(accounts[0])
    } catch (e: any) {
      if (e?.data?.type !== 'CONNECT_MODAL_CLOSED') throw e
    }
  }

  const disconnect = () => {
    peraWallet.disconnect()
    setAccount(null)
  }

  async function signAndSend(txns: algosdk.Transaction[]): Promise<void> {
    if (!account) throw new Error('Not connected')
    // Build the signerTransactions array Pera expects
    const txnGroup = txns.map(txn => ({ txn, signers: [account] }))
    const signedTxns = await peraWallet.signTransaction([txnGroup])
    const { txid } = await algodClient.sendRawTransaction(signedTxns).do()
    await algosdk.waitForConfirmation(algodClient, txid, 4)
  }

  const createCampaign = async (charityType: number, goalMicroAlgo: number, name: string, imageUrl: string) => {
    if (!account || APP_ID === 0) throw new Error('Not connected or app not deployed')
    const m = getMethods()
    const sp = await algodClient.getTransactionParams().do()
    const info = await algodClient.getApplicationByID(APP_ID).do()
    const gs: any[] = (info.params as any).globalState || []
    const counterEntry = gs.find((s: any) => Buffer.from(s.key, 'base64').toString() === 'campaign_counter')
    const nextId = counterEntry ? Number(counterEntry.value.uint) : 0
    const boxes = [boxRef(campaignBoxName(nextId))]
    const appArgs = [m.create_campaign, encodeUint8(charityType), encodeUint64(goalMicroAlgo), encodeString(name), encodeString(imageUrl)]
    const txn = algosdk.makeApplicationNoOpTxnFromObject({ sender: account, suggestedParams: sp, appIndex: APP_ID, appArgs, boxes })
    await signAndSend([txn])
  }

  const donate = async (campaignId: number, amountMicroAlgo: number) => {
    if (!account || APP_ID === 0) throw new Error('Not connected')
    const m = getMethods()
    const sp = await algodClient.getTransactionParams().do()
    const appAddress = algosdk.getApplicationAddress(APP_ID)
    const boxes = [boxRef(campaignBoxName(campaignId)), boxRef(donorBoxName(campaignId, account))]
    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({ sender: account, receiver: appAddress, amount: amountMicroAlgo, suggestedParams: sp })
    const appTxn = algosdk.makeApplicationNoOpTxnFromObject({ sender: account, suggestedParams: sp, appIndex: APP_ID, appArgs: [m.donate, encodeUint64(campaignId)], boxes })
    algosdk.assignGroupID([payTxn, appTxn])
    await signAndSend([payTxn, appTxn])
  }

  const withdraw = async (campaignId: number) => {
    if (!account || APP_ID === 0) throw new Error('Not connected or app not deployed')
    const m = getMethods()
    const sp = await algodClient.getTransactionParams().do()
    const boxes = [boxRef(campaignBoxName(campaignId))]
    const txn = algosdk.makeApplicationNoOpTxnFromObject({ sender: account, suggestedParams: sp, appIndex: APP_ID, appArgs: [m.withdraw, encodeUint64(campaignId)], boxes })
    await signAndSend([txn])
  }

  const getTotalCampaigns = async (): Promise<number> => {
    if (APP_ID === 0) return 0
    try {
      const info = await algodClient.getApplicationByID(APP_ID).do()
      const gs: any[] = (info.params as any).globalState || []
      const e = gs.find((s: any) => Buffer.from(s.key, 'base64').toString() === 'campaign_counter')
      return e ? Number(e.value.uint) : 0
    } catch { return 0 }
  }

  const getCampaign = async (campaignId: number): Promise<Campaign | null> => {
    if (APP_ID === 0) return null
    try {
      const box = await algodClient.getApplicationBoxByName(APP_ID, campaignBoxName(campaignId)).do()
      const v = box.value as Uint8Array
      let o = 0
      const cId = decodeUint64(v, o); o += 8
      const cType = v[o]; o += 1
      const goal = decodeUint64(v, o); o += 8
      const total = decodeUint64(v, o); o += 8
      const creator = algosdk.encodeAddress(v.slice(o, o + 32)); o += 32
      const { value: iName, end: e1 } = decodeString(v, o); o = e1
      const { value: imgUrl, end: e2 } = decodeString(v, o); o = e2
      const active = v[o] !== 0; o += 1
      const createdAt = decodeUint64(v, o)
      return { campaignId: cId, charityType: cType, goalAmount: goal, totalDonations: total, creator, influencerName: iName, profileImageURL: imgUrl, active, createdAt }
    } catch { return null }
  }

  const getAllCampaigns = async (): Promise<Campaign[]> => {
    const total = await getTotalCampaigns()
    const results: Campaign[] = []
    for (let i = 0; i < total; i++) { const c = await getCampaign(i); if (c) results.push(c) }
    return results
  }

  const getCampaignsByCreator = async (creator: string): Promise<Campaign[]> =>
    (await getAllCampaigns()).filter(c => c.creator === creator)

  const getDonorAmount = async (campaignId: number, donor: string): Promise<number> => {
    if (APP_ID === 0) return 0
    try {
      const box = await algodClient.getApplicationBoxByName(APP_ID, donorBoxName(campaignId, donor)).do()
      return decodeUint64(box.value as Uint8Array)
    } catch { return 0 }
  }

  return (
    <AlgorandContext.Provider value={{ account, isConnected: !!account, algodClient, appId: APP_ID, peraWallet, connect, disconnect, createCampaign, donate, withdraw, getCampaign, getAllCampaigns, getTotalCampaigns, getDonorAmount, getCampaignsByCreator }}>
      {children}
    </AlgorandContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(AlgorandContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}