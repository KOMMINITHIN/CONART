import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { ImageFile, CompressionOptions, CompressionResult } from '@/types'
import { generateUniqueId, calculateCompressionRatio, getImageDimensions } from '@/lib/utils'

export function useImageCompression() {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isCompressing, setIsCompressing] = useState(false)

  const addFiles = useCallback(async (newFiles: File[]) => {
    const imageFiles: ImageFile[] = []
    
    for (const file of newFiles) {
      try {
        const dimensions = await getImageDimensions(file)
        const preview = URL.createObjectURL(file)
        
        const imageFile: ImageFile = {
          id: generateUniqueId(),
          file,
          originalSize: file.size,
          preview,
          status: 'pending',
          dimensions,
          metadata: {
            format: file.type,
          }
        }
        
        imageFiles.push(imageFile)
      } catch (error) {
        console.error('Error processing file:', error)
      }
    }
    
    setFiles(prev => [...prev, ...imageFiles])
  }, [])

  const compressImage = useCallback(async (
    imageFile: ImageFile, 
    options: CompressionOptions
  ): Promise<CompressionResult> => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === imageFile.id 
          ? { ...f, status: 'compressing' as const }
          : f
      ))

      let compressionOptions: any = {
        maxSizeMB: options.maxSizeMB || 1,
        maxWidthOrHeight: options.maxWidthOrHeight || 1920,
        useWebWorker: options.useWebWorker !== false,
        preserveExif: options.preserveExif || false,
      }

      // Handle target file size compression
      if (options.targetSizeKB) {
        compressionOptions.maxSizeMB = options.targetSizeKB / 1024
        
        // Use binary search approach for precise size targeting
        let quality = options.quality
        let attempts = 0
        const maxAttempts = 5
        
        while (attempts < maxAttempts) {
          compressionOptions.initialQuality = quality
          
          const compressedFile = await imageCompression(imageFile.file, compressionOptions)
          const compressedSizeKB = compressedFile.size / 1024
          
          if (Math.abs(compressedSizeKB - options.targetSizeKB) <= options.targetSizeKB * 0.1) {
            // Within 10% tolerance
            break
          }
          
          if (compressedSizeKB > options.targetSizeKB) {
            quality *= 0.8 // Reduce quality
          } else {
            quality *= 1.1 // Increase quality
          }
          
          quality = Math.max(0.1, Math.min(1, quality))
          attempts++
        }
      } else {
        compressionOptions.initialQuality = options.quality
      }

      // Handle format conversion
      if (options.targetFormat) {
        compressionOptions.fileType = `image/${options.targetFormat}`
      }

      const compressedFile = await imageCompression(imageFile.file, compressionOptions)
      
      const compressionRatio = calculateCompressionRatio(
        imageFile.originalSize, 
        compressedFile.size
      )
      
      const compressedPreview = URL.createObjectURL(compressedFile)
      const downloadUrl = URL.createObjectURL(compressedFile)
      
      setFiles(prev => prev.map(f => 
        f.id === imageFile.id 
          ? { 
              ...f, 
              status: 'completed' as const,
              compressedSize: compressedFile.size,
              compressionRatio,
              compressedPreview,
              downloadUrl
            }
          : f
      ))

      return {
        success: true,
        file: compressedFile,
        originalSize: imageFile.originalSize,
        compressedSize: compressedFile.size,
        compressionRatio
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Compression failed'
      
      setFiles(prev => prev.map(f => 
        f.id === imageFile.id 
          ? { ...f, status: 'error' as const, error: errorMessage }
          : f
      ))

      return {
        success: false,
        error: errorMessage,
        originalSize: imageFile.originalSize,
        compressedSize: 0,
        compressionRatio: 0
      }
    }
  }, [])

  const compressAll = useCallback(async (options: CompressionOptions) => {
    setIsCompressing(true)
    
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const file of pendingFiles) {
      await compressImage(file, options)
    }
    
    setIsCompressing(false)
  }, [files, compressImage])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        // Clean up object URLs
        if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview)
        if (fileToRemove.compressedPreview) URL.revokeObjectURL(fileToRemove.compressedPreview)
        if (fileToRemove.downloadUrl) URL.revokeObjectURL(fileToRemove.downloadUrl)
      }
      return prev.filter(f => f.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    // Clean up all object URLs
    files.forEach(file => {
      if (file.preview) URL.revokeObjectURL(file.preview)
      if (file.compressedPreview) URL.revokeObjectURL(file.compressedPreview)
      if (file.downloadUrl) URL.revokeObjectURL(file.downloadUrl)
    })
    setFiles([])
  }, [files])

  const resetFile = useCallback((id: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { 
            ...f, 
            status: 'pending' as const,
            compressedSize: undefined,
            compressionRatio: undefined,
            compressedPreview: undefined,
            downloadUrl: undefined,
            error: undefined
          }
        : f
    ))
  }, [])

  return {
    files,
    isCompressing,
    addFiles,
    compressImage,
    compressAll,
    removeFile,
    clearAll,
    resetFile
  }
}
