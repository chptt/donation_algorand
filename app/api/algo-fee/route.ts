import { NextResponse } from 'next/server'

// X402 platform fee in USD
const PLATFORM_FEE_USD = 0.10
// Buffer multiplier to cover ALGO price fluctuation (20% buffer)
const BUFFER = 1.20

export async function GET() {
  try {
    // Fetch ALGO/USD price from CoinGecko (free, no key needed)
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd',
      { next: { revalidate: 60 } } // cache 60s
    )
    const data = await res.json()
    const algoUsd: number = data?.algorand?.usd

    if (!algoUsd || algoUsd <= 0) throw new Error('Bad price data')

    // ALGO needed = (fee_usd / algo_price) * buffer, in microALGO
    const algoNeeded = (PLATFORM_FEE_USD / algoUsd) * BUFFER
    const microAlgo  = Math.ceil(algoNeeded * 1_000_000)

    return NextResponse.json({
      microAlgo,
      algoNeeded: algoNeeded.toFixed(6),
      algoUsd,
      feeUsd: PLATFORM_FEE_USD,
    })
  } catch (e: any) {
    // Fallback: 1 ALGO if price fetch fails
    return NextResponse.json({ microAlgo: 1_000_000, algoNeeded: '1.000000', algoUsd: 0, feeUsd: 0.10 })
  }
}