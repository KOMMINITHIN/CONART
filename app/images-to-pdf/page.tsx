"use client"

import React, { useState, useCallback } from 'react'
import { 
  FileText, 
  Download, 
  Upload,
  Settings,
  HelpCircle,
  Plus,
  X
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
import { UniversalHelpDialog, helpContent } from '@/components/UniversalHelpDialog'

interface PDFOptions {
  pageSize: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal'
  orientation: 'portrait' | 'landscape'
  margin: number
  quality: number
}

export default function ImagesToPDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [pdfOptions, setPdfOptions] = useState<PDFOptions>({
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 20,
    quality: 90
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    setFiles(prev => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return newFiles
    })
  }, [])

  const createPDF = useCallback(async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    
    try {
      // Dynamic import to reduce bundle size
      const { jsPDF } = await import('jspdf')
      
      const pdf = new jsPDF({
        orientation: pdfOptions.orientation,
        unit: 'mm',
        format: pdfOptions.pageSize.toLowerCase()
      })

      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = pdfOptions.margin
      const availableWidth = pageWidth - (2 * margin)
      const availableHeight = pageHeight - (2 * margin)

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create image element to get dimensions
        const img = new Image()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Calculate scaling to fit within page
            const imgAspectRatio = img.width / img.height
            const pageAspectRatio = availableWidth / availableHeight
            
            let drawWidth, drawHeight
            
            if (imgAspectRatio > pageAspectRatio) {
              // Image is wider, scale by width
              drawWidth = availableWidth
              drawHeight = availableWidth / imgAspectRatio
            } else {
              // Image is taller, scale by height
              drawHeight = availableHeight
              drawWidth = availableHeight * imgAspectRatio
            }

            // Set canvas size
            canvas.width = drawWidth * 3 // Higher resolution
            canvas.height = drawHeight * 3
            
            if (ctx) {
              // Draw image to canvas
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
              
              // Convert to data URL
              const dataUrl = canvas.toDataURL('image/jpeg', pdfOptions.quality / 100)
              
              // Add new page if not first image
              if (i > 0) {
                pdf.addPage()
              }
              
              // Center the image on the page
              const x = margin + (availableWidth - drawWidth) / 2
              const y = margin + (availableHeight - drawHeight) / 2
              
              // Add image to PDF
              pdf.addImage(dataUrl, 'JPEG', x, y, drawWidth, drawHeight)
              
              resolve()
            } else {
              reject(new Error('Failed to get canvas context'))
            }
          }
          
          img.onerror = () => reject(new Error('Failed to load image'))
          img.src = URL.createObjectURL(file)
        })
      }

      // Generate PDF blob
      const pdfBlob = pdf.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      
    } catch (error) {
      alert('Failed to create PDF. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [files, pdfOptions])

  const handleDownload = useCallback(() => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = 'images-to-pdf.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [pdfUrl])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 rounded-lg p-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Images to PDF
                </h1>
                <p className="text-sm text-gray-600">
                  Convert multiple images into a single PDF document
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
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
                isDragActive ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-red-600 font-medium">Drop images here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP • Multiple files allowed
                  </p>
                </div>
              )}
            </div>

            {/* Image List */}
            {files.length > 0 && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Images ({files.length})
                  </h3>
                  <p className="text-sm text-gray-500">
                    Drag to reorder • Click × to remove
                  </p>
                </div>
                
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="text-sm font-mono text-gray-500 w-8">
                        {index + 1}
                      </div>
                      
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFile(index, index - 1)}
                          >
                            ↑
                          </Button>
                        )}
                        {index < files.length - 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveFile(index, index + 1)}
                          >
                            ↓
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PDF Preview */}
            {pdfUrl && (
              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Generated PDF</h3>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>PDF created successfully with {files.length} images</span>
                  </div>
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
                  PDF Settings
                </h3>
                <Button
                  onClick={createPDF}
                  disabled={isProcessing || files.length === 0}
                >
                  {isProcessing ? 'Creating...' : 'Create PDF'}
                </Button>
              </div>

              {/* Page Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Size</label>
                <Select
                  value={pdfOptions.pageSize}
                  onValueChange={(value: any) => setPdfOptions(prev => ({
                    ...prev,
                    pageSize: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="A3">A3 (297 × 420 mm)</SelectItem>
                    <SelectItem value="A5">A5 (148 × 210 mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                    <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Orientation</label>
                <Select
                  value={pdfOptions.orientation}
                  onValueChange={(value: any) => setPdfOptions(prev => ({
                    ...prev,
                    orientation: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Margin */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Margin: {pdfOptions.margin}mm
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={pdfOptions.margin}
                  onChange={(e) => setPdfOptions(prev => ({
                    ...prev,
                    margin: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              {/* Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Image Quality: {pdfOptions.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={pdfOptions.quality}
                  onChange={(e) => setPdfOptions(prev => ({
                    ...prev,
                    quality: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Images will be automatically resized to fit the page</li>
                  <li>• Drag images to reorder them in the PDF</li>
                  <li>• Higher quality = larger file size</li>
                  <li>• Use landscape for wide images</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Help Dialog */}
      <UniversalHelpDialog
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        content={helpContent.imagesToPdf}
      />
    </div>
  )
}
