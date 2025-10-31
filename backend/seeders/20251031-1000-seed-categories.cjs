'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = [
      ['Banheiros','banheiros'],
      ['Climatização e Ventilação','climatizacao-e-ventilacao'],
      ['Cozinhas e Áreas de Serviço','cozinhas-e-areas-de-servico'],
      ['EPIs','epis'],
      ['Ferragens','ferragens'],
      ['Ferramentas','ferramentas'],
      ['Iluminação','iluminacao'],
      ['Impermeabilizantes','impermeabilizantes'],
      ['Marcenaria e Madeiras','marcenaria-e-madeiras'],
      ['Materiais de Construção','materiais-de-construcao'],
      ['Materiais Elétricos','materiais-eletricos'],
      ['Materiais Hidráulicos','materiais-hidraulicos'],
      ['Organização e Limpeza do Ambiente','organizacao-e-limpeza-do-ambiente'],
      ['Pisos e Revestimentos','pisos-e-revestimentos'],
      ['Portas e Janelas','portas-e-janelas'],
      ['Sistemas de Segurança e Comunicação','sistemas-de-seguranca-e-comunicacao'],
      ['Tintas e Acessórios','tintas-e-acessorios'],
    ].map(([name, slug]) => ({ name, slug, parentId: null, order: null, createdAt: now, updatedAt: now }));
    await queryInterface.bulkInsert('categories', rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};

