export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: 'image' | 'pdf' | 'document'
  path: string
  isNew?: boolean
  isPro?: boolean
}

export const tools: Tool[] = [
  // Image Tools
  {
    id: 'compress-image',
    name: 'Compress Image',
    description: 'Reduce image file size while maintaining quality',
    icon: '🗜️',
    category: 'image',
    path: '/compress-image'
  },
  {
    id: 'resize-image',
    name: 'Resize Image Pixel',
    description: 'Change image dimensions and resolution with precision',
    icon: '📐',
    category: 'image',
    path: '/resize-image'
  },
  {
    id: 'watermark-image',
    name: 'Watermark Image',
    description: 'Add text watermarks to protect and brand your images',
    icon: '💧',
    category: 'image',
    path: '/watermark-image',
    isNew: true
  },
  {
    id: 'crop-image',
    name: 'Crop Image',
    description: 'Crop and resize images with custom aspect ratios',
    icon: '✂️',
    category: 'image',
    path: '/crop-image',
    isNew: true
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove backgrounds from images automatically using AI',
    icon: '🎭',
    category: 'image',
    path: '/background-remover',
    isNew: true
  },
  {
    id: 'convert-image',
    name: 'Convert Image Format',
    description: 'Convert images between different formats (JPEG, PNG, WebP, BMP)',
    icon: '🔄',
    category: 'image',
    path: '/convert-image',
    isNew: true
  },
  {
    id: 'change-dpi',
    name: 'Change Image DPI',
    description: 'Adjust DPI (Dots Per Inch) for print or web use',
    icon: '⚙️',
    category: 'image',
    path: '/change-dpi',
    isNew: true
  },
  {
    id: 'passport-photo',
    name: 'Passport Photo Maker',
    description: 'Create professional passport and ID photos',
    icon: '📷',
    category: 'image',
    path: '/passport-photo',
    isNew: true
  },
  // PDF Tools
  {
    id: 'images-to-pdf',
    name: 'Images To PDF',
    description: 'Create PDF from multiple images',
    icon: '📸',
    category: 'pdf',
    path: '/images-to-pdf',
    isNew: true
  },
  {
    id: 'pdf-to-images',
    name: 'PDF To Images',
    description: 'Extract pages from PDF files as individual images',
    icon: '🖼️',
    category: 'pdf',
    path: '/pdf-to-images',
    isNew: true
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: '📄',
    category: 'pdf',
    path: '/compress-pdf',
    isNew: true
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF Files',
    description: 'Combine multiple PDF files into a single document',
    icon: '📋',
    category: 'pdf',
    path: '/merge-pdf',
    isNew: true
  },

  // Document Tools
  {
    id: 'signature-maker',
    name: 'Signature Maker',
    description: 'Create digital signatures for documents',
    icon: '✍️',
    category: 'document',
    path: '/signature-maker',
    isNew: true
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Create QR codes for text, URLs, emails, and more',
    icon: '📱',
    category: 'document',
    path: '/qr-generator',
    isNew: true
  }
]

export const getToolsByCategory = (category: Tool['category']) => {
  return tools.filter(tool => tool.category === category)
}

export const getToolById = (id: string) => {
  return tools.find(tool => tool.id === id)
}

export const getAllCategories = () => {
  return Array.from(new Set(tools.map(tool => tool.category)))
}
