import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Category } from '../models/Category.js';

export async function listCategories(req: Request, res: Response) {
  const { parentId, q } = req.query as Record<string, string>;
  const where: any = {};
  if (parentId !== undefined) where.parentId = parentId === '' ? null : Number(parentId);
  if (q) where.name = { [Op.like]: `%${q}%` };
  const rows = await Category.findAll({ where, order: [['order', 'ASC'], ['name', 'ASC']] });
  return res.json(rows);
}

export async function getCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const item = await Category.findByPk(id, { include: [{ model: Category, as: 'children' }] });
  if (!item) return res.status(404).json({ message: 'Categoria não encontrada' });
  return res.json(item);
}

export async function createCategory(req: Request, res: Response) {
  const { name, slug, parentId, order } = req.body as { name?: string; slug?: string; parentId?: number | null; order?: number | null };
  if (!name || !slug) return res.status(400).json({ message: 'Nome e slug são obrigatórios' });
  const created = await Category.create({ name: name.trim(), slug: slug.trim().toLowerCase(), parentId: parentId ?? null, order: order ?? null });
  return res.status(201).json(created);
}

export async function updateCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const item = await Category.findByPk(id);
  if (!item) return res.status(404).json({ message: 'Categoria não encontrada' });
  const { name, slug, parentId, order } = req.body as { name?: string; slug?: string; parentId?: number | null; order?: number | null };
  if (name !== undefined) item.name = name.trim();
  if (slug !== undefined) item.slug = slug.trim().toLowerCase();
  if (parentId !== undefined) (item as any).parentId = parentId;
  if (order !== undefined) (item as any).order = order;
  await item.save();
  return res.json(item);
}

export async function deleteCategory(req: Request, res: Response) {
  const id = Number(req.params.id);
  const item = await Category.findByPk(id);
  if (!item) return res.status(404).json({ message: 'Categoria não encontrada' });
  await item.destroy();
  return res.status(204).send();
}

