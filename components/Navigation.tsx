"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Menu, 
  X, 
  Home, 
  Image as ImageIcon, 
  FileText, 
  Settings,
  ChevronDown
} from 'lucide-react'
import { tools, getToolsByCategory } from '@/lib/tools'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

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
      <nav className="hidden lg:block bg-gradient-to-r from-blue-800 to-purple-800 text-white shadow-lg border-b border-white/10 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
              <div className="bg-white/20 rounded-lg p-2">
                <ImageIcon className="h-6 w-6" />
              </div>
              <span>ConArt</span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center space-x-2">

              {/* Category Dropdowns */}
              {Object.entries(categoryNames).map(([category, name]) => {
                const categoryTools = getToolsByCategory(category as any)
                const isActive = categoryTools.some(tool => pathname === tool.path)

                return (
                  <div key={category} className="relative">
                    <button
                      onClick={() => toggleDropdown(category)}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      <span className="ml-2">{name}</span>
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </button>

                    {openDropdown === category && (
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border z-50">
                        <div className="py-2">
                          {categoryTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={tool.path}
                              className={cn(
                                "flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors",
                                pathname === tool.path && "bg-blue-50 text-blue-600"
                              )}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <span className="text-lg mr-3">{tool.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <span className="font-medium">{tool.name}</span>
                                  {tool.isNew && (
                                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      New
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
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
      <nav className="lg:hidden bg-gradient-to-r from-blue-800 to-purple-800 text-white shadow-lg border-b border-white/10 backdrop-blur-sm bg-opacity-95">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 font-bold text-lg">
              <div className="bg-white/20 rounded-lg p-2">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span>ConArt</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="pb-4">

              {Object.entries(categoryNames).map(([category, name]) => {
                const categoryTools = getToolsByCategory(category as any)
                
                return (
                  <div key={category} className="mt-2">
                    <div className="px-3 py-2 text-sm font-semibold text-white/60 uppercase tracking-wider">
                      {name}
                    </div>
                    {categoryTools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.path}
                        className={cn(
                          "block px-6 py-2 text-sm rounded-md transition-colors",
                          pathname === tool.path
                            ? "bg-white/20 text-white"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="mr-2">{tool.icon}</span>
                        {tool.name}
                        {tool.isNew && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
