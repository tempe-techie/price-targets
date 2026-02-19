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

export interface Asset {
  name: string
  symbol: string
  targetPrice: number
  coingeckoId?: string
  'yahoo-finance2'?: string
}

export function assetPriceKey(asset: Asset): string {
  if (asset.coingeckoId) return asset.coingeckoId
  if (asset['yahoo-finance2']) return 'yf:' + asset['yahoo-finance2']
  return ''
}

const CACHE_KEY_PREFIX = 'price_cache_'

function getCacheKey(id: string): string {
  return CACHE_KEY_PREFIX + id
}

function getCachedPrice(id: string, maxAgeSeconds: number): CachedPrice | null {
  try {
    const raw = localStorage.getItem(getCacheKey(id))
    if (!raw) return null

    const cached: CachedPrice = JSON.parse(raw)
    const age = Math.floor(Date.now() / 1000) - parseInt(cached.timestamp)

    if (age > maxAgeSeconds) return null
    return cached
  } catch {
    return null
  }
}

function setCachedPrice(id: string, ticker: string, price: number, marketCap: number): void {
  const entry: CachedPrice = {
    ticker,
    price: String(price),
    marketCap: String(marketCap),
    timestamp: String(Math.floor(Date.now() / 1000)),
  }

  try {
    localStorage.setItem(getCacheKey(id), JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable
  }
}

async function fetchCoingeckoPrices(
  assets: Asset[],
  maxAgeSeconds: number,
  result: Record<string, PriceData>
): Promise<void> {
  const idsToFetch: string[] = []

  for (const asset of assets) {
    const key = asset.coingeckoId!
    const cached = getCachedPrice(key, maxAgeSeconds)
    if (cached) {
      result[key] = { price: parseFloat(cached.price), marketCap: parseFloat(cached.marketCap), fromCache: true }
    } else {
      idsToFetch.push(key)
    }
  }

  if (idsToFetch.length === 0) return

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(idsToFetch.join(','))}&vs_currencies=usd&include_market_cap=true`
    const data: Record<string, { usd?: number; usd_market_cap?: number }> = await $fetch(url)

    for (const id of idsToFetch) {
      const entry = data[id]
      const price = entry?.usd ?? 0
      const marketCap = entry?.usd_market_cap ?? 0

      const asset = assets.find(a => a.coingeckoId === id)
      if (asset) setCachedPrice(id, asset.symbol, price, marketCap)

      result[id] = { price, marketCap, fromCache: false }
    }
  } catch (err) {
    console.error('Failed to fetch prices from CoinGecko:', err)
    for (const id of idsToFetch) {
      result[id] = { price: 0, marketCap: 0, fromCache: false }
    }
  }
}

async function fetchYahooPrices(
  assets: Asset[],
  maxAgeSeconds: number,
  result: Record<string, PriceData>
): Promise<void> {
  const symbolsToFetch: string[] = []

  for (const asset of assets) {
    const key = assetPriceKey(asset)
    const cached = getCachedPrice(key, maxAgeSeconds)
    if (cached) {
      result[key] = { price: parseFloat(cached.price), marketCap: parseFloat(cached.marketCap), fromCache: true }
    } else {
      symbolsToFetch.push(asset['yahoo-finance2']!)
    }
  }

  if (symbolsToFetch.length === 0) return

  try {
    const data: Record<string, { price: number; marketCap: number }> = await $fetch(
      `/api/stock-price?symbols=${encodeURIComponent(symbolsToFetch.join(','))}`
    )

    for (const symbol of symbolsToFetch) {
      const key = 'yf:' + symbol
      const entry = data[symbol]
      const price = entry?.price ?? 0
      const marketCap = entry?.marketCap ?? 0

      const asset = assets.find(a => a['yahoo-finance2'] === symbol)
      if (asset) setCachedPrice(key, asset.symbol, price, marketCap)

      result[key] = { price, marketCap, fromCache: false }
    }
  } catch (err) {
    console.error('Failed to fetch stock prices:', err)
    for (const symbol of symbolsToFetch) {
      result['yf:' + symbol] = { price: 0, marketCap: 0, fromCache: false }
    }
  }
}

export async function fetchPrices(
  assets: Asset[],
  maxAgeSeconds: number
): Promise<Record<string, PriceData>> {
  const result: Record<string, PriceData> = {}

  const coingeckoAssets = assets.filter(a => a.coingeckoId)
  const yahooAssets = assets.filter(a => a['yahoo-finance2'] && !a.coingeckoId)

  await Promise.all([
    coingeckoAssets.length ? fetchCoingeckoPrices(coingeckoAssets, maxAgeSeconds, result) : Promise.resolve(),
    yahooAssets.length ? fetchYahooPrices(yahooAssets, maxAgeSeconds, result) : Promise.resolve(),
  ])

  return result
}
