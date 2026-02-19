import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance()

export default async (req: Request) => {
  const url = new URL(req.url)
  const symbols = (url.searchParams.get('symbols') || '').split(',').filter(Boolean)

  if (!symbols.length) {
    return new Response(JSON.stringify({ error: 'Missing symbols parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
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

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to fetch stock prices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
