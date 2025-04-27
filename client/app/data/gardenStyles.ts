export interface GardenStyle {
  id: string;
  name: string;
  before: string;
  after: string;
  image?: string;
  description?: string;
  isActive?: boolean;
}

const gardenStyles: GardenStyle[] = [
  // {
  //   id: 'chinese-classical',
  //   name: 'Chinese Classical Garden',
  //   before: '/public/images/comparison/Chinese Classical Garden_before.jfif',
  //   after: '/public/images/comparison/Chinese Classical Garden_after.jfif',
  //   isActive: true
  // },
  {
    id: 'woodland',
    name: 'Woodland Garden',
    before: '/images/comparison/woodland-before.png',
    after: '/images/comparison/woodland-after.png',
    image: '/images/comparison/woodland-after.png',
    description: "Naturalistic design with native trees, shade-loving plants, and organic pathways."
  },
  {
    id: 'contemporary-urban',
    name: 'Contemporary Urban',
    before: '/images/comparison/contemporary-before.png',
    after: '/images/comparison/contemporary-after.png',
    image: '/images/comparison/contemporary-after.png',
    description: "Innovative use of space with vertical gardens, container plants, and modern materials."
  },
  {
    id: 'english-cottage',
    name: 'English Cottage Garden',
    before: '/images/comparison/english-before.png',
    after: '/images/comparison/english-after.png',
    image: '/images/comparison/english-after.png',
    description: "Lush, romantic garden with densely planted flowering perennials, climbing roses, and informal design."
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    before: '/images/comparison/modern-before.png',
    after: '/images/comparison/modern-after.png',
    image: '/images/comparison/modern-after.png',
    description: "Clean lines, architectural plants, and simple color palette with emphasis on form and texture."
  },
  // {
  //   id: 'mediterranean',
  //   name: 'Mediterranean Garden',
  //   before: '/images/comparison/mediterranean-before.jpg',
  //   after: '/images/comparison/mediterranean-after.jpg',
  //   image: '/images/comparison/mediterranean-after.jpg',
  //   description: "Drought-tolerant plants, terracotta elements, and gravel paths inspired by the Mediterranean climate."
  // },
  // {
  //   id: 'tropical-paradise',
  //   name: 'Tropical Paradise',
  //   before: '/images/comparison/tropical-before.jpg',
  //   after: '/images/comparison/tropical-after.jpg',
  //   image: '/images/comparison/tropical-after.jpg',
  //   description: "Lush foliage, vibrant flowers, and water features creating a resort-like atmosphere."
  // },
  // {
  //   id: 'french-formal',
  //   name: 'French Formal Garden',
  //   before: '/images/comparison/french-before.jpg',
  //   after: '/images/comparison/french-after.jpg',
  //   image: '/images/comparison/french-after.jpg',
  //   description: "Symmetrical design with carefully manicured hedges, geometric patterns, and classical elements."
  // },
  // {
  //   id: 'desert-xeriscape',
  //   name: 'Desert Landscape',
  //   before: '/images/comparison/desert-before.jpg',
  //   after: '/images/comparison/desert-after.jpg',
  //   image: '/images/comparison/desert-after.jpg',
  //   description: "Featuring cacti, succulents, and rocky elements adapted to arid conditions."
  // },
  // {
  //   id: 'japanese-zen',
  //   name: 'Japanese Zen Garden',
  //   before: '/images/comparison/japanese-before.jpg',
  //   after: '/images/comparison/japanese-after.jpg',
  //   image: '/images/comparison/japanese-after.jpg',
  //   description: "Minimalist design featuring carefully arranged rocks, gravel, and pruned plants to create a tranquil meditation space."
  // },
  // {
  //   id: 'chinese-classical',
  //   name: 'Chinese Classical Garden',
  //   before: '/images/comparison/chinese-classical-before.jpg',
  //   after: '/images/comparison/chinese-classical-after.jpg',
  //   image: '/images/comparison/chinese-classical-after.jpg',
  //   description: "Harmonious design with water features, ornate pavilions, and symbolic elements."
  // },
  {
    id: 'coastal-garden',
    name: 'Coastal Garden',
    before: '/images/comparison/coastal-before.png',
    after: '/images/comparison/coastal-after.png',
    image: '/images/comparison/coastal-after.png',
    description: "Seaside-inspired garden featuring salt-tolerant plants, grasses, and coastal elements."
  }
];

export default gardenStyles; 