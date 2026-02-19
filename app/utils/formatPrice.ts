export function formatPrice(price: number | null | undefined): string {
  if (price == null || isNaN(price)) return '—'

  if (price === 0) return '$0.00'

  if (price >= 1) {
    return '$' + price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (price >= 0.01) {
    return '$' + price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })
  }

  // For very small numbers, show enough significant digits
  const str = price.toFixed(20)
  const match = str.match(/^0\.(0*)([1-9]\d*)/)
  if (match) {
    const leadingZeros = match[1].length
    const significantDigits = match[2].slice(0, 4)
    return '$0.' + '0'.repeat(leadingZeros) + significantDigits
  }

  return '$' + price.toPrecision(4)
}

export function formatMarketCap(cap: number | null | undefined): string {
  if (cap == null || isNaN(cap)) return '—'

  if (cap >= 1e12) return '$' + (cap / 1e12).toFixed(2) + 'T'
  if (cap >= 1e9) return '$' + (cap / 1e9).toFixed(2) + 'B'
  if (cap >= 1e6) return '$' + (cap / 1e6).toFixed(2) + 'M'
  if (cap >= 1e3) return '$' + (cap / 1e3).toFixed(2) + 'K'

  return '$' + cap.toFixed(2)
}

export function formatPercentDiff(current: number, target: number): string {
  if (!current || !target) return '—'
  const diff = ((current - target) / target) * 100
  const sign = diff > 0 ? '+' : ''
  return sign + diff.toFixed(1) + '%'
}
