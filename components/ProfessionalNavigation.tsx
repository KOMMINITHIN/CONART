"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Image as ImageIcon,
  FileText,
  Settings,
  ChevronDown,
  Wand2
} from 'lucide-react'
import { tools, getToolsByCategory } from '@/lib/tools'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ProfessionalNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const categoryIcons = {
    image: <ImageIcon className="h-4 w-4" />,
    pdf: <FileText className="h-4 w-4" />,
    document: <Settings className="h-4 w-4" />
  }

  const categoryNames = {
    image: 'Image Tools',
    pdf: 'PDF Tools', 
    document: 'Document Tools'
  }

  const toggleDropdown = (category: string) => {
    setOpenDropdown(openDropdown === category ? null : category)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-white/10 before:backdrop-blur-3xl before:-z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/" className="font-bold text-2xl hover:opacity-80 transition-opacity">
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-mono uppercase tracking-wider">
                CONART
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-1">
              {/* Category Dropdowns */}
              {Object.entries(categoryNames).map(([category, name]) => {
                const categoryTools = getToolsByCategory(category as any)
                const isActive = categoryTools.some(tool => pathname === tool.path)

                return (
                  <div key={category} className="relative dropdown-container">
                    <button
                      onClick={() => toggleDropdown(category)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center hover:bg-gray-100",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      )}
                    >
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="ml-2">{name}</span>
                      <ChevronDown className="h-3 w-3 ml-1 transition-transform duration-200" 
                        style={{ transform: openDropdown === category ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </button>

                    {openDropdown === category && (
                      <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-96 overflow-y-auto">
                        <div className="py-2">
                          {categoryTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={tool.path}
                              prefetch={true}
                              className={cn(
                                "flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors",
                                pathname === tool.path && "bg-blue-50 text-blue-600"
                              )}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className="text-lg mr-3">{tool.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">{tool.name}</span>
                                  {tool.isNew && (
                                    <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tool.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-white/10 before:backdrop-blur-3xl before:-z-10">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-mono uppercase tracking-wider">
                CONART
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="pb-4 bg-white border-t border-gray-200">
              {Object.entries(categoryNames).map(([category, name]) => {
                const categoryTools = getToolsByCategory(category as any)
                
                return (
                  <div key={category} className="mt-4">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                      {name}
                    </div>
                    {categoryTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.path}
                        prefetch={true}
                        className={cn(
                          "flex items-center px-6 py-3 text-sm rounded-lg mx-2 my-1 transition-colors",
                          pathname === tool.path
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="mr-3">{tool.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">{tool.name}</span>
                            {tool.isNew && (
                              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16"></div>
    </>
  )
}
