"use client"

import React, { useState, useCallback } from 'react'
import {
  Minimize2,
  Download,
  Upload,
  Settings,
  HelpCircle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { validateImageFile, downloadFile } from '@/lib/utils'

export default function CompressImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [compressedImages, setCompressedImages] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [quality, setQuality] = useState(80)

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
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  })

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Draw image on canvas
        ctx.drawImage(img, 0, 0)

        // Convert to compressed format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve(url)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          'image/jpeg',
          quality / 100
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleCompress = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const compressed: { [key: string]: string } = {}

    try {
      for (const file of files) {
        const compressedUrl = await compressImage(file)
        compressed[file.name] = compressedUrl
      }
      setCompressedImages(compressed)
    } catch (error) {
      // Error handling for production
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (fileName: string, url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const originalName = fileName.split('.').slice(0, -1).join('.')
      const newFileName = `${originalName}_compressed.jpg`
      downloadFile(blob, newFileName)
    } catch (error) {
      // Error handling for production
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg">
              <Minimize2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Compressor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Reduce image file sizes while maintaining quality. Perfect for web optimization and faster loading.
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
              Supports: JPEG, PNG, GIF, BMP, WebP
            </p>
          </div>
        </div>

        {/* Compression Settings */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Compression Settings
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {files.length} image{files.length > 1 ? 's' : ''} ready for compression
              </p>
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Minimize2 className="h-5 w-5 mr-2 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Minimize2 className="h-5 w-5 mr-2" />
                    Compress Images
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {Object.keys(compressedImages).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Minimize2 className="h-5 w-5 mr-2" />
              Compressed Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(compressedImages).map(([fileName, url]) => (
                <div key={fileName} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300">
                  <img
                    src={url}
                    alt={fileName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm font-medium text-gray-900 mb-2 truncate">
                    {fileName.split('.').slice(0, -1).join('')}_compressed.jpg
                  </p>
                  <button
                    onClick={() => handleDownload(fileName, url)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-2xl p-8 mt-8">
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Compression Tips</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Higher quality = larger file size, better image quality</li>
                <li>• Lower quality = smaller file size, some quality loss</li>
                <li>• 80-90% quality is usually perfect for web use</li>
                <li>• All processing happens in your browser - files stay private</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
