"use client"

import React, { useState, useCallback, useRef } from 'react'
import {
  Crop,
  Download,
  Upload,
  Settings,
  RotateCcw
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { validateImageFile, downloadFile } from '@/lib/utils'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface CropOptions {
  aspectRatio: string
  quality: number
}

export default function CropImagePage() {
  const [file, setFile] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  
  const [cropOptions, setCropOptions] = useState<CropOptions>({
    aspectRatio: 'free',
    quality: 90
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFile = acceptedFiles.find(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    if (validFile) {
      setFile(validFile)
      setCroppedImage(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDragging(true)
    setDragStart({ x, y })
    setCropArea({ x, y, width: 0, height: 0 })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const width = Math.abs(x - dragStart.x)
    const height = Math.abs(y - dragStart.y)
    const startX = Math.min(x, dragStart.x)
    const startY = Math.min(y, dragStart.y)
    
    // Apply aspect ratio if selected
    let finalWidth = width
    let finalHeight = height
    
    if (cropOptions.aspectRatio !== 'free') {
      const ratio = parseFloat(cropOptions.aspectRatio)
      if (width / height > ratio) {
        finalWidth = height * ratio
      } else {
        finalHeight = width / ratio
      }
    }
    
    setCropArea({
      x: startX,
      y: startY,
      width: finalWidth,
      height: finalHeight
    })
  }, [isDragging, dragStart, cropOptions.aspectRatio])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const cropImage = useCallback(async () => {
    if (!file || !imageRef.current) return

    setIsProcessing(true)
    
    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not available')
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')
      
      const img = imageRef.current
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height
      
      // Calculate actual crop area on the original image
      const actualCropArea = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      }
      
      // Set canvas size to crop area
      canvas.width = actualCropArea.width
      canvas.height = actualCropArea.height
      
      // Draw cropped image
      ctx.drawImage(
        img,
        actualCropArea.x,
        actualCropArea.y,
        actualCropArea.width,
        actualCropArea.height,
        0,
        0,
        actualCropArea.width,
        actualCropArea.height
      )
      
      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          setCroppedImage(url)
        }
      }, file.type, cropOptions.quality / 100)
      
    } catch (error) {
      console.error('Cropping failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [file, cropArea, cropOptions.quality])

  const handleDownload = useCallback(() => {
    if (croppedImage && file) {
      fetch(croppedImage)
        .then(response => response.blob())
        .then(blob => {
          const extension = file.name.split('.').pop()
          const newFileName = `${file.name.replace(/\.[^/.]+$/, '')}_cropped.${extension}`
          downloadFile(blob, newFileName)
        })
        .catch(error => console.error('Download failed:', error))
    }
  }, [croppedImage, file])

  const resetCrop = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current
      setCropArea({
        x: img.width * 0.1,
        y: img.height * 0.1,
        width: img.width * 0.8,
        height: img.height * 0.8
      })
    }
  }, [])

  const aspectRatios = [
    { name: 'Free', value: 'free' },
    { name: 'Square (1:1)', value: '1' },
    { name: 'Portrait (3:4)', value: '0.75' },
    { name: 'Landscape (4:3)', value: '1.333' },
    { name: 'Wide (16:9)', value: '1.777' },
    { name: 'Instagram Square', value: '1.0' },
    { name: 'Facebook Cover (1.91:1)', value: '1.91' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-4 shadow-lg">
              <Crop className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Cropper
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crop and resize images with precision and custom aspect ratios. Perfect for social media and professional use.
          </p>
        </div>
        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {!file && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-green-600 font-medium">Drop image here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2 text-gray-900">
                      Drag & drop an image here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPEG, PNG, WebP • Single file only
                    </p>
                  </div>
                )}
              </div>
          )}
        </div>

        {/* Image Cropping Area */}
        {file && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Crop Your Image</h3>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={resetCrop}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  Change Image
                </Button>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative inline-block border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
                <img
                  ref={imageRef}
                  src={URL.createObjectURL(file)}
                  alt="Crop preview"
                  className="max-w-full max-h-96 block"
                  onLoad={resetCrop}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: 'crosshair' }}
                />

                {/* Crop overlay */}
                <div
                  className="absolute border-2 border-green-500 bg-green-500/20"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="absolute inset-0 border border-white/50"></div>
                </div>
              </div>
            </div>

            <p className="text-center text-gray-600 mb-6">
              Click and drag to select the area you want to crop
            </p>
          </div>
        )}

        {/* Cropped Result */}
        {croppedImage && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Cropped Image</h3>
              <Button onClick={handleDownload} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 shadow-inner">
                <img
                  src={croppedImage}
                  alt="Cropped result"
                  className="max-w-full max-h-64 mx-auto block rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {file && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center text-gray-900">
                <Settings className="h-6 w-6 mr-3 text-green-600" />
                Crop Settings
              </h3>
              <Button
                onClick={cropImage}
                disabled={isProcessing || !file || cropArea.width === 0}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {isProcessing ? 'Processing...' : 'Crop Image'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Aspect Ratio</label>
                <Select
                  value={cropOptions.aspectRatio}
                  onValueChange={(value) => setCropOptions(prev => ({
                    ...prev,
                    aspectRatio: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio.value} value={ratio.value}>
                        {ratio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-gray-700">Output Quality</label>
                  <span className="text-sm text-gray-500">{cropOptions.quality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={cropOptions.quality}
                  onChange={(e) => setCropOptions(prev => ({
                    ...prev,
                    quality: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

            </div>

            {/* Crop Info */}
            {file && cropArea.width > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
                <h4 className="text-lg font-semibold text-green-800 mb-4">Crop Information</h4>
                <div className="grid grid-cols-3 gap-4 text-sm text-green-700">
                  <div className="text-center">
                    <div className="font-medium">Width</div>
                    <div>{Math.round(cropArea.width)}px</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Height</div>
                    <div>{Math.round(cropArea.height)}px</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Aspect Ratio</div>
                    <div>{(cropArea.width / cropArea.height).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-4">💡 Pro Tips</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Click and drag to select the crop area</li>
                <li>• Use preset aspect ratios for social media</li>
                <li>• Higher quality settings create larger files</li>
                <li>• Reset to start over with a new selection</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
