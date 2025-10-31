import { Request, Response } from 'express';
import { Op, OrderItem } from 'sequelize';
import { Product } from '../models/Product.js';
import { Brand } from '../models/Brand.js';
import { Category } from '../models/Category.js';
import { sequelize } from '../models/index.js';

function parseNumber(n: any) {
  if (n === null || n === undefined) return undefined;
  const x = Number(n);
  return Number.isFinite(x) ? x : undefined;
}

export async function listProducts(req: Request, res: Response) {
  try {
    const { q, brandId, categoryId, limit = '20', offset = '0', minPrice, maxPrice, sort } = req.query as Record<string, string>;
    const where: any = {};
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { sku: { [Op.like]: `%${q}%` } },
      ];
    }
    if (brandId) where.brandId = Number(brandId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (minPrice) where.price = { ...(where.price || {}), [Op.gte]: Number(minPrice) };
    if (maxPrice) where.price = { ...(where.price || {}), [Op.lte]: Number(maxPrice) };

    let order: OrderItem[] = [];
    switch ((sort || '').toLowerCase()) {
      case 'price_asc':
        order = [['price', 'ASC']];
        break;
      case 'price_desc':
        order = [['price', 'DESC']];
        break;
      case 'name_asc':
        order = [['name', 'ASC']];
        break;
      case 'newest':
        order = [['createdAt', 'DESC']];
        break;
      case 'relevance':
        order = q ? [['name', 'ASC']] : [['createdAt', 'DESC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const data = await Product.findAndCountAll({
      where,
      attributes: {
        exclude: ['imageData'],
        include: [
          [sequelize.literal('(SELECT AVG(r.rating) FROM product_ratings r WHERE r.productId = Product.id)'), 'avgRating'],
          [sequelize.literal('(SELECT COUNT(*) FROM product_ratings r2 WHERE r2.productId = Product.id)'), 'ratingsCount'],
        ],
      },
      include: [
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      limit: Number(limit),
      offset: Number(offset),
      order,
    });
    return res.json({ count: data.count, items: data.rows });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar produtos', error: (err as Error).message });
  }
}

export async function getProduct(req: Request, res: Response) {
  const id = Number(req.params.id);
  const p = await Product.findByPk(id, { attributes: {
    exclude: ['imageData'],
    include: [
      [sequelize.literal('(SELECT AVG(r.rating) FROM product_ratings r WHERE r.productId = Product.id)'), 'avgRating'],
      [sequelize.literal('(SELECT COUNT(*) FROM product_ratings r2 WHERE r2.productId = Product.id)'), 'ratingsCount'],
    ]
  }, include: [
    { model: Brand, as: 'brand', attributes: ['id', 'name'] },
    { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
  ] });
  if (!p) return res.status(404).json({ message: 'Produto nÃ£o encontrado' });
  return res.json(p);
}

export async function createProduct(req: Request, res: Response) {
  try {
    const { name, sku, price, description, characteristics, specifications, imageUrl, images, brandId, brandName, categoryId } = req.body as any;
    if (!name || !sku || price === undefined) return res.status(400).json({ message: 'Dados incompletos' });

    let resolvedBrandId: number | undefined;
    if (brandId) {
      resolvedBrandId = Number(brandId);
    } else if (brandName) {
      const [b] = await Brand.findOrCreate({ where: { name: String(brandName).trim() }, defaults: { name: String(brandName).trim() } });
      resolvedBrandId = b.id;
    }

    let imagesPayload: string[] | null = null;
    if (Array.isArray(images)) {
      imagesPayload = images.filter((u: any) => typeof u === 'string');
    }

    // handle uploaded image (multer)
    const file: any = (req as any).file;
    const hasFile = file && file.buffer && file.mimetype;

    if (!categoryId) {
      return res.status(400).json({ message: 'Categoria obrigatória' });
    }

    const p = await Product.create({
      name: String(name).trim(),
      sku: String(sku).trim(),
      price: (parseNumber(price) ?? Number(price)).toFixed(2),
      description: description ?? null,
      characteristics: characteristics ?? null,
      specifications: specifications ?? null,
      imageUrl: hasFile ? null : (imageUrl ?? (imagesPayload && imagesPayload.length ? imagesPayload[0] : null)),
      imageData: hasFile ? file.buffer : null,
      imageMimeType: hasFile ? String(file.mimetype) : null,
      images: imagesPayload,
      brandId: resolvedBrandId ?? null,
      categoryId: Number(categoryId),
    });
    const withBrand = await Product.findByPk(p.id, { include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }] });
    return res.status(201).json(withBrand);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar produto', error: (err as Error).message });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const p = await Product.findByPk(id);
    if (!p) return res.status(404).json({ message: 'Produto nÃ£o encontrado' });

    const { name, sku, price, description, characteristics, specifications, imageUrl, images, brandId, brandName, categoryId } = req.body as any;

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

    let imagesPayload: string[] | undefined;
    if (images !== undefined) {
      imagesPayload = Array.isArray(images) ? images.filter((u: any) => typeof u === 'string') : [];
    }

    await p.update({
      name: name !== undefined ? String(name).trim() : p.name,
      sku: sku !== undefined ? String(sku).trim() : p.sku,
      price: price !== undefined ? (parseNumber(price) ?? Number(price)).toFixed(2) : p.price,
      description: description !== undefined ? description : p.description,
      characteristics: characteristics !== undefined ? characteristics : p.characteristics,
      specifications: specifications !== undefined ? specifications : p.specifications,
      imageUrl: imageUrl !== undefined ? imageUrl : p.imageUrl,
      images: imagesPayload !== undefined ? imagesPayload : p.images,
      brandId: resolvedBrandId !== undefined ? resolvedBrandId : p.brandId,
      categoryId: categoryId !== undefined && categoryId !== null && categoryId !== '' ? Number(categoryId) : (p as any).categoryId,
    });

    const withBrand = await Product.findByPk(p.id, { include: [{ model: Brand, as: 'brand', attributes: ['id', 'name'] }] });
    return res.json(withBrand);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar produto', error: (err as Error).message });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const p = await Product.findByPk(id);
    if (!p) return res.status(404).json({ message: 'Produto nÃ£o encontrado' });
    await p.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover produto', error: (err as Error).message });
  }
}


export async function getProductImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const p = await Product.findByPk(id);
    if (!p) return res.status(404).json({ message: 'Produto no encontrado' });
    const anyP: any = p as any;
    if (anyP.imageData) {
      const mime = anyP.imageMimeType || 'application/octet-stream';
      res.setHeader('Content-Type', String(mime));
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(anyP.imageData);
    }
    if (p.imageUrl) {
      return res.redirect(p.imageUrl);
    }
    // Serve tiny transparent PNG to avoid client re-request loops
    const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9YVjQn0AAAAASUVORK5CYII=';
    const buf = Buffer.from(transparentPngBase64, 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.send(buf);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao obter imagem', error: (err as Error).message });
  }
}

export async function featuredProducts(req: Request, res: Response) {
  try {
    const limit = Number((req.query.limit as string) || 12);
    const minRatings = Number((req.query.minRatings as string) || 1);
    const rows = await Product.findAll({
      attributes: {
        exclude: ['imageData'],
        include: [
          [sequelize.literal('(SELECT AVG(r.rating) FROM product_ratings r WHERE r.productId = Product.id)'), 'avgRating'],
          [sequelize.literal('(SELECT COUNT(*) FROM product_ratings r2 WHERE r2.productId = Product.id)'), 'ratingsCount'],
        ],
      },
      include: [
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      where: sequelize.where(
        sequelize.literal('(SELECT COUNT(*) FROM product_ratings rr WHERE rr.productId = Product.id)'),
        { [Op.gte]: minRatings }
      ),
      order: [
        [sequelize.literal('(SELECT AVG(r.rating) FROM product_ratings r WHERE r.productId = Product.id)'), 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit,
    });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao buscar destaques', error: (err as Error).message });
  }
}
