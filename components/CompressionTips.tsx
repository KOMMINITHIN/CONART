"use client"

import React, { useState } from 'react'
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon,
  FileText,
  Zap,
  Shield,
  Target,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Tip {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'quality' | 'size' | 'format' | 'performance' | 'best-practices'
  level: 'beginner' | 'intermediate' | 'advanced'
}

const tips: Tip[] = [
  {
    id: '1',
    title: 'Choose the Right Format',
    description: 'JPEG is best for photos with many colors, PNG for graphics with transparency, and WebP for modern browsers with better compression.',
    icon: <FileText className="h-4 w-4" />,
    category: 'format',
    level: 'beginner'
  },
  {
    id: '2',
    title: 'Quality vs File Size Balance',
    description: 'For web use, 70-80% quality usually provides the best balance between file size and visual quality.',
    icon: <Target className="h-4 w-4" />,
    category: 'quality',
    level: 'beginner'
  },
  {
    id: '3',
    title: 'Resize Before Compressing',
    description: 'Reducing image dimensions can significantly decrease file size. Most web images don\'t need to be larger than 1920px.',
    icon: <ImageIcon className="h-4 w-4" />,
    category: 'size',
    level: 'beginner'
  },
  {
    id: '4',
    title: 'Remove EXIF Data for Privacy',
    description: 'EXIF data contains camera settings and sometimes location information. Remove it for web images to save space and protect privacy.',
    icon: <Shield className="h-4 w-4" />,
    category: 'best-practices',
    level: 'intermediate'
  },
  {
    id: '5',
    title: 'Use Progressive JPEG for Large Images',
    description: 'Progressive JPEGs load in stages, providing a better user experience for larger images on slower connections.',
    icon: <Zap className="h-4 w-4" />,
    category: 'performance',
    level: 'intermediate'
  },
  {
    id: '6',
    title: 'Avoid Double Compression',
    description: 'Don\'t compress already compressed images multiple times. This can introduce artifacts and reduce quality significantly.',
    icon: <Palette className="h-4 w-4" />,
    category: 'quality',
    level: 'intermediate'
  },
  {
    id: '7',
    title: 'Target File Size for Email',
    description: 'Most email providers limit attachment sizes to 25MB total. Aim for 1-2MB per image for email attachments.',
    icon: <Target className="h-4 w-4" />,
    category: 'size',
    level: 'beginner'
  },
  {
    id: '8',
    title: 'WebP for Modern Browsers',
    description: 'WebP provides 25-35% better compression than JPEG while maintaining similar quality. Perfect for modern web applications.',
    icon: <Zap className="h-4 w-4" />,
    category: 'format',
    level: 'advanced'
  }
]

export function CompressionTips() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'All Tips' },
    { value: 'quality', label: 'Quality' },
    { value: 'size', label: 'File Size' },
    { value: 'format', label: 'Formats' },
    { value: 'performance', label: 'Performance' },
    { value: 'best-practices', label: 'Best Practices' }
  ]

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const filteredTips = tips.filter(tip => {
    const categoryMatch = selectedCategory === 'all' || tip.category === selectedCategory
    const levelMatch = selectedLevel === 'all' || tip.level === selectedLevel
    return categoryMatch && levelMatch
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quality': return 'text-blue-500'
      case 'size': return 'text-green-500'
      case 'format': return 'text-purple-500'
      case 'performance': return 'text-orange-500'
      case 'best-practices': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Compression Tips & Best Practices</h3>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {filteredTips.length} tips
            </span>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Category:</span>
              <div className="flex flex-wrap gap-1">
                {categories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Level:</span>
              <div className="flex flex-wrap gap-1">
                {levels.map(level => (
                  <Button
                    key={level.value}
                    variant={selectedLevel === level.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLevel(level.value)}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTips.map(tip => (
              <div key={tip.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)} bg-opacity-10`}>
                    {tip.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{tip.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(tip.level)}`}>
                        {tip.level}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTips.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No tips found for the selected filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
