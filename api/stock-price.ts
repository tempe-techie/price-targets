import type { VercelRequest, VercelResponse } from '@vercel/node'
import yahooFinance from 'yahoo-finance2'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const symbols = String(req.query.symbols || '').split(',').filter(Boolean)

  if (!symbols.length) {
    return res.status(400).json({ error: 'Missing symbols parameter' })
  }

  try {
    const quotes = await yahooFinance.quote(symbols)
    const arr = Array.isArray(quotes) ? quotes : [quotes]

    const results: Record<string, { price: number; marketCap: number }> = {}
    for (const q of arr) {
      if (q?.symbol) {
        results[q.symbol] = {
          price: q.regularMarketPrice ?? 0,
          marketCap: q.marketCap ?? 0,
        }
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json(results)
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch stock prices' })
  }
}
