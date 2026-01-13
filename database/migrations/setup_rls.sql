-- Enable Row Level Security (RLS)
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payees ENABLE ROW LEVEL SECURITY;

-- Policies for Payers (Pagadores)
DROP POLICY IF EXISTS "Users can view their own payers" ON payers;
CREATE POLICY "Users can view their own payers" ON payers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own payers" ON payers;
CREATE POLICY "Users can insert their own payers" ON payers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own payers" ON payers;
CREATE POLICY "Users can update their own payers" ON payers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own payers" ON payers;
CREATE POLICY "Users can delete their own payers" ON payers FOR DELETE USING (auth.uid() = user_id);

-- Policies for Payees (Favorecidos)
DROP POLICY IF EXISTS "Users can view their own payees" ON payees;
CREATE POLICY "Users can view their own payees" ON payees FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own payees" ON payees;
CREATE POLICY "Users can insert their own payees" ON payees FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own payees" ON payees;
CREATE POLICY "Users can update their own payees" ON payees FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own payees" ON payees;
CREATE POLICY "Users can delete their own payees" ON payees FOR DELETE USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON payers TO authenticated;
GRANT ALL ON payees TO authenticated;
