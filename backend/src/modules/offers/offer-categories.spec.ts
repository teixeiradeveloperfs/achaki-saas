import { describe, expect, it } from 'vitest';
import { inferOfferCategory } from './offer-categories.js';

describe('inferOfferCategory', () => {
  it.each([
    ['Smartphone Samsung Galaxy', 'eletronicos'],
    ['Kit de panelas antiaderentes', 'casa'],
    ['Tênis masculino casual', 'moda'],
    ['Perfume feminino 100ml', 'beleza'],
    ['Ração para cachorro', 'pet'],
    ['Capacete para motociclista', 'automotivo'],
    ['Caderno universitário', 'livros'],
  ])('classifica %s como %s', (title, category) => {
    expect(inferOfferCategory(title)).toBe(category);
  });

  it('não confunde palavras que apenas contêm um termo curto', () => {
    expect(inferOfferCategory('Tapete para sala')).toBe('outros');
    expect(inferOfferCategory('Controle remoto universal')).toBe('outros');
  });
});
