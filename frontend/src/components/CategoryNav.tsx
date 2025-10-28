import React from 'react';
import './CategoryNav.css';

const categories = [
  'Elétrica',
  'Hidráulica',
  'Ferramentas',
  'Pisos e Revestimentos',
  'Tintas',
  'Madeiras',
  'Jardinagem',
  'Iluminação',
];

export default function CategoryNav() {
  return (
    <div className="catnav">
      <div className="catnav__wrap">
        {categories.map((c) => (
          <button key={c} className="catnav__btn">{c}</button>
        ))}
      </div>
    </div>
  );
}
