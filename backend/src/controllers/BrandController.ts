import { Request, Response } from 'express';
import { Brand } from '../models/Brand.js';

export async function listBrands(_req: Request, res: Response) {
  const rows = await Brand.findAll({ order: [['name','ASC']] });
  return res.json(rows);
}

export async function getBrand(req: Request, res: Response) {
  const id = Number(req.params.id);
  const b = await Brand.findByPk(id);
  if (!b) return res.status(404).json({ message: 'Marca não encontrada' });
  return res.json(b);
}

export async function createBrand(req: Request, res: Response) {
  const { name } = req.body as { name?: string };
  if (!name || !name.trim()) return res.status(400).json({ message: 'Nome é obrigatório' });
  const b = await Brand.create({ name: name.trim() });
  return res.status(201).json(b);
}

export async function updateBrand(req: Request, res: Response) {
  const id = Number(req.params.id);
  const b = await Brand.findByPk(id);
  if (!b) return res.status(404).json({ message: 'Marca não encontrada' });
  const { name } = req.body as { name?: string };
  if (name !== undefined) b.name = name.trim();
  await b.save();
  return res.json(b);
}

export async function deleteBrand(req: Request, res: Response) {
  const id = Number(req.params.id);
  const b = await Brand.findByPk(id);
  if (!b) return res.status(404).json({ message: 'Marca não encontrada' });
  await b.destroy();
  return res.status(204).send();
}

