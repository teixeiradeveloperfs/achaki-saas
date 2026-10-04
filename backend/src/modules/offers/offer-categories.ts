export const OFFER_CATEGORIES = [
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'casa', label: 'Casa e cozinha' },
  { value: 'moda', label: 'Moda e acessórios' },
  { value: 'beleza', label: 'Beleza e cuidados' },
  { value: 'esportes', label: 'Esporte e lazer' },
  { value: 'infantil', label: 'Bebês e infantil' },
  { value: 'pet', label: 'Pet shop' },
  { value: 'automotivo', label: 'Automotivo' },
  { value: 'supermercado', label: 'Supermercado' },
  { value: 'livros', label: 'Livros e papelaria' },
  { value: 'outros', label: 'Outros' },
] as const;

export type OfferCategory = typeof OFFER_CATEGORIES[number]['value'];

const KEYWORDS: Record<Exclude<OfferCategory, 'outros'>, string[]> = {
  eletronicos: ['smartphone', 'celular', 'iphone', 'notebook', 'laptop', 'computador', 'monitor', 'televisao', 'smart tv', 'fone', 'headset', 'carregador', 'smartwatch', 'teclado', 'mouse', 'camera', 'tablet', 'console', 'videogame', 'caixa de som'],
  casa: ['cozinha', 'panela', 'air fryer', 'cafeteira', 'liquidificador', 'aspirador', 'ventilador', 'geladeira', 'micro-ondas', 'microondas', 'cama', 'banho', 'decoracao', 'moveis', 'cadeira', 'armario', 'furadeira', 'ferramenta'],
  moda: ['camiseta', 'camisa', 'blusa', 'calca', 'vestido', 'tenis', 'sandalia', 'sapato', 'bolsa', 'mochila', 'relogio', 'cueca', 'lingerie', 'jaqueta', 'short'],
  beleza: ['perfume', 'maquiagem', 'batom', 'shampoo', 'condicionador', 'cabelo', 'hidratante', 'skincare', 'barbeador', 'secador', 'cosmetico', 'protetor solar'],
  esportes: ['bicicleta', 'academia', 'fitness', 'halter', 'bola', 'chuteira', 'camping', 'barraca', 'esportivo', 'musculacao', 'patins'],
  infantil: ['bebe', 'fralda', 'brinquedo', 'crianca', 'infantil', 'lego', 'boneca', 'carrinho de bebe', 'mamadeira'],
  pet: ['cachorro', 'gato', 'pet', 'racao', 'coleira', 'areia sanitaria', 'arranhador'],
  automotivo: ['automotivo', 'carro', 'moto', 'pneu', 'capacete', 'oleo motor', 'veicular', 'motociclista'],
  supermercado: ['alimento', 'bebida', 'cafe', 'chocolate', 'leite', 'cerveja', 'vinho', 'biscoito', 'arroz', 'feijao', 'acucar'],
  livros: ['livro', 'caderno', 'caneta', 'papelaria', 'agenda', 'lapis', 'mochila escolar'],
};

function normalized(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function hasKeyword(text: string, keyword: string) {
  if (keyword.includes(' ')) return text.includes(keyword);
  const words = text.split(/[^a-z0-9]+/).filter(Boolean);
  return words.some((word) => word === keyword || word === `${keyword}s` || word === `${keyword}es`);
}

export function inferOfferCategory(title: string, sourceCategory?: string | null): OfferCategory {
  const text = normalized(`${sourceCategory ?? ''} ${title}`);
  for (const category of OFFER_CATEGORIES) {
    if (category.value === 'outros') continue;
    if (KEYWORDS[category.value].some((keyword) => hasKeyword(text, keyword))) return category.value;
  }
  return 'outros';
}
