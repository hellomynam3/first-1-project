export interface Ingredient {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  link: string;
}

export const ingredients: Ingredient[] = [
  {
    id: 'kataifi',
    name: '카다이프 면 (Kataifi)',
    description: '두바이 초콜릿의 핵심! 바삭한 식감을 내는 얇은 면입니다.',
    price: 12900,
    unit: '500g',
    imageUrl: 'https://placehold.co/400x300?text=Kataifi',
    link: 'https://search.shopping.naver.com/search/all?query=카다이프+면',
  },
  {
    id: 'pistachio-spread',
    name: '피스타치오 스프레드',
    description: '진하고 고소한 피스타치오 크림. 쫀득한 식감의 비결!',
    price: 18500,
    unit: '200g',
    imageUrl: 'https://placehold.co/400x300?text=Pistachio+Spread',
    link: 'https://search.shopping.naver.com/search/all?query=피스타치오+스프레드',
  },
  {
    id: 'dark-chocolate',
    name: '커버춰 다크 초콜릿',
    description: '템퍼링하여 겉을 코팅하는 고급 초콜릿입니다.',
    price: 9900,
    unit: '1kg',
    imageUrl: 'https://placehold.co/400x300?text=Dark+Chocolate',
    link: 'https://search.shopping.naver.com/search/all?query=커버춰+다크초콜릿',
  },
  {
    id: 'butter',
    name: '무염 버터',
    description: '카다이프를 볶을 때 사용하는 고소한 버터.',
    price: 8500,
    unit: '450g',
    imageUrl: 'https://placehold.co/400x300?text=Butter',
    link: 'https://search.shopping.naver.com/search/all?query=무염버터',
  },
];
