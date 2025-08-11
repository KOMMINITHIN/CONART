"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
  FileImage, 
  Download, 
  Upload,
  Settings,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Zap,
  Grid,
  Eye,
  DownloadCloud,
  Sliders,
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  RefreshCw
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
import { downloadFile } from '@/lib/utils'
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface ConversionOptions {
  format: 'png' | 'jpeg' | 'webp'
  quality: number
  dpi: number
  scale: number
  pageRange: 'all' | 'range' | 'specific'
  startPage: number
  endPage: number
  specificPages: string
  colorSpace: 'rgb' | 'grayscale' | 'cmyk'
  compression: 'none' | 'low' | 'medium' | 'high'
  backgroundRemoval: boolean
  enhanceText: boolean
}

interface ExtractedPage {
  pageNumber: number
  imageUrl: string
  width: number
  height: number
  fileSize: number
  processingTime: number
}

interface PresetOption {
  name: string
  dpi: number
  format: 'png' | 'jpeg' | 'webp'
  quality: number
  description: string
  icon: React.ReactNode
}

export default function AdvancedPDFToImagesPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [previewMode, setPreviewMode] = useState<'grid' | 'list'>('grid')
  
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    format: 'png',
    quality: 95,
    dpi: 300,
    scale: 2,
    pageRange: 'all',
    startPage: 1,
    endPage: 1,
    specificPages: '',
    colorSpace: 'rgb',
    compression: 'medium',
    backgroundRemoval: false,
    enhanceText: true
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Preset options for different use cases
  const presetOptions: PresetOption[] = [
    {
      name: 'Web Optimized',
      dpi: 150,
      format: 'webp',
      quality: 85,
      description: 'Fast loading for websites',
      icon: <Monitor className="h-5 w-5" />
    },
    {
      name: 'Mobile Friendly',
      dpi: 120,
      format: 'jpeg',
      quality: 80,
      description: 'Optimized for mobile devices',
      icon: <Smartphone className="h-5 w-5" />
    },
    {
      name: 'High Quality',
      dpi: 300,
      format: 'png',
      quality: 100,
      description: 'Best quality for professional use',
      icon: <Tablet className="h-5 w-5" />
    },
    {
      name: 'Print Ready',
      dpi: 600,
      format: 'png',
      quality: 100,
      description: 'High resolution for printing',
      icon: <Printer className="h-5 w-5" />
    }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf')
    if (pdfFile) {
      setPdfFile(pdfFile)
      setExtractedPages([])
      loadPDFInfo(pdfFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  // Load PDF information
  const loadPDFInfo = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setTotalPages(pdf.numPages)
      setConversionOptions(prev => ({ ...prev, endPage: pdf.numPages }))
    } catch (error) {
      console.error('Error loading PDF:', error)
    }
  }

  // Advanced PDF to images conversion
  const convertPDFToImages = useCallback(async () => {
    if (!pdfFile) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setExtractedPages([])

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      // Determine which pages to convert
      let pagesToConvert: number[] = []
      
      switch (conversionOptions.pageRange) {
        case 'all':
          pagesToConvert = Array.from({ length: pdf.numPages }, (_, i) => i + 1)
          break
        case 'range':
          for (let i = conversionOptions.startPage; i <= Math.min(conversionOptions.endPage, pdf.numPages); i++) {
            pagesToConvert.push(i)
          }
          break
        case 'specific':
          const specificPages = conversionOptions.specificPages
            .split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => p >= 1 && p <= pdf.numPages)
          pagesToConvert = [...new Set(specificPages)].sort((a, b) => a - b)
          break
      }

      const extractedPages: ExtractedPage[] = []
      
      for (let i = 0; i < pagesToConvert.length; i++) {
        const pageNum = pagesToConvert[i]
        const startTime = performance.now()
        
        try {
          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: conversionOptions.scale })
          
          const canvas = canvasRef.current
          if (!canvas) continue
          
          const context = canvas.getContext('2d')
          if (!context) continue
          
          // Set canvas dimensions based on DPI
          const scaleFactor = conversionOptions.dpi / 72 // 72 DPI is default
          canvas.width = viewport.width * scaleFactor
          canvas.height = viewport.height * scaleFactor
          
          // Scale context to match DPI
          context.scale(scaleFactor, scaleFactor)
          
          // Apply color space conversion
          if (conversionOptions.colorSpace === 'grayscale') {
            context.filter = 'grayscale(100%)'
          }
          
          // Render PDF page to canvas
          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }
          
          await page.render(renderContext).promise
          
          // Apply post-processing
          if (conversionOptions.enhanceText) {
            enhanceTextClarity(context, canvas.width, canvas.height)
          }
          
          if (conversionOptions.backgroundRemoval) {
            removeBackground(context, canvas.width, canvas.height)
          }
          
          // Convert to blob with specified format and quality
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!)
            }, `image/${conversionOptions.format}`, conversionOptions.quality / 100)
          })
          
          const imageUrl = URL.createObjectURL(blob)
          const endTime = performance.now()
          
          extractedPages.push({
            pageNumber: pageNum,
            imageUrl,
            width: canvas.width,
            height: canvas.height,
            fileSize: blob.size,
            processingTime: endTime - startTime
          })
          
          setExtractedPages([...extractedPages])
          setProcessingProgress(Math.round(((i + 1) / pagesToConvert.length) * 100))
          
        } catch (error) {
          console.error(`Error processing page ${pageNum}:`, error)
        }
      }
      
    } catch (error) {
      console.error('PDF conversion failed:', error)
      alert('Failed to convert PDF. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [pdfFile, conversionOptions])

  // Enhance text clarity
  const enhanceTextClarity = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    // Apply sharpening filter
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (brightness < 128) {
        // Darken dark pixels (text)
        data[i] = Math.max(0, data[i] - 20)
        data[i + 1] = Math.max(0, data[i + 1] - 20)
        data[i + 2] = Math.max(0, data[i + 2] - 20)
      } else {
        // Lighten light pixels (background)
        data[i] = Math.min(255, data[i] + 10)
        data[i + 1] = Math.min(255, data[i + 1] + 10)
        data[i + 2] = Math.min(255, data[i + 2] + 10)
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  // Remove background (make white areas transparent)
  const removeBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // If pixel is close to white, make it transparent
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0 // Set alpha to 0
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  // Apply preset configuration
  const applyPreset = (preset: PresetOption) => {
    setConversionOptions(prev => ({
      ...prev,
      dpi: preset.dpi,
      format: preset.format,
      quality: preset.quality
    }))
  }

  // Download single image
  const downloadImage = (page: ExtractedPage) => {
    fetch(page.imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const fileName = `${pdfFile?.name.replace('.pdf', '')}_page_${page.pageNumber}.${conversionOptions.format}`
        downloadFile(blob, fileName)
      })
  }

  // Download all images as ZIP
  const downloadAllImages = async () => {
    // This would require a ZIP library like JSZip
    // For now, download individually
    for (const page of extractedPages) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
      downloadImage(page)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                <FileImage className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Advanced PDF to Images
                </h1>
                <p className="text-sm text-gray-600">
                  Convert PDF pages to high-quality images with professional controls
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Upload and Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Upload PDF</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop PDF here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop PDF here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>

              {pdfFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {totalPages} pages • {formatFileSize(pdfFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Presets</h3>
              <div className="space-y-3">
                {presetOptions.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {preset.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{preset.name}</p>
                        <p className="text-xs text-gray-500">{preset.description}</p>
                        <p className="text-xs text-gray-400">
                          {preset.dpi} DPI • {preset.format.toUpperCase()} • {preset.quality}%
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </h3>

              <div className="space-y-4">
                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <Select
                    value={conversionOptions.format}
                    onValueChange={(value: 'png' | 'jpeg' | 'webp') =>
                      setConversionOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                      <SelectItem value="jpeg">JPEG (Smaller)</SelectItem>
                      <SelectItem value="webp">WebP (Modern)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* DPI Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DPI: {conversionOptions.dpi}
                  </label>
                  <Slider
                    value={[conversionOptions.dpi]}
                    onValueChange={(value) =>
                      setConversionOptions(prev => ({ ...prev, dpi: value[0] }))
                    }
                    min={72}
                    max={600}
                    step={24}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>72 (Web)</span>
                    <span>300 (Print)</span>
                    <span>600 (High)</span>
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {conversionOptions.quality}%
                  </label>
                  <Slider
                    value={[conversionOptions.quality]}
                    onValueChange={(value) =>
                      setConversionOptions(prev => ({ ...prev, quality: value[0] }))
                    }
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Page Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Range
                  </label>
                  <Select
                    value={conversionOptions.pageRange}
                    onValueChange={(value: 'all' | 'range' | 'specific') =>
                      setConversionOptions(prev => ({ ...prev, pageRange: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      <SelectItem value="range">Page Range</SelectItem>
                      <SelectItem value="specific">Specific Pages</SelectItem>
                    </SelectContent>
                  </Select>

                  {conversionOptions.pageRange === 'range' && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="number"
                        placeholder="From"
                        min="1"
                        max={totalPages}
                        value={conversionOptions.startPage}
                        onChange={(e) =>
                          setConversionOptions(prev => ({
                            ...prev,
                            startPage: parseInt(e.target.value) || 1
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="To"
                        min="1"
                        max={totalPages}
                        value={conversionOptions.endPage}
                        onChange={(e) =>
                          setConversionOptions(prev => ({
                            ...prev,
                            endPage: parseInt(e.target.value) || totalPages
                          }))
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  )}

                  {conversionOptions.pageRange === 'specific' && (
                    <input
                      type="text"
                      placeholder="e.g., 1,3,5-8,10"
                      value={conversionOptions.specificPages}
                      onChange={(e) =>
                        setConversionOptions(prev => ({
                          ...prev,
                          specificPages: e.target.value
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-2"
                    />
                  )}
                </div>

                {/* Enhancement Options */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={conversionOptions.enhanceText}
                      onChange={(e) =>
                        setConversionOptions(prev => ({
                          ...prev,
                          enhanceText: e.target.checked
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enhance Text Clarity</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={conversionOptions.backgroundRemoval}
                      onChange={(e) =>
                        setConversionOptions(prev => ({
                          ...prev,
                          backgroundRemoval: e.target.checked
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Remove White Background</span>
                  </label>
                </div>

                {/* Convert Button */}
                <Button
                  onClick={convertPDFToImages}
                  disabled={!pdfFile || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Converting... {processingProgress}%
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Convert to Images
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-3">
            {extractedPages.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Converted Images ({extractedPages.length})
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(previewMode === 'grid' ? 'list' : 'grid')}
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      {previewMode === 'grid' ? 'List View' : 'Grid View'}
                    </Button>
                    <Button
                      onClick={downloadAllImages}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                  </div>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Converting pages...</span>
                      <span className="text-gray-600">{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Images Grid/List */}
                <div className={previewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {extractedPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className={`border border-gray-200 rounded-lg overflow-hidden ${
                        previewMode === 'list' ? 'flex items-center space-x-4 p-4' : 'p-4'
                      }`}
                    >
                      <div className={previewMode === 'list' ? 'w-24 h-32 flex-shrink-0' : 'mb-4'}>
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-contain bg-gray-50 rounded"
                        />
                      </div>

                      <div className={previewMode === 'list' ? 'flex-1' : ''}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Page {page.pageNumber}
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => downloadImage(page)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Size: {page.width} × {page.height}px</p>
                          <p>File: {formatFileSize(page.fileSize)}</p>
                          <p>Time: {Math.round(page.processingTime)}ms</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!pdfFile && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No PDF Selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload a PDF file to start converting pages to high-quality images
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="text-center">
                    <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p>Web Optimized</p>
                  </div>
                  <div className="text-center">
                    <Printer className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Print Ready</p>
                  </div>
                  <div className="text-center">
                    <Sliders className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p>Custom Settings</p>
                  </div>
                  <div className="text-center">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <p>Fast Processing</p>
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
