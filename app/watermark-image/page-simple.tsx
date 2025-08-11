"use client"

import React, { useState, useCallback, useRef } from 'react'
import { 
  Droplets, 
  Download, 
  Upload,
  Settings,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Palette,
  RotateCw,
  Move,
  Eye,
  EyeOff,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { validateImageFile, downloadFile } from '@/lib/utils'

interface WatermarkOptions {
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textAlign: 'left' | 'center' | 'right'
  color: string
  backgroundColor: string
  opacity: number
  rotation: number
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom'
  customX: number
  customY: number
  padding: number
  borderRadius: number
  shadow: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
}

export default function AdvancedWatermarkPage() {
  const [files, setFiles] = useState<File[]>([])
  const [watermarkedImages, setWatermarkedImages] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Font families available
  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro'
  ]
  
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    text: 'WATERMARK',
    fontSize: 48,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#ffffff',
    backgroundColor: 'transparent',
    opacity: 70,
    rotation: 0,
    position: 'center',
    customX: 50,
    customY: 50,
    padding: 20,
    borderRadius: 0,
    shadow: true,
    shadowColor: '#000000',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    setFiles(validFiles)
    setWatermarkedImages({})
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  // Calculate watermark position
  const calculatePosition = (canvasWidth: number, canvasHeight: number, textWidth: number, textHeight: number) => {
    const padding = watermarkOptions.padding
    
    switch (watermarkOptions.position) {
      case 'top-left':
        return { x: padding, y: padding + textHeight }
      case 'top-center':
        return { x: (canvasWidth - textWidth) / 2, y: padding + textHeight }
      case 'top-right':
        return { x: canvasWidth - textWidth - padding, y: padding + textHeight }
      case 'center-left':
        return { x: padding, y: (canvasHeight + textHeight) / 2 }
      case 'center':
        return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight + textHeight) / 2 }
      case 'center-right':
        return { x: canvasWidth - textWidth - padding, y: (canvasHeight + textHeight) / 2 }
      case 'bottom-left':
        return { x: padding, y: canvasHeight - padding }
      case 'bottom-center':
        return { x: (canvasWidth - textWidth) / 2, y: canvasHeight - padding }
      case 'bottom-right':
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding }
      case 'custom':
        return { 
          x: (watermarkOptions.customX / 100) * canvasWidth, 
          y: (watermarkOptions.customY / 100) * canvasHeight 
        }
      default:
        return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight + textHeight) / 2 }
    }
  }

  // Apply watermark to image
  const applyWatermark = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current
      if (!canvas) {
        reject(new Error('Canvas not available'))
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      const img = new Image()
      img.onload = () => {
        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Save context state
        ctx.save()
        
        // Set font properties
        const fontStyle = `${watermarkOptions.fontStyle} ${watermarkOptions.fontWeight} ${watermarkOptions.fontSize}px ${watermarkOptions.fontFamily}`
        ctx.font = fontStyle
        ctx.textAlign = watermarkOptions.textAlign as CanvasTextAlign
        ctx.textBaseline = 'middle'
        
        // Measure text
        const textMetrics = ctx.measureText(watermarkOptions.text)
        const textWidth = textMetrics.width
        const textHeight = watermarkOptions.fontSize
        
        // Calculate position
        const position = calculatePosition(canvas.width, canvas.height, textWidth, textHeight)
        
        // Apply rotation if needed
        if (watermarkOptions.rotation !== 0) {
          ctx.translate(position.x + textWidth / 2, position.y - textHeight / 2)
          ctx.rotate((watermarkOptions.rotation * Math.PI) / 180)
          ctx.translate(-textWidth / 2, textHeight / 2)
        } else {
          ctx.translate(position.x, position.y)
        }
        
        // Apply shadow if enabled
        if (watermarkOptions.shadow) {
          ctx.shadowColor = watermarkOptions.shadowColor
          ctx.shadowBlur = watermarkOptions.shadowBlur
          ctx.shadowOffsetX = watermarkOptions.shadowOffsetX
          ctx.shadowOffsetY = watermarkOptions.shadowOffsetY
        }
        
        // Draw background if not transparent
        if (watermarkOptions.backgroundColor !== 'transparent') {
          ctx.fillStyle = watermarkOptions.backgroundColor
          ctx.globalAlpha = watermarkOptions.opacity / 100
          
          const bgPadding = 10
          const bgX = -bgPadding
          const bgY = -textHeight - bgPadding
          const bgWidth = textWidth + (bgPadding * 2)
          const bgHeight = textHeight + (bgPadding * 2)
          
          if (watermarkOptions.borderRadius > 0) {
            ctx.beginPath()
            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, watermarkOptions.borderRadius)
            ctx.fill()
          } else {
            ctx.fillRect(bgX, bgY, bgWidth, bgHeight)
          }
        }
        
        // Draw text
        ctx.fillStyle = watermarkOptions.color
        ctx.globalAlpha = watermarkOptions.opacity / 100
        ctx.fillText(watermarkOptions.text, 0, 0)
        
        // Restore context state
        ctx.restore()
        
        // Convert to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/png', 0.9)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [watermarkOptions])

  // Process all images
  const processImages = useCallback(async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const results: { [key: string]: string } = {}

    try {
      for (const file of files) {
        const watermarkedUrl = await applyWatermark(file)
        results[file.name] = watermarkedUrl
      }
      setWatermarkedImages(results)
    } catch (error) {
      console.error('Watermarking failed:', error)
      alert('Failed to apply watermarks. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [files, applyWatermark])

  // Download single image
  const downloadImage = (fileName: string, url: string) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const newFileName = fileName.replace(/\.[^/.]+$/, '_watermarked.png')
        downloadFile(blob, newFileName)
      })
  }

  // Download all images
  const downloadAllImages = () => {
    Object.entries(watermarkedImages).forEach(([fileName, url]) => {
      setTimeout(() => downloadImage(fileName, url), 100)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-2">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Advanced Watermark Designer
                </h1>
                <p className="text-sm text-gray-600">
                  Add professional watermarks with advanced typography and effects
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>
