// Etiquetas legibles por categoría
const CATEGORY_LABELS = {
  burgers: '🍔 Hamburguesas',
  salchipapas: '🍟 Salchipapas',
  hotdogs: '🌭 Perros Calientes',
  mazorcadas: '🌽 Mazorcadas & Desgranados',
  bebidas: '🥤 Bebidas & Postres'
};

// Base de datos de productos para Fuego Urbano
const PRODUCTS_DATA = [
  {
    id: 'burger-brutal',
    name: 'Hamburguesa Fuego Brutal 🔥',
    category: 'burgers',
    price: 28000,
    badge: 'Más Vendida 🔥',
    prepTime: '15 - 20 min',
    portion: 'Doble Smash (300g)',
    highlights: ['Doble Carne Angus', 'Doble Queso Cheddar', 'Tocineta Ahumada', 'Pan Brioche'],
    description: 'Doble carne smash de res 100% angus (300g total), doble queso cheddar fundido, tocineta ahumada crujiente, cebolla caramelizada artesanal y salsa secreta Fuego en pan brioche dorado.',
    image: './assets/images/burger.jpg',
    popular: true,
    availableExtras: [
      { id: 'extra-cheese', name: 'Queso Cheddar Fundido', price: 3500 },
      { id: 'extra-bacon', name: 'Tocineta Crujiente Extra', price: 4000 },
      { id: 'extra-patty', name: 'Carne Smash Extra (150g)', price: 7000 }
    ]
  },
  {
    id: 'burger-monstruo-bbq',
    name: 'Hamburguesa Fuego BBQ Grill',
    category: 'burgers',
    price: 26000,
    badge: 'Recomendada',
    prepTime: '15 - 20 min',
    portion: 'Parrilla (180g)',
    highlights: ['Carne a la Parrilla', 'Aros de Cebolla', 'Queso Gouda', 'BBQ de Panela'],
    description: 'Carne jugosa de 180g a la parrilla, aros de cebolla crocantes, queso gouda fundido, tocineta ahumada y abundante salsa BBQ de panela ahumada en pan brioche.',
    image: './assets/images/burger.jpg',
    popular: false,
    availableExtras: [
      { id: 'extra-cheese', name: 'Queso Extra', price: 3500 },
      { id: 'extra-bacon', name: 'Tocineta Extra', price: 4000 }
    ]
  },
  {
    id: 'salchipapa-salvaje',
    name: 'Salchipapa Salvaje Mixta',
    category: 'salchipapas',
    price: 29000,
    badge: 'Favorito de la Casa',
    prepTime: '15 - 20 min',
    portion: 'Porción Generosa',
    highlights: ['Salchicha Americana', 'Mozzarella al Soplete', 'Huevos de Codorniz', 'Salsa Tártara & Rosada'],
    description: 'Cama gigante de papas a la francesa crocantes, rodajas de salchicha americana premium, tocineta crujiente, queso mozzarella fundido al soplete, huevos de codorniz, salsa tártara y salsa rosada de la casa.',
    image: './assets/images/salchipapa.jpg',
    popular: true,
    availableExtras: [
      { id: 'extra-chicken', name: 'Pollo Desmechado (120g)', price: 5000 },
      { id: 'extra-cheese', name: 'Queso Costeño Rallado', price: 3000 },
      { id: 'extra-costilla', name: 'Costillita Ahumada BBQ', price: 6500 }
    ]
  },
  {
    id: 'salchipapa-costifuego',
    name: 'Salchipapa Costi-Fuego',
    category: 'salchipapas',
    price: 34000,
    badge: 'Especial XL',
    prepTime: '18 - 22 min',
    portion: 'Tamaño XL',
    highlights: ['Costilla BBQ 180g', 'Salchicha Alemana', 'Maíz Dulce', 'Queso Gratinado'],
    description: 'Papas a la francesa crocantes cubiertas con 180g de costilla de cerdo desmechada bañada en BBQ ahumada, salchicha alemana, tocineta picada, maíz dulce y lluvia de queso gratinado.',
    image: './assets/images/salchipapa.jpg',
    popular: false,
    availableExtras: [
      { id: 'extra-cheese', name: 'Doble Queso Mozzarella', price: 4000 },
      { id: 'extra-bacon', name: 'Tocineta Crocante', price: 4000 }
    ]
  },
  {
    id: 'perro-monstruo',
    name: 'Perro Caliente Monstruo Fuego',
    category: 'hotdogs',
    price: 19500,
    badge: 'Imperdible',
    prepTime: '12 - 15 min',
    portion: 'Gigante',
    highlights: ['Salchicha Ranchera', 'Mozzarella al Soplete', 'Ripio Casero', 'Piña & Tártara'],
    description: 'Salchicha ranchera premium gigante en pan extra suave al vapor, cubierto con queso mozzarella derretido al soplete, tocineta ahumada crujiente, lluvia de ripio de papa casero, huevo de codorniz, salsa de piña dulce y tártara.',
    image: './assets/images/perro.jpg',
    popular: true,
    availableExtras: [
      { id: 'extra-cheese', name: 'Queso Gratinado Extra', price: 3000 },
      { id: 'extra-bacon', name: 'Tocineta Extra', price: 3500 }
    ]
  },
  {
    id: 'perro-clasico-grill',
    name: 'Perro Suizo Callejero',
    category: 'hotdogs',
    price: 17000,
    badge: 'Clásico',
    prepTime: '12 - 15 min',
    portion: 'Personal',
    highlights: ['Salchicha Suiza', 'Cebolla en BBQ', 'Tocineta & Queso', 'Salsa de Ajo'],
    description: 'Salchicha suiza a la plancha, cebolla picadita en salsa BBQ, tocineta, queso mozzarella fundido, ripio de papa, salsa de ajo y salsa rosada artesanal.',
    image: './assets/images/perro.jpg',
    popular: false,
    availableExtras: [
      { id: 'extra-bacon', name: 'Tocineta Extra', price: 3500 }
    ]
  },
  {
    id: 'mazorcada-criolla',
    name: 'Mazorcada Especial Fuego (Desgranado)',
    category: 'mazorcadas',
    price: 27500,
    badge: 'Muy Solicitada',
    prepTime: '15 - 20 min',
    portion: 'Bowl Completo',
    highlights: ['Maíz a la Mantequilla', 'Pollo Desmechado', 'Lomo de Res', 'Queso Mozzarella'],
    description: 'Maíz tierno desgranado salteado a la mantequilla, tierna pechuga de pollo desmechada, lomo de res a la plancha en tiras, tocineta ahumada, abundante queso mozzarella fundido, ripio de papa y salsas artesanales.',
    image: './assets/images/mazorcada.jpg',
    popular: true,
    availableExtras: [
      { id: 'extra-cheese', name: 'Queso Costeño Rallado', price: 3500 },
      { id: 'extra-meat', name: 'Carne de Res Extra', price: 5000 },
      { id: 'extra-bacon', name: 'Tocineta Extra', price: 4000 }
    ]
  },
  {
    id: 'mazorcada-full-queso',
    name: 'Desgranado Champiñones & Queso',
    category: 'mazorcadas',
    price: 26000,
    badge: 'Delicioso',
    prepTime: '15 - 20 min',
    portion: 'Bowl Completo',
    highlights: ['Champiñones al Ajillo', 'Pollo Marinado', 'Doble Mozzarella', 'Tocineta Crocante'],
    description: 'Maíz tierno con champiñones al ajillo, pechuga de pollo marinada, tocineta crocante y doble porción de queso mozzarella elástico gratinado.',
    image: './assets/images/mazorcada.jpg',
    popular: false,
    availableExtras: [
      { id: 'extra-cheese', name: 'Queso Extra', price: 3500 }
    ]
  },
  {
    id: 'malteada-choco-caramelo',
    name: 'Malteada Fuego Choco-Caramelo',
    category: 'bebidas',
    price: 14000,
    badge: 'Postre Top 🍧',
    prepTime: '5 - 8 min',
    portion: 'Vaso Grande',
    highlights: ['Helado de Chocolate', 'Arequipe de la Casa', 'Trozos de Brownie', 'Crema Chantilly'],
    description: 'Espesa y cremosa malteada artesanal de helado de chocolate, arequipe de la casa, montaña de crema chantilly, trozos de brownie crocante, sirope de caramelo y barquillo.',
    image: './assets/images/bebida.jpg',
    popular: true,
    availableExtras: []
  },
  {
    id: 'gaseosa-colombiana',
    name: 'Gaseosa Colombiana / Manzana 400ml',
    category: 'bebidas',
    price: 5000,
    badge: 'Bien Helada',
    prepTime: 'Inmediato',
    portion: 'Botella 400ml',
    highlights: ['Súper Fría', 'Botella 400ml'],
    description: 'Botella de 400ml súper fría, ideal para maridar con tu hamburguesa o salchipapa.',
    image: './assets/images/bebida.jpg',
    popular: false,
    availableExtras: []
  },
  {
    id: 'coca-cola-original',
    name: 'Coca-Cola Original 400ml',
    category: 'bebidas',
    price: 6000,
    badge: 'Clásica',
    prepTime: 'Inmediato',
    portion: 'Botella 400ml',
    highlights: ['Súper Fría', 'Sabor Original'],
    description: 'Refrescante Coca-Cola original servida bien helada.',
    image: './assets/images/bebida.jpg',
    popular: false,
    availableExtras: []
  }
];

// Helper to format currency in Colombian Pesos COP
function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}
