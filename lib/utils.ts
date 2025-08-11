import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)
}

export function removeFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "")
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, WebP, or GIF)'
    }
  }
  
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 50MB'
    }
  }
  
  return { isValid: true }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  })
}

export const compressionPresets = {
  web: {
    name: 'Web Optimized',
    quality: 0.8,
    maxWidthOrHeight: 1920,
    description: 'Perfect for websites and social media'
  },
  email: {
    name: 'Email Friendly',
    quality: 0.7,
    maxWidthOrHeight: 1200,
    description: 'Smaller files for email attachments'
  },
  print: {
    name: 'Print Quality',
    quality: 0.9,
    maxWidthOrHeight: 3000,
    description: 'High quality for printing'
  },
  thumbnail: {
    name: 'Thumbnail',
    quality: 0.6,
    maxWidthOrHeight: 400,
    description: 'Small thumbnails and previews'
  },
  custom: {
    name: 'Custom',
    quality: 0.8,
    maxWidthOrHeight: 1920,
    description: 'Customize your own settings'
  }
}

export type CompressionPreset = keyof typeof compressionPresets
