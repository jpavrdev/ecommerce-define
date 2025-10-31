'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const [cats] = await queryInterface.sequelize.query('SELECT id, slug, name FROM categories');

    const sanitize = (s) => String(s || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const rows = [];
    for (const c of cats) {
      const slugUp = sanitize(c.slug);
      const catName = c.name || c.slug;
      // SKUs com sufixo SEED para facilitar o down
      const skuLow = `CAT-${slugUp}-SEED-L`;
      const skuMed = `CAT-${slugUp}-SEED-M`;
      const skuHigh = `CAT-${slugUp}-SEED-H`;

      rows.push(
        { name: `${catName} Básico`, sku: skuLow, price: '19.90', description: null, characteristics: null, specifications: null, imageUrl: null, imageData: null, imageMimeType: null, images: null, brandId: null, categoryId: c.id, createdAt: now, updatedAt: now },
        { name: `${catName} Intermediário`, sku: skuMed, price: '79.90', description: null, characteristics: null, specifications: null, imageUrl: null, imageData: null, imageMimeType: null, images: null, brandId: null, categoryId: c.id, createdAt: now, updatedAt: now },
        { name: `${catName} Premium`, sku: skuHigh, price: '249.90', description: null, characteristics: null, specifications: null, imageUrl: null, imageData: null, imageMimeType: null, images: null, brandId: null, categoryId: c.id, createdAt: now, updatedAt: now },
      );
    }

    if (rows.length) {
      // Remove previamente quaisquer seeds com o mesmo padrão de SKU para evitar conflitos em reexecução
      await queryInterface.bulkDelete('products', { sku: rows.map(r => r.sku) });
      await queryInterface.bulkInsert('products', rows);

      // Criar algumas notas (ratings) por produto usando usuários seed
      const [prods] = await queryInterface.sequelize.query("SELECT id, sku FROM products WHERE sku LIKE 'CAT-%-SEED-%'");
      const [users] = await queryInterface.sequelize.query("SELECT id, email FROM users WHERE email LIKE 'seeduser%@example.com'");
      const userIds = users.map(u => u.id);
      const ratings = [];
      const pickRatings = (sku) => {
        if (sku.endsWith('-SEED-H')) return [5, 4, 5];
        if (sku.endsWith('-SEED-M')) return [4, 3, 4];
        return [3, 2, 3];
      };
      let uidx = 0;
      for (const p of prods) {
        const rs = pickRatings(p.sku);
        for (const r of rs) {
          if (userIds.length === 0) break;
          const uid = userIds[uidx % userIds.length];
          uidx++;
          ratings.push({ productId: p.id, userId: uid, rating: r, comment: null, createdAt: now, updatedAt: now });
        }
      }
      if (ratings.length) {
        // idempotente: remove avaliações anteriores para estes produtos
        const prodIds = prods.map(p => p.id);
        await queryInterface.bulkDelete('product_ratings', { productId: prodIds });
        await queryInterface.bulkInsert('product_ratings', ratings);
      }
    }
  },
  async down(queryInterface) {
    // Remove todos os produtos seedados por este arquivo (padrão de SKU)
    await queryInterface.sequelize.query("DELETE FROM products WHERE sku LIKE 'CAT-%-SEED-%'");
  }
};
