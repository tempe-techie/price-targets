interface CachedPrice {
  ticker: string
  price: string
  marketCap: string
  timestamp: string
}

export interface PriceData {
  price: number
  marketCap: number
  fromCache: boolean
}

const CACHE_KEY_PREFIX = 'price_cache_'

function getCacheKey(coingeckoId: string): string {
  return CACHE_KEY_PREFIX + coingeckoId
}

function getCachedPrice(coingeckoId: string, maxAgeSeconds: number): CachedPrice | null {
  try {
    const raw = localStorage.getItem(getCacheKey(coingeckoId))
    if (!raw) return null

    const cached: CachedPrice = JSON.parse(raw)
    const age = Math.floor(Date.now() / 1000) - parseInt(cached.timestamp)

    if (age > maxAgeSeconds) return null
    return cached
  } catch {
    return null
  }
}

function setCachedPrice(coingeckoId: string, ticker: string, price: number, marketCap: number): void {
  const entry: CachedPrice = {
    ticker,
    price: String(price),
    marketCap: String(marketCap),
    timestamp: String(Math.floor(Date.now() / 1000)),
  }

  try {
    localStorage.setItem(getCacheKey(coingeckoId), JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable
  }
}

export interface Asset {
  name: string
  symbol: string
  targetPrice: number
  coingeckoId: string
}

export async function fetchPrices(
  assets: Asset[],
  maxAgeSeconds: number
): Promise<Record<string, PriceData>> {
  const result: Record<string, PriceData> = {}
  const idsToFetch: string[] = []

  for (const asset of assets) {
    const cached = getCachedPrice(asset.coingeckoId, maxAgeSeconds)
    if (cached) {
      result[asset.coingeckoId] = {
        price: parseFloat(cached.price),
        marketCap: parseFloat(cached.marketCap),
        fromCache: true,
      }
    } else {
      idsToFetch.push(asset.coingeckoId)
    }
  }

  if (idsToFetch.length > 0) {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(idsToFetch.join(','))}&vs_currencies=usd&include_market_cap=true`
      const data: Record<string, { usd?: number; usd_market_cap?: number }> = await $fetch(url)

      for (const id of idsToFetch) {
        const entry = data[id]
        const price = entry?.usd ?? 0
        const marketCap = entry?.usd_market_cap ?? 0

        const asset = assets.find(a => a.coingeckoId === id)
        if (asset) {
          setCachedPrice(id, asset.symbol, price, marketCap)
        }

        result[id] = { price, marketCap, fromCache: false }
      }
    } catch (err) {
      console.error('Failed to fetch prices from CoinGecko:', err)
      for (const id of idsToFetch) {
        result[id] = { price: 0, marketCap: 0, fromCache: false }
      }
    }
  }

  return result
}
