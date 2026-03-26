-- =============================================================
-- MONEY HANDLER — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================================

-- 1. FUNDS TABLE
CREATE TABLE IF NOT EXISTS funds (
  id BIGSERIAL PRIMARY KEY,
  fund_type TEXT NOT NULL CHECK (fund_type IN ('sarkari', 'grant', 'revenue')),
  fund_name TEXT NOT NULL,
  total_deposited DECIMAL(15,2) DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  grant_agency_name TEXT,
  grant_start_date DATE,
  grant_end_date DATE,
  grant_total_sanctioned DECIMAL(15,2)
);

-- 2. FOUNDERS TABLE
CREATE TABLE IF NOT EXISTS founders (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  equity_percentage DECIMAL(5,2) DEFAULT 0,
  total_contributed DECIMAL(15,2) DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS deposits (
  id BIGSERIAL PRIMARY KEY,
  fund_id BIGINT REFERENCES funds(id) ON DELETE CASCADE,
  founder_id BIGINT REFERENCES founders(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  deposit_date DATE DEFAULT CURRENT_DATE,
  reference_number TEXT,
  source_description TEXT,
  proof_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS withdrawals (
  id BIGSERIAL PRIMARY KEY,
  fund_id BIGINT REFERENCES funds(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL,
  amount_before_gst DECIMAL(15,2) NOT NULL,
  gst_rate DECIMAL(5,2) DEFAULT 0,
  cgst_amount DECIMAL(15,2) DEFAULT 0,
  sgst_amount DECIMAL(15,2) DEFAULT 0,
  igst_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  purpose TEXT,
  category TEXT CHECK (category IN ('equipment','salary','rent','travel','raw_material','software','marketing','utilities','consulting','miscellaneous')),
  vendor_name TEXT,
  vendor_gstin TEXT,
  bill_number TEXT,
  bill_date DATE,
  bill_document_url TEXT,
  spent_location TEXT,
  spent_date DATE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GST BILLS TABLE
CREATE TABLE IF NOT EXISTS gst_bills (
  id BIGSERIAL PRIMARY KEY,
  withdrawal_id BIGINT REFERENCES withdrawals(id) ON DELETE CASCADE,
  bill_file_url TEXT,
  bill_number TEXT,
  seller_gstin TEXT,
  buyer_gstin TEXT,
  taxable_value DECIMAL(15,2),
  gst_type TEXT CHECK (gst_type IN ('CGST+SGST', 'IGST')),
  gst_percentage DECIMAL(5,2),
  total_tax DECIMAL(15,2),
  invoice_total DECIMAL(15,2),
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('deposit','withdrawal','edit','delete')),
  table_affected TEXT,
  record_id BIGINT,
  performed_by TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_deposits_fund ON deposits(fund_id);
CREATE INDEX IF NOT EXISTS idx_deposits_founder ON deposits(founder_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_fund ON withdrawals(fund_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(approval_status);
CREATE INDEX IF NOT EXISTS idx_gst_bills_withdrawal ON gst_bills(withdrawal_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_affected);

-- =============================================================
-- ROW LEVEL SECURITY (Disabled for dev – enable for production)
-- =============================================================
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (dev mode)
CREATE POLICY "Allow all on funds" ON funds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on founders" ON founders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on deposits" ON deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on withdrawals" ON withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on gst_bills" ON gst_bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on audit_log" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- =============================================================
-- SEED DATA
-- =============================================================

-- Funds
INSERT INTO funds (fund_type, fund_name, total_deposited, total_spent, current_balance, grant_agency_name, grant_start_date, grant_end_date, grant_total_sanctioned) VALUES
  ('sarkari', 'Founders Pool', 1000000, 150000, 850000, NULL, NULL, NULL, NULL),
  ('grant', 'DST-NIDHI PRAYAS Grant', 3250000, 3250000, 1750000, 'DST (Dept of Science & Technology)', '2024-01-01', '2025-12-31', 5000000),
  ('revenue', 'Product Revenue', 540000, 120000, 420000, NULL, NULL, NULL, NULL);

-- Founders
INSERT INTO founders (name, email, phone, equity_percentage, total_contributed) VALUES
  ('Rahul Sharma', 'rahul@startup.in', '9876543210', 50, 500000),
  ('Priya Patel', 'priya@startup.in', '9876543211', 30, 300000),
  ('Amit Deshmukh', 'amit@startup.in', '9876543212', 20, 200000);

-- Deposits
INSERT INTO deposits (fund_id, founder_id, amount, deposit_date, reference_number, source_description) VALUES
  (1, 1, 500000, '2024-01-15', 'DEP-001', 'Initial capital contribution - Rahul'),
  (1, 2, 300000, '2024-01-15', 'DEP-002', 'Initial capital contribution - Priya'),
  (1, 3, 200000, '2024-01-20', 'DEP-003', 'Initial capital contribution - Amit'),
  (2, NULL, 2500000, '2024-01-25', 'GRANT-001', 'DST NIDHI PRAYAS - First tranche'),
  (2, NULL, 2500000, '2024-07-15', 'GRANT-002', 'DST NIDHI PRAYAS - Second tranche'),
  (3, NULL, 180000, '2024-06-01', 'REV-001', 'Product sales Q1'),
  (3, NULL, 220000, '2024-09-01', 'REV-002', 'Product sales Q2'),
  (3, NULL, 140000, '2024-12-01', 'REV-003', 'Product sales Q3');

-- Withdrawals (mix of approved, pending, rejected)
INSERT INTO withdrawals (fund_id, requested_by, amount_before_gst, gst_rate, cgst_amount, sgst_amount, igst_amount, total_amount, purpose, category, vendor_name, vendor_gstin, bill_number, bill_date, spent_location, spent_date, approval_status, approved_by) VALUES
  (2, 'Rahul Sharma', 38135, 18, 3432, 3432, 0, 45000, 'Development laptop purchase', 'equipment', 'Croma Electronics', '27AAPFU0939F1ZV', 'INV-2025-001', '2025-01-15', 'Pune, Maharashtra', '2025-01-15', 'approved', 'Admin'),
  (1, 'Priya Patel', 21186, 18, 1906, 1906, 0, 25000, 'Office rent January', 'rent', 'Pune Co-work Space', '27BBBCS1234F1Z8', 'RENT-JAN-25', '2025-01-01', 'Pune, Maharashtra', '2025-01-01', 'approved', 'Admin'),
  (2, 'Amit Deshmukh', 10169, 18, 0, 0, 1831, 12000, 'AWS cloud hosting', 'software', 'Amazon Web Services', '29AAACR5055K1ZK', 'AWS-2025-01', '2025-01-10', 'Online', '2025-01-10', 'approved', 'Admin'),
  (2, 'Rahul Sharma', 6949, 18, 0, 0, 1251, 8200, 'Travel to Bangalore for conference', 'travel', 'MakeMyTrip', '06AADCM4517E1ZW', 'MMT-2025-456', '2025-01-12', 'Bangalore, Karnataka', '2025-01-12', 'approved', 'Admin'),
  (1, 'Rahul Sharma', 169492, 18, 15254, 15254, 0, 200000, 'Team salary January', 'salary', 'Internal Payroll', NULL, 'SAL-JAN-25', '2025-01-31', 'Pune, Maharashtra', '2025-01-31', 'approved', 'Admin'),
  (2, 'Priya Patel', 42373, 18, 3813, 3813, 0, 50000, 'Lab testing equipment', 'equipment', 'Scientific Instruments Co', '27AASCS7890G1ZP', 'SIC-2025-089', '2025-02-05', 'Pune, Maharashtra', '2025-02-05', 'pending', NULL),
  (3, 'Amit Deshmukh', 15254, 18, 1373, 1373, 0, 18000, 'Google Ads campaign', 'marketing', 'Google India', '06AADCG0167H1ZD', 'GAD-2025-112', '2025-02-10', 'Online', '2025-02-10', 'pending', NULL),
  (2, 'Rahul Sharma', 19068, 18, 0, 0, 3432, 22500, 'Raw chemicals for prototype', 'raw_material', 'Chemical Solutions Ltd', '29AADCS5678H1ZR', 'CSL-2025-034', '2025-02-12', 'Chennai, Tamil Nadu', '2025-02-12', 'approved', 'Admin'),
  (1, 'Priya Patel', 8475, 18, 763, 763, 0, 10000, 'Office utilities', 'utilities', 'MSEDCL', '27AAACM1234F1ZQ', 'ELEC-FEB-25', '2025-02-15', 'Pune, Maharashtra', '2025-02-15', 'rejected', 'Admin'),
  (2, 'Rahul Sharma', 25424, 18, 2288, 2288, 0, 30000, 'Consulting fee - Patent filing', 'consulting', 'IPR Associates', '27AADCI9012K1ZW', 'IPA-2025-017', '2025-02-20', 'Mumbai, Maharashtra', '2025-02-20', 'approved', 'Admin');

-- Audit log entries
INSERT INTO audit_log (action, table_affected, record_id, performed_by, new_value) VALUES
  ('deposit', 'deposits', 1, 'Admin', '{"amount": 500000, "founder": "Rahul Sharma"}'),
  ('deposit', 'deposits', 2, 'Admin', '{"amount": 300000, "founder": "Priya Patel"}'),
  ('deposit', 'deposits', 3, 'Admin', '{"amount": 200000, "founder": "Amit Deshmukh"}'),
  ('deposit', 'deposits', 4, 'Admin', '{"amount": 2500000, "source": "DST Grant Tranche 1"}'),
  ('withdrawal', 'withdrawals', 1, 'Rahul Sharma', '{"amount": 45000, "purpose": "Laptop purchase"}'),
  ('withdrawal', 'withdrawals', 2, 'Priya Patel', '{"amount": 25000, "purpose": "Office rent"}'),
  ('withdrawal', 'withdrawals', 5, 'Rahul Sharma', '{"amount": 200000, "purpose": "Team salary"}');
