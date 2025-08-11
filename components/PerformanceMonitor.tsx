"use client"

import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Clock, 
  Cpu, 
  HardDrive,
  Wifi,
  Battery,
  Monitor,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PerformanceMetrics {
  memoryUsage?: number
  loadTime?: number
  compressionSpeed?: number
  filesProcessed?: number
  connectionType?: string
  deviceMemory?: number
  hardwareConcurrency?: number
}

export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics>({})

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics: PerformanceMetrics = {}

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory
        newMetrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      }

      // Connection info
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        newMetrics.connectionType = connection.effectiveType || connection.type
      }

      // Device capabilities
      if ('deviceMemory' in navigator) {
        newMetrics.deviceMemory = (navigator as any).deviceMemory
      }

      if ('hardwareConcurrency' in navigator) {
        newMetrics.hardwareConcurrency = navigator.hardwareConcurrency
      }

      // Performance timing
      if ('performance' in window && performance.timing) {
        const timing = performance.timing
        newMetrics.loadTime = timing.loadEventEnd - timing.navigationStart
      }

      setMetrics(newMetrics)
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A'
    return `${bytes} MB`
  }

  const formatTime = (ms?: number) => {
    if (!ms) return 'N/A'
    return `${Math.round(ms)} ms`
  }

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-xl p-4 w-80 max-w-[90vw] z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold">Performance Monitor</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="h-4 w-4 text-green-500" />
            <span className="text-sm">Memory Usage</span>
          </div>
          <span className="text-sm font-mono">
            {formatBytes(metrics.memoryUsage)}
          </span>
        </div>

        {/* Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Load Time</span>
          </div>
          <span className="text-sm font-mono">
            {formatTime(metrics.loadTime)}
          </span>
        </div>

        {/* CPU Cores */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-purple-500" />
            <span className="text-sm">CPU Cores</span>
          </div>
          <span className="text-sm font-mono">
            {metrics.hardwareConcurrency || 'N/A'}
          </span>
        </div>

        {/* Device Memory */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Device RAM</span>
          </div>
          <span className="text-sm font-mono">
            {metrics.deviceMemory ? `${metrics.deviceMemory} GB` : 'N/A'}
          </span>
        </div>

        {/* Connection Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wifi className="h-4 w-4 text-cyan-500" />
            <span className="text-sm">Connection</span>
          </div>
          <span className="text-sm font-mono">
            {metrics.connectionType || 'N/A'}
          </span>
        </div>

        {/* Files Processed */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Battery className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Files Processed</span>
          </div>
          <span className="text-sm font-mono">
            {metrics.filesProcessed || 0}
          </span>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-4 pt-4 border-t">
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">💡 Performance Tips:</p>
          {metrics.memoryUsage && metrics.memoryUsage > 100 && (
            <p>• High memory usage detected. Consider processing fewer files at once.</p>
          )}
          {metrics.connectionType === 'slow-2g' && (
            <p>• Slow connection detected. Use smaller file sizes for better experience.</p>
          )}
          {metrics.hardwareConcurrency && metrics.hardwareConcurrency < 4 && (
            <p>• Limited CPU cores. Processing may be slower for large batches.</p>
          )}
          {(!metrics.memoryUsage || metrics.memoryUsage < 50) && 
           metrics.hardwareConcurrency && metrics.hardwareConcurrency >= 4 && (
            <p>• Great performance! Your device can handle large batch processing.</p>
          )}
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 pt-4 border-t">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-gray-600">
              Debug Info
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
