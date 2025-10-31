import { createMockReq, createMockRes } from './helpers/mockExpress.js';
import * as ProductController from '../dist/controllers/ProductController.js';
import { Product } from '../dist/models/Product.js';
import { Brand } from '../dist/models/Brand.js';

function mockFn(obj, key, impl) {
  const original = obj[key];
  obj[key] = impl;
  return () => { obj[key] = original; };
}

async function run(name, fn) {
  try { await fn(); console.log(`✓ ${name}`); }
  catch (e) { console.error(`✗ ${name}:`, e.message); process.exitCode = 1; }
}

export async function productControllerSuite() {
  await run('listProducts returns items and count', async () => {
    const restore = mockFn(Product, 'findAndCountAll', async () => ({ count: 1, rows: [{ id: 1, name: 'X', sku: 'S', price: '10.00' }] }));
    const req = createMockReq();
    const { res, result } = createMockRes();
    await ProductController.listProducts(req, res);
    restore();
    if (result.statusCode !== 200) throw new Error('status should be 200');
    if (!result.json || !Array.isArray(result.json.items)) throw new Error('items not returned');
  });

  await run('getProduct returns 404 when not found', async () => {
    const restore = mockFn(Product, 'findByPk', async () => null);
    const req = createMockReq({ params: { id: '999' } });
    const { res, result } = createMockRes();
    await ProductController.getProduct(req, res);
    restore();
    if (result.statusCode !== 404) throw new Error('should be 404');
  });

  await run('getProduct returns the product', async () => {
    const restore = mockFn(Product, 'findByPk', async () => ({ id: 1, name: 'X', sku: 'S', price: '10.00' }));
    const req = createMockReq({ params: { id: '1' } });
    const { res, result } = createMockRes();
    await ProductController.getProduct(req, res);
    restore();
    if (result.json?.id !== 1) throw new Error('id mismatch');
  });

  await run('createProduct creates and returns with brand', async () => {
    const restoreCreate = mockFn(Product, 'create', async (payload) => ({ id: 10, ...payload }));
    const restoreFind = mockFn(Product, 'findByPk', async () => ({ id: 10, name: 'Y', sku: 'SKU', price: '15.00', brand: { id: 2, name: 'Brand' } }));
    const restoreBrand = mockFn(Brand, 'findOrCreate', async () => ([{ id: 2, name: 'Brand' } , true]));
    const req = createMockReq({ body: { name: 'Y', sku: 'SKU', price: 15, brandName: 'Brand' } });
    const { res, result } = createMockRes();
    await ProductController.createProduct(req, res);
    restoreCreate(); restoreFind(); restoreBrand();
    if (result.statusCode !== 201) throw new Error('should be 201');
    if (!result.json?.brand) throw new Error('brand not present');
  });

  await run('updateProduct updates fields', async () => {
    const fake = { id: 5, name: 'Old', sku: 'OLD', price: '10.00', update: async function(data){ Object.assign(this, data); } };
    let call = 0;
    const restoreFind = mockFn(Product, 'findByPk', async (id) => {
      call += 1;
      return call === 1 ? fake : { id, name: 'New', sku: 'OLD', price: '10.00' };
    });
    const req = createMockReq({ params: { id: '5' }, body: { name: 'New' } });
    const { res, result } = createMockRes();
    await ProductController.updateProduct(req, res);
    restoreFind();
    if (result.json?.name !== 'New') throw new Error('name not updated');
  });

  await run('deleteProduct removes product', async () => {
    const fake = { id: 7, destroy: async()=>{} };
    const restoreFind = mockFn(Product, 'findByPk', async () => fake);
    const req = createMockReq({ params: { id: '7' } });
    const { res, result } = createMockRes();
    await ProductController.deleteProduct(req, res);
    restoreFind();
    if (result.statusCode !== 204) throw new Error('should be 204');
  });
}
