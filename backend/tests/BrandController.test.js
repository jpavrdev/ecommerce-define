import { createMockReq, createMockRes } from './helpers/mockExpress.js';
import * as BrandController from '../dist/controllers/BrandController.js';
import { Brand } from '../dist/models/Brand.js';

function mockFn(obj, key, impl) { const o = obj[key]; obj[key] = impl; return () => { obj[key] = o; }; }
async function run(name, fn) { try { await fn(); console.log(`✓ ${name}`); } catch (e) { console.error(`✗ ${name}:`, e.message); process.exitCode = 1; } }

export async function brandControllerSuite() {
  await run('listBrands returns array', async () => {
    const restore = mockFn(Brand, 'findAll', async () => ([{ id:1, name:'A'}]));
    const { res, result } = createMockRes();
    await BrandController.listBrands({}, res);
    restore();
    if (!Array.isArray(result.json)) throw new Error('not an array');
  });

  await run('getBrand 404 when missing', async () => {
    const restore = mockFn(Brand, 'findByPk', async () => null);
    const req = createMockReq({ params: { id: '9' } });
    const { res, result } = createMockRes();
    await BrandController.getBrand(req, res);
    restore();
    if (result.statusCode !== 404) throw new Error('expected 404');
  });

  await run('createBrand returns 201', async () => {
    const restore = mockFn(Brand, 'create', async (payload) => ({ id: 2, ...payload }));
    const req = createMockReq({ body: { name: 'Nova' } });
    const { res, result } = createMockRes();
    await BrandController.createBrand(req, res);
    restore();
    if (result.statusCode !== 201) throw new Error('expected 201');
  });

  await run('updateBrand updates name', async () => {
    const fake = { id: 3, name: 'Old', save: async function(){} };
    const restore = mockFn(Brand, 'findByPk', async () => fake);
    const req = createMockReq({ params: { id:'3' }, body: { name: 'New' } });
    const { res, result } = createMockRes();
    await BrandController.updateBrand(req, res);
    restore();
    if (result.json?.name !== 'New') throw new Error('name not updated');
  });

  await run('deleteBrand returns 204', async () => {
    const fake = { id: 4, destroy: async()=>{} };
    const restore = mockFn(Brand, 'findByPk', async () => fake);
    const req = createMockReq({ params: { id:'4' } });
    const { res, result } = createMockRes();
    await BrandController.deleteBrand(req, res);
    restore();
    if (result.statusCode !== 204) throw new Error('expected 204');
  });
}

