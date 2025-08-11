"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
  Scissors, 
  Download, 
  Upload,
  Settings,
  HelpCircle,
  Eye,
  EyeOff,
  Wand2,
  RefreshCw,
  Layers,
  Sliders,
  Zap,
  Sparkles,
  Palette,
  Brush
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { validateImageFile, downloadFile } from '@/lib/utils'
import { removeBackground, Config } from '@imgly/background-removal'

interface ProcessingOptions {
  model: 'isnet' | 'isnet_fp16' | 'isnet_quint8'
  outputFormat: 'png' | 'webp'
  quality: number
  edgeSmoothing: boolean
  featherRadius: number
  backgroundType: 'transparent' | 'color' | 'blur'
  backgroundColor: string
  blurIntensity: number
}

interface EdgeRefinement {
  enabled: boolean
  brushSize: number
  mode: 'add' | 'remove'
}

export default function BackgroundRemoverPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const refinementCanvasRef = useRef<HTMLCanvasElement>(null)
  
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    model: 'isnet',
    outputFormat: 'png',
    quality: 95,
    edgeSmoothing: true,
    featherRadius: 2,
    backgroundType: 'transparent',
    backgroundColor: '#ffffff',
    blurIntensity: 10
  })

  const [edgeRefinement, setEdgeRefinement] = useState<EdgeRefinement>({
    enabled: false,
    brushSize: 20,
    mode: 'add'
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFile = acceptedFiles.find(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    if (validFile) {
      setOriginalFile(validFile)
      setProcessedImageUrl(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  // Advanced AI-powered background removal
  const processBackgroundRemoval = useCallback(async () => {
    if (!originalFile) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setIsModelLoading(true)
    
    try {
      // Configure the AI model
      const config: Config = {
        model: processingOptions.model,
        output: {
          format: processingOptions.outputFormat === 'png' ? 'image/png' : 'image/webp',
          quality: processingOptions.quality / 100
        },
        progress: (key: string, current: number, total: number) => {
          const progress = Math.round((current / total) * 100)
          setProcessingProgress(progress)
          if (progress === 100) {
            setIsModelLoading(false)
          }
        }
      }

      // Process the image with AI
      const blob = await removeBackground(originalFile, config)
      
      // Apply post-processing effects
      const processedBlob = await applyPostProcessing(blob)
      
      const url = URL.createObjectURL(processedBlob)
      setProcessedImageUrl(url)
      
    } catch (error) {
      console.error('Background removal failed:', error)
      alert('Failed to remove background. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
      setIsModelLoading(false)
    }
  }, [originalFile, processingOptions])

  // Apply post-processing effects like edge smoothing, background replacement
  const applyPostProcessing = useCallback(async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (!canvas) {
        resolve(blob)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(blob)
        return
      }

      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw the processed image
        ctx.drawImage(img, 0, 0)
        
        // Apply edge smoothing if enabled
        if (processingOptions.edgeSmoothing) {
          applyEdgeSmoothing(ctx, canvas.width, canvas.height)
        }
        
        // Apply background replacement
        if (processingOptions.backgroundType !== 'transparent') {
          applyBackgroundReplacement(ctx, canvas.width, canvas.height)
        }
        
        canvas.toBlob((processedBlob) => {
          resolve(processedBlob || blob)
        }, processingOptions.outputFormat === 'png' ? 'image/png' : 'image/webp', processingOptions.quality / 100)
      }
      
      img.src = URL.createObjectURL(blob)
    })
  }, [processingOptions])

  // Edge smoothing algorithm
  const applyEdgeSmoothing = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const radius = processingOptions.featherRadius
    
    // Apply Gaussian blur to alpha channel for smooth edges
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const idx = (y * width + x) * 4
        if (data[idx + 3] > 0 && data[idx + 3] < 255) {
          let alphaSum = 0
          let count = 0
          
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const neighborIdx = ((y + dy) * width + (x + dx)) * 4
              alphaSum += data[neighborIdx + 3]
              count++
            }
          }
          
          data[idx + 3] = alphaSum / count
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  // Background replacement
  const applyBackgroundReplacement = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    if (processingOptions.backgroundType === 'color') {
      const bgColor = hexToRgb(processingOptions.backgroundColor)
      
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) {
          data[i] = bgColor.r
          data[i + 1] = bgColor.g
          data[i + 2] = bgColor.b
          data[i + 3] = 255
        }
      }
    } else if (processingOptions.backgroundType === 'blur') {
      // Apply blur effect to background areas
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) {
          data[i] = 240
          data[i + 1] = 240
          data[i + 2] = 240
          data[i + 3] = 255
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  const handleDownload = useCallback(() => {
    if (processedImageUrl && originalFile) {
      fetch(processedImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const extension = processingOptions.outputFormat
          const fileName = `${originalFile.name.split('.')[0]}_no_bg.${extension}`
          downloadFile(blob, fileName)
        })
        .catch(error => console.error('Download failed:', error))
    }
  }, [processedImageUrl, originalFile, processingOptions.outputFormat])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={refinementCanvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-2">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Background Remover
                </h1>
                <p className="text-sm text-gray-600">
                  Remove backgrounds from images using advanced AI technology
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
                isDragActive ? 'border-pink-400 bg-pink-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-pink-600 font-medium">Drop images here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP • AI-powered processing
                  </p>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {originalFile && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Preview</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOriginal(!showOriginal)}
                    >
                      {showOriginal ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showOriginal ? 'Hide Original' : 'Show Original'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Image */}
                  {showOriginal && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Original</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(originalFile)}
                          alt="Original"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Processed Image */}
                  {processedImageUrl && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Background Removed</h4>
                      <div className="border rounded-lg overflow-hidden bg-transparent" style={{
                        backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                      }}>
                        <img
                          src={processedImageUrl}
                          alt="Background removed"
                          className="w-full h-64 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {isModelLoading ? 'Loading AI model...' : 'Processing image...'}
                      </span>
                      <span className="text-gray-600">{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Download Button */}
                {processedImageUrl && (
                  <div className="mt-4 flex justify-center">
                    <Button onClick={handleDownload} className="bg-gradient-to-r from-pink-500 to-purple-600">
                      <Download className="h-4 w-4 mr-2" />
                      Download Result
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* AI Model Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center text-gray-900">
                  <Wand2 className="h-5 w-5 mr-2 text-pink-600" />
                  AI Model Settings
                </h3>
                <Button
                  onClick={processBackgroundRemoval}
                  disabled={isProcessing || !originalFile}
                  className="bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Remove Background
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {/* AI Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={processingOptions.model}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      model: e.target.value as ProcessingOptions['model']
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="isnet">ISNet (General Purpose)</option>
                    <option value="isnet_fp16">ISNet FP16 (Faster)</option>
                    <option value="isnet_quint8">ISNet Quint8 (Lightweight)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the best model for your image type
                  </p>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setProcessingOptions(prev => ({ ...prev, outputFormat: 'png' }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        processingOptions.outputFormat === 'png'
                          ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                      }`}
                    >
                      PNG (Lossless)
                    </button>
                    <button
                      onClick={() => setProcessingOptions(prev => ({ ...prev, outputFormat: 'webp' }))}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        processingOptions.outputFormat === 'webp'
                          ? 'bg-pink-100 text-pink-700 border-2 border-pink-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                      }`}
                    >
                      WebP (Smaller)
                    </button>
                  </div>
                </div>

                {/* Quality Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {processingOptions.quality}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={processingOptions.quality}
                    onChange={(e) => setProcessingOptions(prev => ({
                      ...prev,
                      quality: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
