require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query, pool, testConnection } = require('./db');

const run = async () => {
  await testConnection();
  const hash = await bcrypt.hash('Password@123', 12);

  const users = [
    { name: 'Admin User',    email: 'admin@finance.dev',   role: 'admin'   },
    { name: 'Alice Analyst', email: 'analyst@finance.dev', role: 'analyst' },
    { name: 'Victor Viewer', email: 'viewer@finance.dev',  role: 'viewer'  },
  ];

  let adminId;
  for (const u of users) {
    const existing = await query('SELECT id FROM users WHERE email=$1', [u.email]);
    if (existing.rows.length) {
      if (u.role === 'admin') adminId = existing.rows[0].id;
      continue;
    }
    const res = await query(
      'INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id',
      [u.name, u.email, hash, u.role]
    );
    if (u.role === 'admin') adminId = res.rows[0].id;
  }

  const records = [
    { amount:85000, type:'income',  category:'Salary',      date:'2024-01-05', notes:'January salary'    },
    { amount:12000, type:'expense', category:'Rent',        date:'2024-01-10', notes:'Monthly rent'      },
    { amount: 3500, type:'expense', category:'Groceries',   date:'2024-01-15', notes:'Weekly groceries'  },
    { amount:85000, type:'income',  category:'Salary',      date:'2024-02-05', notes:'February salary'   },
    { amount:12000, type:'expense', category:'Rent',        date:'2024-02-10', notes:'Monthly rent'      },
    { amount: 8000, type:'income',  category:'Freelance',   date:'2024-02-20', notes:'Side project'      },
    { amount:85000, type:'income',  category:'Salary',      date:'2024-03-05', notes:'March salary'      },
    { amount:12000, type:'expense', category:'Rent',        date:'2024-03-10', notes:'Monthly rent'      },
    { amount: 4500, type:'expense', category:'Utilities',   date:'2024-03-12', notes:'Electricity bill'  },
    { amount:20000, type:'expense', category:'Travel',      date:'2024-03-18', notes:'Conference trip'   },
    { amount:85000, type:'income',  category:'Salary',      date:'2024-04-05', notes:'April salary'      },
    { amount:12000, type:'expense', category:'Rent',        date:'2024-04-10', notes:'Monthly rent'      },
    { amount: 6000, type:'income',  category:'Freelance',   date:'2024-04-22', notes:'UI design project' },
    { amount:85000, type:'income',  category:'Salary',      date:'2024-05-05', notes:'May salary'        },
    { amount:12000, type:'expense', category:'Rent',        date:'2024-05-10', notes:'Monthly rent'      },
    { amount:15000, type:'expense', category:'Electronics', date:'2024-05-20', notes:'Laptop upgrade'    },
    { amount:85000, type:'income',  category:'Salary',      date:'2024-06-05', notes:'June salary'       },
    { amount:12000, type:'expense', category:'Rent',        date:'2024-06-10', notes:'Monthly rent'      },
    { amount: 5000, type:'expense', category:'Dining',      date:'2024-06-15', notes:'Team dinner'       },
  ];

  for (const r of records) {
    await query(
      'INSERT INTO financial_records(user_id,amount,type,category,date,notes) VALUES($1,$2,$3,$4,$5,$6)',
      [adminId, r.amount, r.type, r.category, r.date, r.notes]
    );
  }

  console.log('✓ Seed complete');
  console.log('  admin@finance.dev   / Password@123  (admin)');
  console.log('  analyst@finance.dev / Password@123  (analyst)');
  console.log('  viewer@finance.dev  / Password@123  (viewer)');
  await pool.end();
};

run().catch(console.error);