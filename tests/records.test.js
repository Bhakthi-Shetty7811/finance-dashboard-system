const request = require('supertest');
const app     = require('../src/index');

let adminToken;
let viewerToken;
let recordId;

beforeAll(async () => {
  // Login as seeded admin
  const a = await request(app).post('/api/auth/login')
    .send({ email: 'admin@finance.dev', password: 'Password@123' });
  adminToken = a.body.data?.token;

  const v = await request(app).post('/api/auth/login')
    .send({ email: 'viewer@finance.dev', password: 'Password@123' });
  viewerToken = v.body.data?.token;
});

describe('Records — access control', () => {
  it('viewer can GET /api/records', async () => {
    const res = await request(app).get('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
  });

  it('viewer cannot POST /api/records', async () => {
    const res = await request(app).post('/api/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount:1000, type:'income', category:'Test', date:'2024-01-01' });
    expect(res.status).toBe(403);
  });

  it('admin can POST /api/records', async () => {
    const res = await request(app).post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount:5000, type:'income', category:'Test', date:'2024-01-01' });
    expect(res.status).toBe(201);
    recordId = res.body.data.record.id;
  });

  it('admin can DELETE /api/records/:id (soft delete)', async () => {
    const res = await request(app).delete(`/api/records/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});