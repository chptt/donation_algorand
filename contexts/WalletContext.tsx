'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

function campaignBoxName(id: number): Uint8Array {
  return new Uint8Array([...new TextEncoder().encode('c_'), ...encodeUint64(id)])
}

function donorBoxName(id: number, donor: string): Uint8Array {
  return new Uint8Array([...new TextEncoder().encode('d_'), ...algosdk.decodeAddress(donor).publicKey, ...encodeUint64(id)])
}

function boxRef(name: Uint8Array): algosdk.BoxReference { return { appIndex: 0, name } }

let METHODS: { create_campaign: Uint8Array; donate: Uint8Array; withdraw: Uint8Array } | null = null
function getMethods() {
  if (!METHODS) METHODS = {
    create_campaign: new Uint8Array(algosdk.ABIMethod.fromSignature('create_campaign(uint8,uint64,string,string)uint64').getSelector()),
    donate:          new Uint8Array(algosdk.ABIMethod.fromSignature('donate(uint64,pay)void').getSelector()),
    withdraw:        new Uint8Array(algosdk.ABIMethod.fromSignature('withdraw(uint64)void').getSelector()),
  }
  return METHODS!
}

/**
 * Decode ARC4 Campaign struct from box bytes.
 *
 * Layout confirmed from TEAL (withdraw uses box_extract at 25,32 for creator;
 * donate uses box_extract at 61,1 for active and at 17,8 for total_donations):
 *
 *  0- 7  campaign_id    (uint64, 8 bytes)
 *  8      charity_type   (uint8,  1 byte)
 *  9-16   goal_amount    (uint64, 8 bytes)
 * 17-24   total_donations(uint64, 8 bytes)
 * 25-56   creator        (address, 32 bytes)
 * 57-58   offset to influencer_name   (uint16, relative to struct start)
 * 59-60   offset to profile_image_url (uint16, relative to struct start)
 * 61      active         (bool, bit 7 = value: 0x80 = true)
 * 62-69   created_at     (uint64, 8 bytes)
 * 70+     dynamic strings (each: 2-byte length prefix + UTF-8 bytes)
 */
function decodeCampaignBox(v: Uint8Array): Campaign {
  const campaignId    = decodeUint64(v, 0)
  const charityType   = v[8]
  const goalAmount    = decodeUint64(v, 9)
  const totalDonations = decodeUint64(v, 17)
  const creator       = algosdk.encodeAddress(v.slice(25, 57))
  // offsets at 57-58 and 59-60 are relative to struct start
  const nameOffset    = (v[57] << 8) | v[58]
  const imgOffset     = (v[59] << 8) | v[60]
  const active        = (v[61] & 0x80) !== 0
  const createdAt     = decodeUint64(v, 62)
  const { value: influencerName }  = decodeString(v, nameOffset)
  const { value: profileImageURL } = decodeString(v, imgOffset)
  return { campaignId, charityType, goalAmount, totalDonations, creator, influencerName, profileImageURL, active, createdAt }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    peraWallet.reconnectSession().then(a => { if (a.length > 0) setAccount(a[0]) }).catch(() => {})
    peraWallet.connector?.on('disconnect', () => setAccount(null))
  }, [])

  const connect = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('walletconnect')
        localStorage.removeItem('PeraWallet.Wallet')
      }
      const accounts = await peraWallet.connect()
      setAccount(accounts[0])
    } catch (e: any) {
      if (e?.data?.type === 'CONNECT_MODAL_CLOSED') return
      console.error('Pera connect error:', e)
    }
  }

  const disconnect = () => { peraWallet.disconnect(); setAccount(null) }

  async function signAndSend(txns: algosdk.Transaction[], sender: string): Promise<void> {
    const txnGroup = txns.map(txn => ({ txn, signers: [sender] }))
    let signed: Uint8Array[]
    try {
      signed = await peraWallet.signTransaction([txnGroup])
    } catch (e: any) {
      throw new Error('Transaction cancelled by user')
    }
    const { txid } = await algodClient.sendRawTransaction(signed).do()
    await algosdk.waitForConfirmation(algodClient, txid, 4)
  }

  const createCampaign = async (charityType: number, goalMicroAlgo: number, name: string, imageUrl: string) => {
    if (!account || APP_ID === 0) throw new Error('Not connected or app not deployed')
    const m = getMethods()
    const sp = await algodClient.getTransactionParams().do()
    const info = await algodClient.getApplicationByID(APP_ID).do()
    const gs: any[] = (info.params as any).globalState || []
    const entry = gs.find((s: any) => Buffer.from(s.key, 'base64').toString() === 'campaign_counter')
    const nextId = entry ? Number(entry.value.uint) : 0
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: account, suggestedParams: sp, appIndex: APP_ID,
      appArgs: [m.create_campaign, encodeUint8(charityType), encodeUint64(goalMicroAlgo), encodeString(name), encodeString(imageUrl)],
      boxes: [boxRef(campaignBoxName(nextId))]
    })
    await signAndSend([txn], account)
  }

  const donate = async (campaignId: number, amountMicroAlgo: number) => {
    if (!account || APP_ID === 0) throw new Error('Not connected')
    const m = getMethods()
    const sp = await algodClient.getTransactionParams().do()
    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: account, receiver: algosdk.getApplicationAddress(APP_ID), amount: amountMicroAlgo, suggestedParams: sp
    })
    const appTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: account, suggestedParams: sp, appIndex: APP_ID,
      appArgs: [m.donate, encodeUint64(campaignId)],
      boxes: [boxRef(campaignBoxName(campaignId)), boxRef(donorBoxName(campaignId, account))]
    })
    algosdk.assignGroupID([payTxn, appTxn])
    await signAndSend([payTxn, appTxn], account)
  }

  const withdraw = async (campaignId: number) => {
    if (!account || APP_ID === 0) throw new Error('Not connected or app not deployed')
    const m = getMethods()
    const sp = await algodClient.getTransactionParams().do()
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: account, suggestedParams: sp, appIndex: APP_ID,
      appArgs: [m.withdraw, encodeUint64(campaignId)],
      boxes: [boxRef(campaignBoxName(campaignId))]
    })
    await signAndSend([txn], account)
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
      return decodeCampaignBox(box.value as Uint8Array)
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