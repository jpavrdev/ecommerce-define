import { Request, Response } from 'express';
import { ProductRating } from '../models/ProductRating.js';
import { Product } from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';

export async function listRatings(req: Request, res: Response) {
  const productId = Number(req.params.id);
  if (!Number.isFinite(productId)) return res.status(400).json({ message: 'Produto inválido' });
  const limit = Number((req.query.limit as string) || 20);
  const offset = Number((req.query.offset as string) || 0);
  const ratings = await ProductRating.findAndCountAll({
    where: { productId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
  return res.json({ count: ratings.count, items: ratings.rows });
}

export async function upsertRating(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Não autenticado' });
    const productId = Number(req.params.id);
    const { rating, comment } = req.body as { rating?: number; comment?: string };
    if (!Number.isFinite(productId)) return res.status(400).json({ message: 'Produto inválido' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Nota deve ser entre 1 e 5' });
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

    const existing = await ProductRating.findOne({ where: { productId, userId: req.user.id } });
    if (existing) {
      existing.rating = rating;
      if (comment !== undefined) existing.comment = comment || null;
      await existing.save();
      return res.json(existing);
    }
    const created = await ProductRating.create({ productId, userId: req.user.id, rating, comment: comment || null });
    return res.status(201).json(created);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao registrar avaliação', error: (err as Error).message });
  }
}

