import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const symbols = String(query.symbols || '').split(',').filter(Boolean)

  if (!symbols.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing symbols parameter' })
  }

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

  return results
})
