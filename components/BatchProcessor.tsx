"use client"

import React, { useState } from 'react'
import {
  Package,
  Settings,
  Download,
  FileText,
  Maximize,
  Type,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BatchProcessingOptions, WatermarkOptions, ResizeOptions } from '@/types'

interface BatchProcessorProps {
  onProcess: (options: BatchProcessingOptions) => void
  isProcessing: boolean
  fileCount: number
}

export function BatchProcessor({ onProcess, isProcessing, fileCount }: BatchProcessorProps) {
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [quality, setQuality] = useState(80)
  const [enableResize, setEnableResize] = useState(false)
  const [enableWatermark, setEnableWatermark] = useState(false)
  const [filenamePrefix, setFilenamePrefix] = useState('')
  const [filenameSuffix, setFilenameSuffix] = useState('_compressed')

  // Resize options
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: 1920,
    height: 1080,
    maintainAspectRatio: true,
    resizeMethod: 'contain'
  })

  // Watermark options
  const [watermarkOptions, setWatermarkOptions] = useState<WatermarkOptions>({
    text: 'Compressed with ImageCompressor Pro',
    position: 'bottom-right',
    opacity: 0.7,
    size: 16
  })

  const handleProcess = () => {
    const options: BatchProcessingOptions = {
      quality: quality / 100,
      outputFormat,
      filenamePrefix: filenamePrefix || undefined,
      filenameSuffix: filenameSuffix || undefined,
      useWebWorker: true,
      preserveExif: false,
      ...(enableResize && { resize: resizeOptions }),
      ...(enableWatermark && { watermark: watermarkOptions })
    }
    
    onProcess(options)
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Batch Processing</h3>
        </div>
        <Button
          onClick={handleProcess}
          disabled={isProcessing || fileCount === 0}
          className="min-w-[120px]"
        >
          {isProcessing ? 'Processing...' : `Process ${fileCount} files`}
        </Button>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Output Format
        </label>
        <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jpeg">JPEG - Best for photos</SelectItem>
            <SelectItem value="png">PNG - Best for graphics</SelectItem>
            <SelectItem value="webp">WebP - Modern format</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Quality
          </label>
          <span className="text-sm text-muted-foreground">{quality}%</span>
        </div>
        <Slider
          value={[quality]}
          onValueChange={(value) => setQuality(value[0])}
          max={100}
          min={10}
          step={5}
          className="w-full"
        />
      </div>

      {/* Filename Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center">
          <Type className="h-4 w-4 mr-2" />
          Filename Options
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Prefix</label>
            <input
              type="text"
              value={filenamePrefix}
              onChange={(e) => setFilenamePrefix(e.target.value)}
              placeholder="e.g., web_"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Suffix</label>
            <input
              type="text"
              value={filenameSuffix}
              onChange={(e) => setFilenameSuffix(e.target.value)}
              placeholder="e.g., _compressed"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
          Preview: {filenamePrefix}image{filenameSuffix}.{outputFormat}
        </div>
      </div>

      {/* Resize Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center">
            <Maximize className="h-4 w-4 mr-2" />
            Resize Images
          </h4>
          <Button
            variant={enableResize ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEnableResize(!enableResize)}
          >
            {enableResize ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
        
        {enableResize && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Width (px)</label>
                <input
                  type="number"
                  value={resizeOptions.width || ''}
                  onChange={(e) => setResizeOptions(prev => ({ 
                    ...prev, 
                    width: parseInt(e.target.value) || undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Height (px)</label>
                <input
                  type="number"
                  value={resizeOptions.height || ''}
                  onChange={(e) => setResizeOptions(prev => ({ 
                    ...prev, 
                    height: parseInt(e.target.value) || undefined 
                  }))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Resize Method</label>
              <Select 
                value={resizeOptions.resizeMethod} 
                onValueChange={(value: any) => setResizeOptions(prev => ({ ...prev, resizeMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Contain (fit within dimensions)</SelectItem>
                  <SelectItem value="cover">Cover (fill dimensions)</SelectItem>
                  <SelectItem value="fill">Fill (stretch to fit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintainAspectRatio"
                checked={resizeOptions.maintainAspectRatio}
                onChange={(e) => setResizeOptions(prev => ({ 
                  ...prev, 
                  maintainAspectRatio: e.target.checked 
                }))}
                className="rounded"
              />
              <label htmlFor="maintainAspectRatio" className="text-xs text-muted-foreground">
                Maintain aspect ratio
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Watermark Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Add Watermark
          </h4>
          <Button
            variant={enableWatermark ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEnableWatermark(!enableWatermark)}
          >
            {enableWatermark ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
        
        {enableWatermark && (
          <div className="space-y-4 pl-6 border-l-2 border-gray-200">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Watermark Text</label>
              <input
                type="text"
                value={watermarkOptions.text || ''}
                onChange={(e) => setWatermarkOptions(prev => ({ 
                  ...prev, 
                  text: e.target.value 
                }))}
                placeholder="Enter watermark text"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Position</label>
                <Select 
                  value={watermarkOptions.position} 
                  onValueChange={(value: any) => setWatermarkOptions(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Size</label>
                <input
                  type="number"
                  value={watermarkOptions.size}
                  onChange={(e) => setWatermarkOptions(prev => ({ 
                    ...prev, 
                    size: parseInt(e.target.value) || 16 
                  }))}
                  min="8"
                  max="72"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Opacity</label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(watermarkOptions.opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[watermarkOptions.opacity * 100]}
                onValueChange={(value) => setWatermarkOptions(prev => ({ 
                  ...prev, 
                  opacity: value[0] / 100 
                }))}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
