# Finance Dashboard System

A role-based financial records management API built with Node.js, Express, and PostgreSQL.

**Live:** https://finance-dashboard-system-i22e.onrender.com

## Quick Start
```
git clone https://github.com/Bhakthi-Shetty7811/finance-dashboard-system
cd finance-dashboard-system
cp .env.example .env                      # fill in your DATABASE_URL and JWT_SECRET
npm install
node src/config/migrate.js
node src/config/seed.js
npm run dev
```

## Demo Credentials
| Email | Password | Role |
|---|---|---|
| admin@finance.dev | Password@123 | admin |
| analyst@finance.dev | Password@123 | analyst |
| viewer@finance.dev | Password@123 | viewer |

> ⚠️ Hosted on Render free tier - first request may take 20–30 seconds.

## Role Permissions
| Action | Viewer | Analyst | Admin |
|---|---|---|---|
| View records & dashboard | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update records | ❌ | ❌ | ✅ |
| Delete records (soft) | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## API Reference
| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | /api/auth/register | No | - | Register |
| POST | /api/auth/login | No | - | Login |
| GET | /api/auth/me | Yes | Any | My profile |
| GET | /api/users | Yes | Admin | List users |
| PATCH | /api/users/:id/role | Yes | Admin | Change role |
| PATCH | /api/users/:id/status | Yes | Admin | Activate/deactivate |
| GET | /api/records | Yes | Any | List + filter records |
| POST | /api/records | Yes | Analyst, Admin | Create record |
| PATCH | /api/records/:id | Yes | Admin | Update record |
| DELETE | /api/records/:id | Yes | Admin | Soft delete record |
| GET | /api/dashboard/summary | Yes | Any | Totals |
| GET | /api/dashboard/category | Yes | Any | By category |
| GET | /api/dashboard/trends | Yes | Any | Monthly trends |
| GET | /api/dashboard/recent | Yes | Any | Recent activity |

## API Testing
Import `finance-dashboard-system.postman_collection.json` into Postman to test all endpoints.

## Filtering & Pagination

Records support query parameters:

| Parameter | Type | Description |
|---|---|---|
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20, max: 100) |
| type | string | income or expense |
| category | string | Filter by category (partial match) |
| start_date | date | YYYY-MM-DD |
| end_date | date | YYYY-MM-DD |
| sort_by | string | date, amount, or created_at |
| sort_order | string | asc or desc |
| search | string | Search notes and category |

Example: `GET /api/records?type=expense&category=rent&page=1&limit=10`

## Technical Decisions and Trade-offs

**PostgreSQL over MongoDB** - Financial data is relational by nature (users own records, foreign key constraints enforce integrity). Aggregation queries like monthly trends and category totals are far cleaner in SQL than MongoDB pipelines.

**Soft delete** - Records use `is_deleted = true` rather than hard delete. In financial systems, audit trails matter. You never truly want to lose a transaction record, even accidentally deleted ones.

**JWT over sessions** - Stateless auth scales horizontally without shared session storage. Trade-off: tokens can't be invalidated instantly (addressed by checking user status on every request from DB).

**Roles as a string enum in DB** - Kept simple with a CHECK constraint. A separate roles table would be overkill for 3 fixed roles but would be the right call if roles became dynamic.

**Separate service/controller layers** - Controllers only handle HTTP (parse request, call service, send response). Services hold business logic and DB queries. This makes testing and future changes isolated.

**Rate limiting per IP** - 100 requests per 15 minutes on all `/api/` routes. Prevents brute-force on login.

## Assumptions Made

- A viewer who registers defaults to the `viewer` role. Admins assign elevated roles.
- Analysts can create records but only admins can modify or delete them - this mirrors real finance teams where data entry is delegated but correction is controlled.
- All monetary amounts are stored as `NUMERIC(15,2)` - precise decimal storage, no floating point errors.
- Dates are stored as `DATE` (not timestamp) - a transaction happened on a day, not a millisecond.

## Future Improvements
- Refresh token rotation
- Password reset via email
- Export records to CSV
