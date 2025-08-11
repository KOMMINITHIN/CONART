"use client"

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Target, 
  Image as ImageIcon, 
  Zap, 
  HelpCircle,
  Info
} from 'lucide-react'
import { CompressionOptions } from '@/types'
import { compressionPresets, CompressionPreset } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CompressionSettingsProps {
  onSettingsChange: (options: CompressionOptions) => void
  onCompress: () => void
  isCompressing: boolean
  fileCount: number
  className?: string
}

export function CompressionSettings({
  onSettingsChange,
  onCompress,
  isCompressing,
  fileCount,
  className
}: CompressionSettingsProps) {
  const [preset, setPreset] = useState<CompressionPreset>('web')
  const [quality, setQuality] = useState(80)
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState(1920)
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png' | 'webp' | 'original'>('original')
  const [compressionMode, setCompressionMode] = useState<'quality' | 'size'>('quality')
  const [targetSizeKB, setTargetSizeKB] = useState(100)
  const [preserveExif, setPreserveExif] = useState(false)

  // Update settings when preset changes
  useEffect(() => {
    if (preset !== 'custom') {
      const presetConfig = compressionPresets[preset]
      setQuality(Math.round(presetConfig.quality * 100))
      setMaxWidthOrHeight(presetConfig.maxWidthOrHeight)
    }
  }, [preset])

  // Notify parent of settings changes
  useEffect(() => {
    const options: CompressionOptions = {
      quality: quality / 100,
      maxWidthOrHeight,
      preserveExif,
      useWebWorker: true,
      ...(targetFormat !== 'original' && { targetFormat }),
      ...(compressionMode === 'size' && { targetSizeKB })
    }
    onSettingsChange(options)
  }, [quality, maxWidthOrHeight, targetFormat, compressionMode, targetSizeKB, preserveExif, onSettingsChange])

  const handlePresetChange = (value: CompressionPreset) => {
    setPreset(value)
  }

  const handleQualityChange = (value: number[]) => {
    setQuality(value[0])
    if (preset !== 'custom') {
      setPreset('custom')
    }
  }

  const handleMaxSizeChange = (value: number[]) => {
    setMaxWidthOrHeight(value[0])
    if (preset !== 'custom') {
      setPreset('custom')
    }
  }

  const handleTargetSizeChange = (value: number[]) => {
    setTargetSizeKB(value[0])
  }

  return (
    <div className={`bg-white border rounded-lg p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Compression Settings</h3>
        </div>
        <Button
          onClick={onCompress}
          disabled={isCompressing || fileCount === 0}
          className="min-w-[120px]"
        >
          {isCompressing ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-pulse" />
              Compressing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Compress {fileCount > 0 ? `(${fileCount})` : ''}
            </>
          )}
        </Button>
      </div>

      {/* Preset Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center space-x-2">
          <span>Compression Preset</span>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </label>
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(compressionPresets).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col">
                  <span>{config.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {config.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Compression Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Compression Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={compressionMode === 'quality' ? 'default' : 'outline'}
            onClick={() => setCompressionMode('quality')}
            className="justify-start"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Quality Based
          </Button>
          <Button
            variant={compressionMode === 'size' ? 'default' : 'outline'}
            onClick={() => setCompressionMode('size')}
            className="justify-start"
          >
            <Target className="h-4 w-4 mr-2" />
            Target Size
          </Button>
        </div>
      </div>

      {/* Quality Settings */}
      {compressionMode === 'quality' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Quality</label>
              <span className="text-sm text-muted-foreground">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              onValueChange={handleQualityChange}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lower quality, smaller file</span>
              <span>Higher quality, larger file</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Max Dimension</label>
              <span className="text-sm text-muted-foreground">{maxWidthOrHeight}px</span>
            </div>
            <Slider
              value={[maxWidthOrHeight]}
              onValueChange={handleMaxSizeChange}
              max={4000}
              min={400}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>400px</span>
              <span>4000px</span>
            </div>
          </div>
        </div>
      )}

      {/* Target Size Settings */}
      {compressionMode === 'size' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Target File Size</label>
            <span className="text-sm text-muted-foreground">{targetSizeKB} KB</span>
          </div>
          <Slider
            value={[targetSizeKB]}
            onValueChange={handleTargetSizeChange}
            max={1000}
            min={10}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10 KB</span>
            <span>1000 KB</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <Info className="h-4 w-4 text-blue-500 inline mr-2" />
            The app will automatically adjust quality to reach your target file size.
          </div>
        </div>
      )}

      {/* Output Format */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Output Format</label>
        <Select value={targetFormat} onValueChange={(value: any) => setTargetFormat(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Keep Original Format</SelectItem>
            <SelectItem value="jpeg">JPEG (Best for photos)</SelectItem>
            <SelectItem value="png">PNG (Best for graphics)</SelectItem>
            <SelectItem value="webp">WebP (Modern, efficient)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Options */}
      <div className="space-y-3 pt-4 border-t">
        <h4 className="text-sm font-medium text-muted-foreground">Advanced Options</h4>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-sm font-medium">Preserve EXIF Data</label>
            <p className="text-xs text-muted-foreground">
              Keep camera and location information
            </p>
          </div>
          <Button
            variant={preserveExif ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreserveExif(!preserveExif)}
          >
            {preserveExif ? 'On' : 'Off'}
          </Button>
        </div>
      </div>
    </div>
  )
}
