export interface GardenStyle {
  id: string;
  name: string;
  before: string;
  after: string;
  image?: string;
  description?: string;
  isActive?: boolean;
  positivePrompts: string;
  negativePrompts: string;
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
    description: "Naturalistic design with native trees, shade-loving plants, and organic pathways.",
    positivePrompts: "shady woodland, native trees, ferns, moss, wildflowers, natural pathways, dappled sunlight, woodland floor, organic shapes",
    negativePrompts: ""
  },
  {
    id: 'contemporary-urban',
    name: 'Contemporary Urban',
    before: '/images/comparison/contemporary-before.png',
    after: '/images/comparison/contemporary-after.png',
    image: '/images/comparison/contemporary-after.png',
    description: "Innovative use of space with vertical gardens, container plants, and modern materials.",
    positivePrompts: "modern architecture, vertical garden, geometric shapes, minimalist design, urban oasis, container plants, clean lines, contemporary materials",
    negativePrompts: ""
  },
  {
    id: 'english-cottage',
    name: 'English Cottage Garden',
    before: '/images/comparison/english-before.png',
    after: '/images/comparison/english-after.png',
    image: '/images/comparison/english-after.png',
    description: "Lush, romantic garden with densely planted flowering perennials, climbing roses, and informal design.",
    positivePrompts: "romantic flowers, climbing roses, cottage garden, wildflowers, informal design, lush vegetation, traditional English garden, mixed borders",
    negativePrompts: ""
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    before: '/images/comparison/modern-before.png',
    after: '/images/comparison/modern-after.png',
    image: '/images/comparison/modern-after.png',
    description: "Clean lines, architectural plants, and simple color palette with emphasis on form and texture.",
    positivePrompts: "minimalist design, architectural plants, clean lines, monochromatic, geometric shapes, simple palette, modern aesthetics, structured layout",
    negativePrompts: ""
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
    description: "Seaside-inspired garden featuring salt-tolerant plants, grasses, and coastal elements.",
    positivePrompts: "coastal plants, beach grasses, driftwood, seashells, sandy soil, salt-tolerant vegetation, ocean breeze, coastal landscape",
    negativePrompts: ""
  }
];

export default gardenStyles;

// 通用花园相关提示词
export const commonGardenPrompts = {
  positivePrompts: "beautiful garden, well-maintained, professional landscaping, perfect lighting, natural beauty, harmonious design, balanced composition, seasonal flowers, healthy plants, vibrant colors, detailed textures, perfect weather, ideal conditions, professional photography",
  negativePrompts: "overgrown, weeds, dead plants, poor maintenance, artificial looking, unrealistic colors, poor lighting, bad weather, low quality, blurry, distorted perspective, unnatural elements"
};

// 通用渲染质量相关提示词
export const commonRenderingPrompts = {
  positivePrompts: "high quality, 8k resolution, photorealistic, detailed textures, perfect lighting, sharp focus, professional photography, cinematic composition, perfect exposure, natural colors, depth of field, atmospheric effects, perfect shadows, realistic materials",
  negativePrompts: "low quality, blurry, pixelated, unrealistic, artificial looking, poor lighting, bad composition, oversaturated, underexposed, distorted, amateur photography, unrealistic materials, poor textures"
}; 