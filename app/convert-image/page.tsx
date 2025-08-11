"use client"

import React, { useState, useCallback } from 'react'
import {
  RefreshCw,
  Download,
  Upload,
  Settings,
  HelpCircle,
  Image as ImageIcon
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

interface ConvertOptions {
  format: 'jpeg' | 'png' | 'webp' | 'bmp'
  quality: number
  width?: number
  height?: number
  maintainAspectRatio: boolean
}

export default function ConvertImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [convertedImages, setConvertedImages] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [convertOptions, setConvertOptions] = useState<ConvertOptions>({
    format: 'jpeg',
    quality: 90,
    maintainAspectRatio: true
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
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg']
    },
    multiple: true
  })

  const convertImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      img.onload = () => {
        let { width, height } = img

        // Apply custom dimensions if specified
        if (convertOptions.width || convertOptions.height) {
          if (convertOptions.maintainAspectRatio) {
            const aspectRatio = width / height
            if (convertOptions.width && !convertOptions.height) {
              width = convertOptions.width
              height = width / aspectRatio
            } else if (convertOptions.height && !convertOptions.width) {
              height = convertOptions.height
              width = height * aspectRatio
            } else if (convertOptions.width && convertOptions.height) {
              width = convertOptions.width
              height = convertOptions.height
            }
          } else {
            width = convertOptions.width || width
            height = convertOptions.height || height
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to desired format
        const mimeType = `image/${convertOptions.format}`
        const quality = convertOptions.quality / 100

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve(url)
            } else {
              reject(new Error('Failed to convert image'))
            }
          },
          mimeType,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleConvert = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const converted: { [key: string]: string } = {}

    try {
      for (const file of files) {
        const convertedUrl = await convertImage(file)
        converted[file.name] = convertedUrl
      }
      setConvertedImages(converted)
    } catch (error) {
      console.error('Error converting images:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (fileName: string, url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const originalName = fileName.split('.').slice(0, -1).join('.')
      const newFileName = `${originalName}.${convertOptions.format}`
      downloadFile(blob, newFileName)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleDownloadAll = async () => {
    for (const [fileName, url] of Object.entries(convertedImages)) {
      await handleDownload(fileName, url)
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Format Converter
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert images between different formats (JPEG, PNG, WebP, BMP) with custom quality and size settings.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop images here' : 'Upload Images'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPEG, PNG, GIF, BMP, WebP, SVG
            </p>
          </div>
        </div>

        {/* Conversion Options */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Conversion Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Format
                </label>
                <Select
                  value={convertOptions.format}
                  onValueChange={(value: 'jpeg' | 'png' | 'webp' | 'bmp') =>
                    setConvertOptions(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="bmp">BMP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {convertOptions.quality}%
                </label>
                <Slider
                  value={[convertOptions.quality]}
                  onValueChange={(value) =>
                    setConvertOptions(prev => ({ ...prev, quality: value[0] }))
                  }
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Custom Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (optional)
                </label>
                <input
                  type="number"
                  placeholder="Auto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={convertOptions.width || ''}
                  onChange={(e) =>
                    setConvertOptions(prev => ({
                      ...prev,
                      width: e.target.value ? parseInt(e.target.value) : undefined
                    }))
                  }
                />
              </div>

              {/* Custom Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (optional)
                </label>
                <input
                  type="number"
                  placeholder="Auto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={convertOptions.height || ''}
                  onChange={(e) =>
                    setConvertOptions(prev => ({
                      ...prev,
                      height: e.target.value ? parseInt(e.target.value) : undefined
                    }))
                  }
                />
              </div>
            </div>

            {/* Maintain Aspect Ratio */}
            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={convertOptions.maintainAspectRatio}
                  onChange={(e) =>
                    setConvertOptions(prev => ({
                      ...prev,
                      maintainAspectRatio: e.target.checked
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Maintain aspect ratio
                </span>
              </label>
            </div>

            {/* Convert Button */}
            <div className="mt-8">
              <Button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Convert Images
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {Object.keys(convertedImages).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Converted Images
              </h3>
              <Button
                onClick={handleDownloadAll}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(convertedImages).map(([fileName, url]) => (
                <div key={fileName} className="border border-gray-200 rounded-lg p-4">
                  <img
                    src={url}
                    alt={fileName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm font-medium text-gray-900 mb-2 truncate">
                    {fileName.split('.').slice(0, -1).join('.')}.{convertOptions.format}
                  </p>
                  <Button
                    onClick={() => handleDownload(fileName, url)}
                    size="sm"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
