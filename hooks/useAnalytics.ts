"use client"

import { useCallback, useEffect } from 'react'
import { AnalyticsEvent } from '@/types'

// Simple client-side analytics without external services
export function useAnalytics() {
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    // Only track in production and with user consent
    if (process.env.NODE_ENV !== 'production') return
    
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...properties
      },
      timestamp: new Date()
    }
    
    // Store locally for privacy (no external tracking)
    try {
      const existingEvents = JSON.parse(localStorage.getItem('app_analytics') || '[]')
      const updatedEvents = [...existingEvents, analyticsEvent].slice(-100) // Keep last 100 events
      localStorage.setItem('app_analytics', JSON.stringify(updatedEvents))
    } catch (error) {
      // Analytics storage failed - handled silently in production
    }
  }, [])

  const trackPageView = useCallback((page: string) => {
    trackEvent('page_view', { page })
  }, [trackEvent])

  const trackCompression = useCallback((data: {
    fileCount: number
    totalOriginalSize: number
    totalCompressedSize: number
    compressionRatio: number
    format?: string
    preset?: string
  }) => {
    trackEvent('compression_completed', data)
  }, [trackEvent])

  const trackDownload = useCallback((data: {
    fileSize: number
    format: string
    compressionRatio: number
  }) => {
    trackEvent('file_downloaded', data)
  }, [trackEvent])

  const trackError = useCallback((error: string, context?: string) => {
    trackEvent('error_occurred', { error, context })
  }, [trackEvent])

  const getAnalytics = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('app_analytics') || '[]')
    } catch {
      return []
    }
  }, [])

  const clearAnalytics = useCallback(() => {
    localStorage.removeItem('app_analytics')
  }, [])

  // Track performance metrics
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            trackEvent('performance_navigation', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              firstPaint: navEntry.responseEnd - navEntry.requestStart
            })
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['navigation'] })
      } catch (error) {
        // Performance observer not supported - handled silently
      }
      
      return () => observer.disconnect()
    }
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackCompression,
    trackDownload,
    trackError,
    getAnalytics,
    clearAnalytics
  }
}
