require('dotenv').config();
const { query, pool, testConnection } = require('./db');

const run = async () => {
  const ok = await testConnection();
  if (!ok) process.exit(1);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(255)  NOT NULL UNIQUE,
      password    VARCHAR(255)  NOT NULL,
      role        VARCHAR(20)   NOT NULL DEFAULT 'viewer'
                    CHECK (role IN ('viewer','analyst','admin')),
      status      VARCHAR(20)   NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','inactive')),
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS financial_records (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
      type        VARCHAR(10)   NOT NULL CHECK (type IN ('income','expense')),
      category    VARCHAR(100)  NOT NULL,
      date        DATE          NOT NULL,
      notes       TEXT,
      is_deleted  BOOLEAN       NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_records_user_id ON financial_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_records_type     ON financial_records(type);
    CREATE INDEX IF NOT EXISTS idx_records_category ON financial_records(category);
    CREATE INDEX IF NOT EXISTS idx_records_date     ON financial_records(date);
  `);

  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS set_users_updated_at ON users;
    CREATE TRIGGER set_users_updated_at
      BEFORE UPDATE ON users FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();

    DROP TRIGGER IF EXISTS set_records_updated_at ON financial_records;
    CREATE TRIGGER set_records_updated_at
      BEFORE UPDATE ON financial_records FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  `);

  console.log('✓ Migration complete');
  await pool.end();
};

run().catch(console.error);