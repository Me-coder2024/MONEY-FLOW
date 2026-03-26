/**
 * GST Calculation Engine
 * Supports Indian GST slabs: 0%, 5%, 12%, 18%, 28%
 */

export function calculateGST(baseAmount, gstRate, isInterState = false) {
  const base = parseFloat(baseAmount) || 0
  const rate = parseFloat(gstRate) || 0

  let cgst = 0, sgst = 0, igst = 0

  if (isInterState) {
    igst = base * (rate / 100)
  } else {
    cgst = base * (rate / 200)
    sgst = base * (rate / 200)
  }

  const totalTax = cgst + sgst + igst
  const grandTotal = base + totalTax

  return {
    baseAmount: round2(base),
    gstRate: rate,
    cgst: round2(cgst),
    sgst: round2(sgst),
    igst: round2(igst),
    totalTax: round2(totalTax),
    grandTotal: round2(grandTotal),
    cgstRate: isInterState ? 0 : rate / 2,
    sgstRate: isInterState ? 0 : rate / 2,
    igstRate: isInterState ? rate : 0,
  }
}

export function reverseCalculateGST(totalInclusive, gstRate) {
  const total = parseFloat(totalInclusive) || 0
  const rate = parseFloat(gstRate) || 0

  const base = total / (1 + rate / 100)
  const tax = total - base

  return {
    baseAmount: round2(base),
    totalTax: round2(tax),
    grandTotal: round2(total),
  }
}

function round2(num) {
  return Math.round(num * 100) / 100
}
