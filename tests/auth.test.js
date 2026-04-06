const request = require('supertest');
const app     = require('../src/index');

const testUser = {
  name: 'Test User',
  email: `test_${Date.now()}@example.com`,
  password: 'Test@1234',
  role: 'viewer',
};

let token;

describe('Auth', () => {
  it('POST /api/auth/register — creates user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/login — returns JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email, password: testUser.password,
    });
    expect(res.status).toBe(200);
    token = res.body.data.token;
  });

  it('GET /api/auth/me — returns profile', async () => {
    const res = await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email, password: 'WrongPass@99',
    });
    expect(res.status).toBe(401);
  });
});