import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product } from '../models/Product.js';
import { Brand } from '../models/Brand.js';

const router = Router();

function parseNumber(n: any) {
  if (n === null || n === undefined) return undefined;
  const x = Number(n);
  return Number.isFinite(x) ? x : undefined;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, brandId, limit = '20', offset = '0' } = req.query as Record<string, string>;
    const where: any = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { sku: { [Op.like]: `%${q}%` } },
      ];
    }
    if (brandId) where.brandId = Number(brandId);

    const data = await Product.findAndCountAll({
      where,
      include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }],
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
    });
    res.json({ count: data.count, items: data.rows });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar produtos', error: (err as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const p = await Product.findByPk(id, { include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }] });
  if (!p) return res.status(404).json({ message: 'Produto não encontrado' });
  return res.json(p);
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, sku, price, description, characteristics, specifications, brandId, brandName } = req.body as any;
    if (!name || !sku || price === undefined) return res.status(400).json({ message: 'Dados incompletos' });

    let resolvedBrandId: number | undefined;
    if (brandId) {
      resolvedBrandId = Number(brandId);
    } else if (brandName) {
      const [b] = await Brand.findOrCreate({ where: { name: String(brandName).trim() }, defaults: { name: String(brandName).trim() } });
      resolvedBrandId = b.id;
    }

    const p = await Product.create({
      name: String(name).trim(),
      sku: String(sku).trim(),
      price: (parseNumber(price) ?? Number(price)).toFixed(2),
      description: description ?? null,
      characteristics: characteristics ?? null,
      specifications: specifications ?? null,
      brandId: resolvedBrandId ?? null,
    });
    const withBrand = await Product.findByPk(p.id, { include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }] });
    return res.status(201).json(withBrand);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar produto', error: (err as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const p = await Product.findByPk(id);
    if (!p) return res.status(404).json({ message: 'Produto não encontrado' });

    const { name, sku, price, description, characteristics, specifications, brandId, brandName } = req.body as any;

    let resolvedBrandId: number | null | undefined = undefined;
    if (brandId !== undefined) {
      resolvedBrandId = brandId ? Number(brandId) : null;
    } else if (brandName !== undefined) {
      if (brandName) {
        const [b] = await Brand.findOrCreate({ where: { name: String(brandName).trim() }, defaults: { name: String(brandName).trim() } });
        resolvedBrandId = b.id;
      } else {
        resolvedBrandId = null;
      }
    }

    await p.update({
      name: name !== undefined ? String(name).trim() : p.name,
      sku: sku !== undefined ? String(sku).trim() : p.sku,
      price: price !== undefined ? (parseNumber(price) ?? Number(price)).toFixed(2) : p.price,
      description: description !== undefined ? description : p.description,
      characteristics: characteristics !== undefined ? characteristics : p.characteristics,
      specifications: specifications !== undefined ? specifications : p.specifications,
      brandId: resolvedBrandId !== undefined ? resolvedBrandId : p.brandId,
    });

    const withBrand = await Product.findByPk(p.id, { include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }] });
    return res.json(withBrand);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar produto', error: (err as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const p = await Product.findByPk(id);
    if (!p) return res.status(404).json({ message: 'Produto não encontrado' });
    await p.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover produto', error: (err as Error).message });
  }
});

export default router;

