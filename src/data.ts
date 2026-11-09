import { MenuItem, GalleryItem, DrinkItem, Testimonial } from './types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Truffle Saffron Paneer',
    price: 34,
    description: 'Malai paneer cubes infused with Iranian saffron and finished with shaved black winter truffles.',
    category: 'tandoor',
    isVeg: true,
    isChefSpecial: true
  },
  {
    id: 'm2',
    name: 'Smoked Beetroot Galouti',
    price: 28,
    description: 'Melt-in-mouth vegetable kebabs smoked with clove and cardamom, served on a crisp ulte tawe ka paratha.',
    category: 'tandoor',
    isVeg: true
  },
  {
    id: 'm3',
    name: 'Charred Asparagus Chaat',
    price: 24,
    description: 'Josper-grilled green asparagus, tamarind glaze, crispy quinoa, and pomegranate pearls.',
    category: 'tandoor',
    isVeg: true
  },
  {
    id: 'm4',
    name: '24-Carat Lamb Rogan Josh',
    price: 48,
    description: 'Slow-braised New Zealand lamb shanks in a rich Kashmiri gravy topped with edible 24k gold leaf.',
    category: 'feast',
    isVeg: false,
    isChefSpecial: true
  },
  {
    id: 'm5',
    name: 'Old Delhi Butter Chicken',
    price: 42,
    description: 'Charcoal-smoked chicken thigh, silken tomato-butter emulsion, dried fenugreek leaves.',
    category: 'feast',
    isVeg: false
  },
  {
    id: 'm6',
    name: 'Black Garlic Prawns',
    price: 46,
    description: 'Jumbo tiger prawns marinated in fermented black garlic and stone-ground chilies, tandoor grilled.',
    category: 'feast',
    isVeg: false
  },
  {
    id: 'm7',
    name: 'Gold Leaf Chocolate Mousse',
    price: 22,
    description: 'Rich dark chocolate mousse on a dark reflective cocoa shortbread with edible gold leaf flakes.',
    category: 'dessert',
    isVeg: true,
    isChefSpecial: true
  },
  {
    id: 'm8',
    name: 'Kashmiri Saffron Phirni',
    price: 19,
    description: 'Fragrant dry-fruit rice pudding slow-simmered with organic Kashmiri saffron filaments.',
    category: 'dessert',
    isVeg: true
  },
  {
    id: 'm9',
    name: 'Burnt Garlic Kulcha',
    price: 10,
    description: 'Clay-oven flatbread infused with charred local garlic oil and direct hearth sea salt.',
    category: 'sides',
    isVeg: true
  },
  {
    id: 'm10',
    name: 'Coriander Seed Dal Makhani',
    price: 21,
    description: 'Black lentils slow-cooked for 36 hours over tandoor amber embers, finished with butter & fresh cream.',
    category: 'sides',
    isVeg: true
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7YIVBrWxwx0BdzUqaVGSjgIqyqV3Oio4bYzHyRQWi2taq0QFiSjB0Qb6k_rVndVsWFsGCUD9K2ApV9TxyuD8ZG_rHUS9mcjcspjtQhnxj_OrJdT-D5d-LfUdeIAAlLROpNhyBBYZhXvdErTEL453Efx8V3OjPp-1hqpbuSgWJyngRSx5ylofF8xS9ggBm7vH2l9i1QU3M15_R2saEctr0LnDzesJHHJbOWWmxRp8fY6Zdo6TztA80Nr-39J8iV_NlLd7qujv9Ze4',
    caption: 'Cinematic Grilled Kebabs',
    category: 'cuisine',
    description: 'Succulent slow-grilled kebabs garnished with fresh tarragon and microgreens on slate.'
  },
  {
    id: 'g2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6qbl7hhujfI4H2OAYMQIfBWfLcaEdtpZ-7PuaIpriWsH7z5fcDiWx07EnvIjRh7RNCgoMZejffBfVZPWQHqexlBjzsVzHuOqHlugFObJxqT89DCG3p7PVHVPzoECuIwSieFTNrgXM2Alc9J5IdoAqFB3hPhexTnYq3rqaqnPjU8BqYbNyQ39oRcdrrjKJrPyGrYZZltSPG0sPSw55ql9PPdb1bVN9Zp55IeoywdNkpyDEQn4fuXow2rX-jWzOjI2H6SLux1zFU00',
    caption: 'The Earthly Tandoor Selection',
    category: 'cuisine',
    description: 'Artfully curated assorted small-plate appetizers full of smoky spices and garden herbs.'
  },
  {
    id: 'g3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmubxssML24T5YtvF7jRu4gAv90Z4RY7wV0O16Pw-fjp7BVVMrjz3hWUnuSL6-j4bCAR-8-gwD0kOS3fyFZKuEkHgjclYiKJiQ79EI_w0JzMqiVXt0R3zXPFwA5LEajMNH6tJzGkonC-XX0LzCIpkSFvpA_OtBk55hB1GOdzdEefhLaMxiKnC49fUZw_RNdry16qB-Gg2IOObx_7wosaasSy_y_UpQWUaFMu0GL86GIlKimuS9h6eO6Ab3Cng8O-_2OuO3egrXvM4',
    caption: 'Plating Metaphysics',
    category: 'atmosphere',
    description: 'Chef crafting delicate micro-garnish finishes under the spotlight in our open kitchen.'
  },
  {
    id: 'g4',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlVlhZbW5zHC_x_55CqNyTvtYUtRSvxTYZJCRIfbXj685KiaRwcyw3rC4gB4qd29XefaMUcyOUAcbjDIll671QsNFA5wuF1h5zBmqmVQGNgrF3B8VLyATS6rif2wg916JBTrm807YwvvTI2kgdRkFVNRwR_bNC6tcK-F39HH1R75lrY-gLvH8oiYeRrPsghfhqAcq0BQRRzB3jX7qMMw-nOeBs40DLLqUC-PSGF10QzJSVSK706Pa2htFdEpVUPg-L5uAHlEP5zqQ',
    caption: 'The Obsidian Crypt Room',
    category: 'interior',
    description: 'A table set for selective deep sensory encounters framed in silver candelabras and deep velvet.'
  },
  {
    id: 'g5',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCsIz9mDvWtD6UlUwSxVkuuYvnXKW7sjhnmbW9hbhYWTa6rJspu4i3NvkvO6FUZdQQpKFyUEq4HvPIQjOBM5y-M_G3o4bsYA3fX5zgvWziX7Xfaz7aWY9_bD2ucBH8vVRxqCDkIPGXykwLU5j3ur_DVVgmq58_iISWotEZtSKg1OYvVYfDwFr0aYUSsu3zcIot9HZYATeut1-xr0EAZCFDAl3p08Qpz_gQqlZIEPO_cWIg8XYsltiXIDUNHLcUEQF35Hp7hLJ91w0',
    caption: 'The Midnight Sphere Dessert',
    category: 'cuisine',
    description: 'Gilded chocolate mousse resting elegantly on highly polished dark granite.'
  }
];

export const DRINK_ITEMS: DrinkItem[] = [
  {
    id: 'd1',
    name: 'Liquid Midnight',
    description: 'A heavy smoked botanical distillation featuring black juniper elixir, active mineral charcoal filter, and expressed orange velvet peel.',
    price: 24,
    sweet: 30,
    bitter: 65,
    woody: 80,
    smoky: 95,
    notes: ['Charcoal', 'Juniper', 'Oak Smoke', 'Orange-Peel']
  },
  {
    id: 'd2',
    name: 'The Obsidian Enigma',
    description: 'Dark cold brew espresso base paired with single-estate vetiver extract, cardamom simple syrup, and a gold-wrapped dry anise pod.',
    price: 25,
    sweet: 50,
    bitter: 80,
    woody: 40,
    smoky: 60,
    notes: ['Espresso', 'Vetiver', 'Cardamom', 'Gold-leaf']
  },
  {
    id: 'd3',
    name: 'Saffron Halo',
    description: 'Spiced ginger reduction balanced with distilled non-vintage white grape, pure biological saffron foam, and compressed Himalayan cedar essence.',
    price: 23,
    sweet: 70,
    bitter: 25,
    woody: 90,
    smoky: 20,
    notes: ['Saffron', 'Ginger', 'Cedar', 'Aged-Grape']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: '"An unparalleled voyage into the heart of luxury. Every bite felt like a verse in a poem about the midnight sky."',
    author: 'Julian V.',
    role: 'Gastronomy Weekly'
  },
  {
    id: 't2',
    quote: '"Walking through Dine-Out feels like entering a cinema of high-gravity spices. The Truffle Paneer and 24K Lamb Rogan Josh are sacred items."',
    author: 'Clara Montez',
    role: 'The Elite Palate'
  },
  {
    id: 't3',
    quote: '"The cocktail signatures read like liquid history books. The smoky cedar notes transport you to forgotten high-altitude tandoor sanctuaries."',
    author: 'Dr. Alistair Sterling',
    role: 'Nocturnal Connoisseurs'
  }
];
