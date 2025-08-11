"use client"

import React from 'react'
import Image from 'next/image'
import { 
  Download, 
  X, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Info
} from 'lucide-react'
import { ImageFile } from '@/types'
import { formatFileSize, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface FileCardProps {
  file: ImageFile
  onRemove: (id: string) => void
  onReset: (id: string) => void
  onDownload?: (file: ImageFile) => void
  onPreview?: (file: ImageFile) => void
  showComparison?: boolean
}

export function FileCard({ 
  file, 
  onRemove, 
  onReset, 
  onDownload,
  onPreview,
  showComparison = false
}: FileCardProps) {
  const handleDownload = () => {
    if (file.downloadUrl && onDownload) {
      onDownload(file)
    }
  }

  const getStatusIcon = () => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'compressing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (file.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'compressing':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  return (
    <div className={cn(
      "relative border rounded-lg p-4 transition-all duration-200",
      getStatusColor()
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {getStatusIcon()}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate" title={file.file.name}>
              {file.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.originalSize)}
              {file.dimensions && (
                <span className="ml-2">
                  {file.dimensions.width} × {file.dimensions.height}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(file.id)}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Image Preview */}
      <div className={cn(
        "relative mb-3 rounded-md overflow-hidden bg-gray-100",
        showComparison ? "grid grid-cols-2 gap-2" : ""
      )}>
        {showComparison && file.compressedPreview ? (
          <>
            {/* Original */}
            <div className="relative aspect-video">
              <Image
                src={file.preview}
                alt="Original"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Original
              </div>
            </div>
            
            {/* Compressed */}
            <div className="relative aspect-video">
              <Image
                src={file.compressedPreview}
                alt="Compressed"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Compressed
              </div>
            </div>
          </>
        ) : (
          <div className="relative aspect-video">
            <Image
              src={file.compressedPreview || file.preview}
              alt={file.file.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {onPreview && (
              <button
                onClick={() => onPreview(file)}
                className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100"
              >
                <Eye className="h-6 w-6 text-white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {file.status === 'compressing' && (
        <div className="mb-3">
          <Progress value={undefined} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">Compressing...</p>
        </div>
      )}

      {/* Compression Stats */}
      {file.status === 'completed' && file.compressedSize && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
          <div className="flex justify-between items-center">
            <span>Compressed Size:</span>
            <span className="font-medium">{formatFileSize(file.compressedSize)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Savings:</span>
            <span className="font-medium text-green-600">
              {file.compressionRatio}%
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {file.status === 'error' && file.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {file.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {file.status === 'completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!file.downloadUrl}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          )}
          
          {(file.status === 'error' || file.status === 'completed') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReset(file.id)}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {file.status === 'pending' && 'Ready to compress'}
          {file.status === 'compressing' && 'Processing...'}
          {file.status === 'completed' && 'Complete'}
          {file.status === 'error' && 'Failed'}
        </div>
      </div>
    </div>
  )
}
