import { createMockReq, createMockRes } from './helpers/mockExpress.js';
import * as UserController from '../dist/controllers/UserController.js';
import { User } from '../dist/models/User.js';

function mockFn(obj, key, impl) { const o = obj[key]; obj[key] = impl; return () => { obj[key] = o; }; }
async function run(name, fn) { try { await fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}:`, e.message); process.exitCode = 1; } }

export async function userControllerSuite() {
  await run('register validates required fields', async () => {
    const { res, result } = createMockRes();
    const req = createMockReq({ body: {} });
    await UserController.register(req, res);
    if (result.statusCode !== 400) throw new Error('expected 400');
  });

  await run('login validates required fields', async () => {
    const { res, result } = createMockRes();
    const req = createMockReq({ body: {} });
    await UserController.login(req, res);
    if (result.statusCode !== 400) throw new Error('expected 400');
  });

  await run('me returns 404 when user not found', async () => {
    const restore = mockFn(User, 'findByPk', async () => null);
    const { res, result } = createMockRes();
    const req = createMockReq({ user: { id: 123 } });
    await UserController.me(req, res);
    restore();
    if (result.statusCode !== 404) throw new Error('expected 404');
  });
}

