"use client"

import React, { useState, useCallback } from 'react'
import {
  Maximize2,
  Download,
  Upload,
  Settings,
  HelpCircle
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

interface ResizeOptions {
  width: number
  height: number
  maintainAspectRatio: boolean
  resizeMethod: 'contain' | 'cover' | 'fill'
  quality: number
}

export default function ResizeImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [resizedImages, setResizedImages] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: 800,
    height: 600,
    maintainAspectRatio: true,
    resizeMethod: 'contain',
    quality: 90
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    setFiles(validFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  })

  const resizeImage = useCallback((file: File, options: ResizeOptions): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        let { width, height } = options

        if (options.maintainAspectRatio) {
          const aspectRatio = img.width / img.height
          // Scale to fit within the specified dimensions while maintaining aspect ratio
          if (width / height > aspectRatio) {
            width = height * aspectRatio
          } else {
            height = width / aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, width, height)
          
          // Set background to white for JPEG
          if (file.type === 'image/jpeg') {
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, width, height)
          }

          // Draw resized image
          switch (options.resizeMethod) {
            case 'contain':
              const scale = Math.min(width / img.width, height / img.height)
              const scaledWidth = img.width * scale
              const scaledHeight = img.height * scale
              const x = (width - scaledWidth) / 2
              const y = (height - scaledHeight) / 2
              ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
              break
            case 'cover':
              const scaleX = width / img.width
              const scaleY = height / img.height
              const scaleMax = Math.max(scaleX, scaleY)
              const cropWidth = width / scaleMax
              const cropHeight = height / scaleMax
              const cropX = (img.width - cropWidth) / 2
              const cropY = (img.height - cropHeight) / 2
              ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, width, height)
              break
            case 'fill':
            default:
              ctx.drawImage(img, 0, 0, width, height)
              break
          }

          // Convert to blob and create URL
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve(url)
            } else {
              reject(new Error('Failed to create blob'))
            }
          }, file.type, options.quality / 100)
        } else {
          reject(new Error('Failed to get canvas context'))
        }
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  const handleResize = useCallback(async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const newResizedImages: { [key: string]: string } = {}

    try {
      for (const file of files) {
        const resizedUrl = await resizeImage(file, resizeOptions)
        newResizedImages[file.name] = resizedUrl
      }
      setResizedImages(newResizedImages)
    } catch (error) {
      console.error('Resize failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [files, resizeOptions, resizeImage])

  const handleDownload = useCallback((fileName: string) => {
    const url = resizedImages[fileName]
    if (url) {
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const extension = fileName.split('.').pop()
          const newFileName = `${fileName.replace(/\.[^/.]+$/, '')}_resized.${extension}`
          downloadFile(blob, newFileName)
        })
        .catch(error => console.error('Download failed:', error))
    }
  }, [resizedImages])

  const presetSizes = [
    // Instagram
    { name: 'Instagram Square Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Instagram Reel', width: 1080, height: 1920 },
    { name: 'Instagram IGTV Cover', width: 420, height: 654 },

    // Facebook
    { name: 'Facebook Cover Photo', width: 1200, height: 630 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Facebook Story', width: 1080, height: 1920 },
    { name: 'Facebook Event Cover', width: 1920, height: 1080 },

    // Twitter/X
    { name: 'Twitter Header', width: 1500, height: 500 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'Twitter Card', width: 1200, height: 628 },

    // LinkedIn
    { name: 'LinkedIn Cover', width: 1584, height: 396 },
    { name: 'LinkedIn Post', width: 1200, height: 627 },
    { name: 'LinkedIn Article', width: 1200, height: 627 },

    // YouTube
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'YouTube Channel Art', width: 2560, height: 1440 },
    { name: 'YouTube Short', width: 1080, height: 1920 },

    // TikTok
    { name: 'TikTok Video', width: 1080, height: 1920 },
    { name: 'TikTok Profile', width: 200, height: 200 },

    // Pinterest
    { name: 'Pinterest Pin', width: 1000, height: 1500 },
    { name: 'Pinterest Board Cover', width: 600, height: 600 },

    // Common Sizes
    { name: 'Profile Picture', width: 400, height: 400 },
    { name: 'Website Banner', width: 1920, height: 600 },
    { name: 'Email Header', width: 600, height: 200 },
    { name: 'HD (1080p)', width: 1920, height: 1080 },
    { name: '4K (2160p)', width: 3840, height: 2160 },
    { name: 'Square (1:1)', width: 1000, height: 1000 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <Maximize2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Resize Image Pixel
                </h1>
                <p className="text-sm text-gray-600">
                  Change image dimensions and resolution with precision
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop images here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP, GIF
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {files.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Images to Resize ({files.length})
                  </h3>
                  <button
                    onClick={handleResize}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Maximize2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-5 w-5 mr-2" />
                        Resize Images
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {files.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Preview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, index) => (
                    <div key={`resize-preview-${file.name}-${index}`} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {file.name}
                      </div>
                      {resizedImages[file.name] && (
                        <Button
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => handleDownload(file.name)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resized Preview */}
            {Object.keys(resizedImages).length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resized Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(resizedImages).map(([fileName, url]) => (
                    <div key={fileName} className="relative">
                      <img
                        src={url}
                        alt={`Resized ${fileName}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {resizeOptions.width} × {resizeOptions.height}
                      </div>
                      <Button
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => handleDownload(fileName)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Resize Settings
                </h3>
                <Button
                  onClick={handleResize}
                  disabled={isProcessing || files.length === 0}
                >
                  {isProcessing ? 'Processing...' : 'Resize Images'}
                </Button>
              </div>

              {/* Preset Sizes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quick Presets</label>
                <Select
                  onValueChange={(value) => {
                    const preset = presetSizes.find(p => p.name === value)
                    if (preset) {
                      setResizeOptions(prev => ({
                        ...prev,
                        width: preset.width,
                        height: preset.height
                      }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset size" />
                  </SelectTrigger>
                  <SelectContent>
                    {presetSizes.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name} ({preset.width}×{preset.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (px)</label>
                  <input
                    type="number"
                    value={resizeOptions.width}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      width: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (px)</label>
                  <input
                    type="number"
                    value={resizeOptions.height}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      height: parseInt(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Resize Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Resize Method</label>
                <Select
                  value={resizeOptions.resizeMethod}
                  onValueChange={(value: any) => setResizeOptions(prev => ({
                    ...prev,
                    resizeMethod: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Contain (fit within)</SelectItem>
                    <SelectItem value="cover">Cover (fill area)</SelectItem>
                    <SelectItem value="fill">Fill (stretch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-gray-500">{resizeOptions.quality}%</span>
                </div>
                <Slider
                  value={[resizeOptions.quality]}
                  onValueChange={(value) => setResizeOptions(prev => ({
                    ...prev,
                    quality: value[0]
                  }))}
                  max={100}
                  min={10}
                  step={5}
                />
              </div>

              {/* Maintain Aspect Ratio */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={resizeOptions.maintainAspectRatio}
                    onChange={(e) => setResizeOptions(prev => ({
                      ...prev,
                      maintainAspectRatio: e.target.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="maintainAspectRatio" className="text-sm font-medium">
                    Maintain aspect ratio
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {resizeOptions.maintainAspectRatio
                    ? "Image will fit within dimensions while keeping proportions"
                    : "Image will be stretched to exact dimensions"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
