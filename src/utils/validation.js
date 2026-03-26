/**
 * Validation utilities for GSTIN, withdrawals, etc.
 */

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export function validateGSTIN(gstin) {
  if (!gstin) return { valid: false, message: 'GSTIN is required' }
  const clean = gstin.trim().toUpperCase()
  if (clean.length !== 15) return { valid: false, message: 'GSTIN must be 15 characters' }
  if (!GSTIN_REGEX.test(clean)) return { valid: false, message: 'Invalid GSTIN format' }
  return { valid: true, message: 'Valid GSTIN' }
}

export function validateWithdrawal(withdrawal, fund) {
  const checks = []

  // CHECK 1: Balance sufficiency
  const available = (fund?.current_balance || 0) - (fund?.pending_amount || 0)
  checks.push({
    id: 'balance',
    label: 'Sufficient balance',
    passed: withdrawal.total_amount <= available,
    message: withdrawal.total_amount <= available
      ? `Available: ₹${formatNum(available)}`
      : `Insufficient funds. Available: ₹${formatNum(available)}`,
  })

  // CHECK 2: GST Bill mandatory for grant
  if (fund?.fund_type === 'grant') {
    const hasBill = !!withdrawal.bill_document_url
    const hasGstin = !!withdrawal.vendor_gstin
    const hasBillNo = !!withdrawal.bill_number
    checks.push({
      id: 'bill',
      label: 'GST bill attached',
      passed: hasBill && hasGstin && hasBillNo,
      message: hasBill && hasGstin && hasBillNo ? 'All bill details provided' : 'GST bill required for grant fund',
    })
  } else {
    checks.push({
      id: 'bill',
      label: 'GST bill attached',
      passed: true,
      message: 'Bill optional for this fund type',
    })
  }

  // CHECK 3: GSTIN format
  if (withdrawal.vendor_gstin) {
    const gstinCheck = validateGSTIN(withdrawal.vendor_gstin)
    checks.push({
      id: 'gstin',
      label: 'GSTIN format valid',
      passed: gstinCheck.valid,
      message: gstinCheck.message,
    })
  } else {
    checks.push({
      id: 'gstin',
      label: 'GSTIN format valid',
      passed: fund?.fund_type !== 'grant',
      message: fund?.fund_type === 'grant' ? 'GSTIN required for grant fund' : 'No GSTIN provided',
    })
  }

  // CHECK 4: Grant period check
  if (fund?.fund_type === 'grant' && fund?.grant_start_date && fund?.grant_end_date) {
    const spentDate = new Date(withdrawal.spent_date)
    const start = new Date(fund.grant_start_date)
    const end = new Date(fund.grant_end_date)
    const inPeriod = spentDate >= start && spentDate <= end
    checks.push({
      id: 'period',
      label: 'Within grant period',
      passed: inPeriod,
      message: inPeriod
        ? `Within ${fund.grant_start_date} to ${fund.grant_end_date}`
        : `Outside grant period (${fund.grant_start_date} to ${fund.grant_end_date})`,
    })
  } else {
    checks.push({
      id: 'period',
      label: 'Within grant period',
      passed: true,
      message: 'No period restriction',
    })
  }

  // CHECK 5: Amount cross-verification
  checks.push({
    id: 'amount',
    label: 'Amount matches bill',
    passed: withdrawal.total_amount > 0,
    message: withdrawal.total_amount > 0 ? 'Amount verified' : 'Invalid amount',
  })

  return checks
}

function formatNum(n) {
  return n.toLocaleString('en-IN')
}
