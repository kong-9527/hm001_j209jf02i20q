export interface GardenStyle {
  id: string;
  name: string;
  before: string;
  after: string;
  isActive?: boolean;
}

const gardenStyles: GardenStyle[] = [
  {
    id: 'chinese-classical',
    name: 'Chinese Classical Garden',
    before: '/public/images/comparison/Chinese Classical Garden_before.jfif',
    after: '/public/images/comparison/Chinese Classical Garden_after.jfif',
    isActive: true
  },
  {
    id: 'woodland',
    name: 'Woodland Garden',
    before: '/images/comparison/woodland-before.jpg',
    after: '/images/comparison/woodland-after.jpg'
  },
  {
    id: 'contemporary-urban',
    name: 'Contemporary Urban',
    before: '/images/comparison/contemporary-before.jpg',
    after: '/images/comparison/contemporary-after.jpg'
  },
  {
    id: 'english-cottage',
    name: 'English Cottage Garden',
    before: '/images/comparison/english-before.jpg',
    after: '/images/comparison/english-after.jpg'
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    before: '/images/comparison/modern-before.jpg',
    after: '/images/comparison/modern-after.jpg'
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Garden',
    before: '/images/comparison/mediterranean-before.jpg',
    after: '/images/comparison/mediterranean-after.jpg'
  },
  {
    id: 'rainforest',
    name: 'Rainforest Garden',
    before: '/images/comparison/rainforest-before.jpg',
    after: '/images/comparison/rainforest-after.jpg'
  },
  {
    id: 'french-formal',
    name: 'French Formal Garden',
    before: '/images/comparison/french-before.jpg',
    after: '/images/comparison/french-after.jpg'
  },
  {
    id: 'desert-xeriscape',
    name: 'Desert Xeriscape',
    before: '/images/comparison/desert-before.jpg',
    after: '/images/comparison/desert-after.jpg'
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    before: '/images/comparison/tropical-before.jpg',
    after: '/images/comparison/tropical-after.jpg'
  },
  {
    id: 'scandinavian-modern',
    name: 'Scandinavian Modern',
    before: '/images/comparison/scandinavian-before.jpg',
    after: '/images/comparison/scandinavian-after.jpg'
  },
  {
    id: 'japanese-zen',
    name: 'Japanese Zen Garden',
    before: '/images/comparison/japanese-before.jpg',
    after: '/images/comparison/japanese-after.jpg'
  },
  {
    id: 'prairie-style',
    name: 'Prairie Style Garden',
    before: '/images/comparison/prairie-before.jpg',
    after: '/images/comparison/prairie-after.jpg'
  },
  {
    id: 'moroccan-courtyard',
    name: 'Moroccan Courtyard',
    before: '/images/comparison/moroccan-before.jpg',
    after: '/images/comparison/moroccan-after.jpg'
  },
  {
    id: 'coastal-garden',
    name: 'Coastal Garden',
    before: '/images/comparison/coastal-before.jpg',
    after: '/images/comparison/coastal-after.jpg'
  }
];

export default gardenStyles; 