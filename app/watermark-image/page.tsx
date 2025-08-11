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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Images</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragActive ? 'border-cyan-400 bg-cyan-50' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-cyan-600 font-medium">Drop images here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop images here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse • Multiple files supported
                    </p>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {files.length} image{files.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <ImageIcon className="h-4 w-4 text-blue-600" />
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Watermark Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Watermark Settings
              </h3>

              <div className="space-y-4">
                {/* Text Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkOptions.text}
                    onChange={(e) => setWatermarkOptions(prev => ({ ...prev, text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter watermark text"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Family
                  </label>
                  <Select
                    value={watermarkOptions.fontFamily}
                    onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, fontFamily: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(font => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font Size: {watermarkOptions.fontSize}px
                  </label>
                  <Slider
                    value={[watermarkOptions.fontSize]}
                    onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, fontSize: value[0] }))}
                    min={12}
                    max={200}
                    step={2}
                    className="w-full"
                  />
                </div>

                {/* Text Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Style
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={watermarkOptions.fontWeight === 'bold' ? 'default' : 'outline'}
                      onClick={() => setWatermarkOptions(prev => ({
                        ...prev,
                        fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold'
                      }))}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={watermarkOptions.fontStyle === 'italic' ? 'default' : 'outline'}
                      onClick={() => setWatermarkOptions(prev => ({
                        ...prev,
                        fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic'
                      }))}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Alignment
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={watermarkOptions.textAlign === 'left' ? 'default' : 'outline'}
                      onClick={() => setWatermarkOptions(prev => ({ ...prev, textAlign: 'left' }))}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={watermarkOptions.textAlign === 'center' ? 'default' : 'outline'}
                      onClick={() => setWatermarkOptions(prev => ({ ...prev, textAlign: 'center' }))}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={watermarkOptions.textAlign === 'right' ? 'default' : 'outline'}
                      onClick={() => setWatermarkOptions(prev => ({ ...prev, textAlign: 'right' }))}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={watermarkOptions.color}
                        onChange={(e) => setWatermarkOptions(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={watermarkOptions.color}
                        onChange={(e) => setWatermarkOptions(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={watermarkOptions.backgroundColor === 'transparent' ? '#ffffff' : watermarkOptions.backgroundColor}
                        onChange={(e) => setWatermarkOptions(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <Button
                        size="sm"
                        variant={watermarkOptions.backgroundColor === 'transparent' ? 'default' : 'outline'}
                        onClick={() => setWatermarkOptions(prev => ({
                          ...prev,
                          backgroundColor: prev.backgroundColor === 'transparent' ? '#ffffff' : 'transparent'
                        }))}
                        className="text-xs"
                      >
                        Transparent
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacity: {watermarkOptions.opacity}%
                  </label>
                  <Slider
                    value={[watermarkOptions.opacity]}
                    onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, opacity: value[0] }))}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <Select
                    value={watermarkOptions.position}
                    onValueChange={(value: any) => setWatermarkOptions(prev => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="center-left">Center Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="center-right">Center Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="custom">Custom Position</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rotation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rotation: {watermarkOptions.rotation}°
                  </label>
                  <Slider
                    value={[watermarkOptions.rotation]}
                    onValueChange={(value) => setWatermarkOptions(prev => ({ ...prev, rotation: value[0] }))}
                    min={-180}
                    max={180}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Shadow Toggle */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={watermarkOptions.shadow}
                      onChange={(e) => setWatermarkOptions(prev => ({ ...prev, shadow: e.target.checked }))}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm text-gray-700">Add Text Shadow</span>
                  </label>
                </div>

                {/* Apply Button */}
                <Button
                  onClick={processImages}
                  disabled={files.length === 0 || isProcessing}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                >
                  {isProcessing ? 'Processing...' : 'Apply Watermarks'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {Object.keys(watermarkedImages).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Watermarked Images ({Object.keys(watermarkedImages).length})
                  </h3>
                  <Button
                    onClick={downloadAllImages}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(watermarkedImages).map(([fileName, url]) => (
                    <div key={fileName} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-video bg-gray-50 flex items-center justify-center">
                        <img
                          src={url}
                          alt={fileName}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 truncate">
                            {fileName.replace(/\.[^/.]+$/, '_watermarked.png')}
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => downloadImage(fileName, url)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {files.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Images Selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload images to start adding professional watermarks
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <Type className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
                    <p>Custom Text</p>
                  </div>
                  <div className="text-center">
                    <Palette className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p>Color Options</p>
                  </div>
                  <div className="text-center">
                    <RotateCw className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Rotation</p>
                  </div>
                  <div className="text-center">
                    <Move className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p>Positioning</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
