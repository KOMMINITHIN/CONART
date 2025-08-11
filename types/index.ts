export interface ImageFile {
  id: string
  file: File
  originalSize: number
  compressedSize?: number
  compressionRatio?: number
  preview: string
  compressedPreview?: string
  status: 'pending' | 'compressing' | 'completed' | 'error'
  error?: string
  downloadUrl?: string
  dimensions?: {
    width: number
    height: number
  }
  metadata?: {
    format: string
    colorSpace?: string
    hasAlpha?: boolean
  }
}

export interface CompressionOptions {
  quality: number
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  preserveExif?: boolean
  targetFormat?: 'jpeg' | 'png' | 'webp'
  targetSizeKB?: number
}

export interface CompressionResult {
  success: boolean
  file?: File
  error?: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export interface CompressionStats {
  totalFiles: number
  totalOriginalSize: number
  totalCompressedSize: number
  totalSavings: number
  averageCompressionRatio: number
}

export interface WatermarkOptions {
  text?: string
  image?: File
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  size: number
}

export interface ResizeOptions {
  width?: number
  height?: number
  maintainAspectRatio: boolean
  resizeMethod: 'contain' | 'cover' | 'fill'
}

export interface BatchProcessingOptions extends CompressionOptions {
  watermark?: WatermarkOptions
  resize?: ResizeOptions
  outputFormat?: 'jpeg' | 'png' | 'webp'
  filenamePrefix?: string
  filenameSuffix?: string
}

export interface HistoryItem {
  id: string
  timestamp: Date
  originalFilename: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
  settings: CompressionOptions
}

export interface EducationalContent {
  title: string
  description: string
  tips: string[]
  examples?: {
    before: string
    after: string
    description: string
  }[]
}

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp: Date
}
