export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  tag?: string;
  description: string;
  groups?: string[];
};
export { categories } from './categories.mjs';
export const products: Product[] = [
  {
    id: 'lila-tunik',
    name: 'Rahat Kesim Uzun Tunik',
    category: 'Tunik',
    price: 899,
    image: '/images/tunik.webp',
    colors: [{ name: 'Lila', hex: '#b6a0c3' }],
    sizes: ['S', 'M', 'L', 'XL'],
    tag: 'YENİ',
    description:
      'Uzun silüeti ve rahat kesimiyle gününe eşlik eden bir parça. Pantolonlarla tamamla, kendi stilini yarat.',
  },
  {
    id: 'basic-crop',
    name: 'Bisiklet Yaka Basic Crop',
    category: 'Crop',
    price: 349,
    image: '/images/crop.webp',
    colors: [{ name: 'Ekru', hex: '#eae6dc' }],
    sizes: ['XS', 'S', 'M', 'L'],
    tag: 'YENİ',
    description:
      'Günlük kombinlerin için sade bir başlangıç. Yüksek bel jean ve favori aksesuarlarınla tamamlayabilirsin.',
  },
  {
    id: 'bordo-elbise',
    name: 'Dökümlü Uzun Elbise',
    category: 'Günlük Elbise',
    price: 1299,
    oldPrice: 1599,
    image: '/images/elbise.webp',
    colors: [{ name: 'Bordo', hex: '#67293e' }],
    sizes: ['S', 'M', 'L', 'XL'],
    tag: '%19 İNDİRİM',
    description:
      'Uzun kollu, akıcı bir silüet. Günlük buluşmalardan özel anlarına, tek parçayla tamamlanan bir görünüm.',
  },
  {
    id: 'wide-leg-jean',
    name: 'Yüksek Bel Wide Leg Jean',
    category: 'Pantolon',
    price: 1099,
    image: '/images/denim.webp',
    colors: [{ name: 'İndigo', hex: '#34455e' }],
    sizes: ['34', '36', '38', '40', '42'],
    tag: 'YENİ',
    description:
      'Bol paça ve yüksek bel bir arada. Tişörtlerle rahat, gömleklerle daha özenli bir görünüm oluştur.',
  },
];
const additional: Array<[string, string, string, number, string, string, string, string[]]> = [
  [
    'mavi-gomlek',
    'Oversize Poplin Gömlek',
    'Gömlek',
    749,
    'gomlek',
    'Mavi',
    '#a9c5df',
    ['Üst Giyim'],
  ],
  [
    'dugmeli-hirka',
    'Düğmeli Yumuşak Hırka',
    'Triko & Hırka',
    999,
    'hirka',
    'Ekru',
    '#eae6dc',
    ['Üst Giyim'],
  ],
  [
    'mor-triko',
    'Bisiklet Yaka Triko',
    'Triko & Hırka',
    799,
    'triko',
    'Mor',
    '#742b83',
    ['Üst Giyim'],
  ],
  ['pileli-etek', 'Uzun Pileli Etek', 'Etek', 849, 'etek', 'Siyah', '#252329', ['Tesettür']],
  ['blazer-ceket', 'Rahat Kesim Blazer Ceket', 'Blazer', 1699, 'ceket', 'Vizon', '#a39488', []],
  [
    'ada-takim',
    'Ada Uzun Tunik Takım',
    'Günlük Takım',
    1899,
    'takim',
    'Yeşil',
    '#9cae96',
    ['Tesettür'],
  ],
  [
    'pembe-sweatshirt',
    'Rahat Kesim Sweatshirt',
    'Sweatshirt',
    699,
    'sweatshirt',
    'Pembe',
    '#d9a9b4',
    ['Üst Giyim'],
  ],
  ['mor-sal', 'Günlük Dökümlü Şal', 'Şal & Eşarp', 299, 'sal', 'Mor', '#742b83', ['Tesettür']],
  [
    'lila-gunluk-tunik',
    'Günlük Uzun Gömlek Tunik',
    'Tunik',
    949,
    'tunik',
    'Lila',
    '#b6a0c3',
    ['Gömlek'],
  ],
  ['ekru-tisort', 'Rahat Kesim Kısa Tişört', 'Tişört', 399, 'crop', 'Ekru', '#eae6dc', []],
  [
    'bordo-maxi',
    'Uzun Kollu Maxi Elbise',
    'Günlük Elbise',
    1499,
    'elbise',
    'Bordo',
    '#67293e',
    ['Tesettür'],
  ],
  ['indigo-denim', 'Bol Paça Denim Pantolon', 'Pantolon', 1199, 'denim', 'İndigo', '#34455e', []],
  [
    'mavi-gunluk-gomlek',
    'Günlük Rahat Gömlek',
    'Gömlek',
    649,
    'gomlek',
    'Mavi',
    '#a9c5df',
    ['Üst Giyim'],
  ],
  [
    'ekru-orgu-hirka',
    'Klasik Örgü Hırka',
    'Triko & Hırka',
    1099,
    'hirka',
    'Ekru',
    '#eae6dc',
    ['Üst Giyim'],
  ],
  [
    'mor-gunluk-triko',
    'Rahat Kesim Triko Kazak',
    'Triko & Hırka',
    899,
    'triko',
    'Mor',
    '#742b83',
    ['Üst Giyim'],
  ],
  ['siyah-maxi-etek', 'Dökümlü Maxi Etek', 'Etek', 999, 'etek', 'Siyah', '#252329', ['Tesettür']],
  ['vizon-ceket', 'Günlük Blazer Ceket', 'Blazer', 1499, 'ceket', 'Vizon', '#a39488', []],
  [
    'yesil-ikili-takim',
    'Rahat Kesim İkili Takım',
    'Günlük Takım',
    2099,
    'takim',
    'Yeşil',
    '#9cae96',
    ['Tesettür'],
  ],
  [
    'pembe-gunluk-sweat',
    'Bisiklet Yaka Sweatshirt',
    'Sweatshirt',
    799,
    'sweatshirt',
    'Pembe',
    '#d9a9b4',
    ['Üst Giyim'],
  ],
  [
    'mor-klasik-sal',
    'Klasik Günlük Şal',
    'Şal & Eşarp',
    349,
    'sal',
    'Mor',
    '#742b83',
    ['Tesettür'],
  ],
];
const expanded: typeof additional = [
  ['siyah-askili-crop', 'İnce Askılı Crop', 'Crop', 449, 'askili-crop', 'Siyah', '#252329', []],
  [
    'siyah-askili-ust',
    'Basic Askılı Üst',
    'Askılı Üst',
    449,
    'askili-crop',
    'Siyah',
    '#252329',
    ['Crop'],
  ],
  ['dusuk-omuz-bluz', 'Asimetrik Omuz Bluz', 'Bluz', 749, 'omuz-bluz', 'Siyah', '#252329', []],
  [
    'kahve-mini-etek',
    'Kahverengi Mini Etek',
    'Etek',
    799,
    'mini-etek',
    'Kahverengi',
    '#5b3b30',
    [],
  ],
  [
    'kirmizi-askili-elbise',
    'Askılı Drapeli Midi Elbise',
    'Davet Elbisesi',
    1599,
    'kirmizi-elbise',
    'Kırmızı',
    '#b92232',
    [],
  ],
  [
    'kahve-ekose-gomlek',
    'Rahat Kesim Ekose Gömlek',
    'Gömlek',
    899,
    'ekose-gomlek',
    'Kahverengi',
    '#5b3b30',
    [],
  ],
  [
    'kusakli-kaban',
    'Kuşaklı Uzun Kaban',
    'Kaban',
    2799,
    'kahve-kaban',
    'Kahverengi',
    '#5b3b30',
    [],
  ],
  [
    'oversize-kot-ceket',
    'Oversize Denim Ceket',
    'Kot Ceket',
    1499,
    'kot-ceket',
    'İndigo',
    '#34455e',
    [],
  ],
  [
    'cizgili-crop-takim',
    'Çizgili Crop Gömlek Takım',
    'Crop Takım',
    1799,
    'cizgili-takim',
    'Ekru',
    '#eae6dc',
    [],
  ],
  ['rahat-denim-sort', 'Yüksek Bel Denim Şort', 'Şort', 699, 'denim-sort', 'Mavi', '#a9c5df', []],
  [
    'kirmizi-orgu-hirka',
    'Kırmızı Örgü Hırka',
    'Triko & Hırka',
    1099,
    'kirmizi-hirka',
    'Kırmızı',
    '#b92232',
    [],
  ],
  ['ekru-kisa-crop', 'Kısa Kesim Basic Crop', 'Crop', 379, 'crop', 'Ekru', '#eae6dc', []],
  ['lila-gomlek-tunik', 'Lila Gömlek Tunik', 'Tunik', 999, 'tunik', 'Lila', '#b6a0c3', ['Gömlek']],
  ['vizon-klasik-blazer', 'Klasik Vizon Blazer', 'Blazer', 1599, 'ceket', 'Vizon', '#a39488', []],
  [
    'yesil-gunluk-takim',
    'Uzun Tunik Günlük Takım',
    'Günlük Takım',
    1999,
    'takim',
    'Yeşil',
    '#9cae96',
    ['Tesettür'],
  ],
  [
    'bordo-gunluk-elbise',
    'Bordo Günlük Uzun Elbise',
    'Günlük Elbise',
    1399,
    'elbise',
    'Bordo',
    '#67293e',
    ['Tesettür'],
  ],
];
additional.push(...expanded);
products.push(
  ...additional.map(([id, name, category, price, photo, color, hex, groups], index) => ({
    id,
    name,
    category,
    price,
    image: `/images/${photo}.webp`,
    colors: [{ name: color, hex }],
    groups,
    sizes:
      category === 'Şal & Eşarp'
        ? ['Standart']
        : ['Pantolon', 'Etek', 'Şort'].includes(category)
          ? ['34', '36', '38', '40', '42', '44']
          : ['XS', 'S', 'M', 'L', 'XL', ...(index % 3 === 0 ? ['XXL'] : [])],
    ...(index % 4 === 0
      ? { oldPrice: price + 200, tag: 'İNDİRİM' }
      : index % 3 === 0
        ? { tag: 'YENİ' }
        : {}),
    description: `${name}, ${color.toLocaleLowerCase('tr')} tonuyla farklı kombinlerine eşlik eder. Kendi tarzına göre tamamlayabileceğin ${category === 'Şal & Eşarp' ? 'bir aksesuar' : 'bir gardırop parçası'}. Bu ürün katalog deneyimi için hazırlanmış bir örnektir.`,
  })),
);
// Preview color variants; product photos currently show the original color.
for (const product of products) {
  const alternatives =
    product.category === 'Pantolon' && product.colors[0].name === 'İndigo'
      ? [
          { name: 'Mavi', hex: '#7189a4' },
          { name: 'Siyah', hex: '#252329' },
        ]
      : [
          { name: 'Ekru', hex: '#eae6dc' },
          { name: 'Siyah', hex: '#252329' },
          { name: 'Lila', hex: '#b6a0c3' },
        ];
  product.colors = [
    ...product.colors,
    ...alternatives.filter(
      (color) => !product.colors.some((existing) => existing.name === color.name),
    ),
  ].slice(0, 3);
}
export const catalogColors = Array.from(
  new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values(),
);
export const catalogSizes = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '34',
  '36',
  '38',
  '40',
  '42',
  '44',
  'Standart',
];
export const money = (amount: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
