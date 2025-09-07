'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Icons } from './icons'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  onClear?: () => void
  suggestions?: string[]
  onSuggestionSelect?: (suggestion: string) => void
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function SearchBar({
  placeholder = '作品を検索...',
  onSearch,
  onClear,
  suggestions = [],
  onSuggestionSelect,
  className = '',
  disabled = false,
  autoFocus = false
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // フィルタされたサジェスチョン
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase()) && suggestion !== query
  )

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowSuggestions(value.length > 0 && filteredSuggestions.length > 0)
    setSelectedSuggestionIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim())
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    onClear?.()
    inputRef.current?.focus()
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    onSuggestionSelect?.(suggestion)
    onSearch(suggestion)
  }

  const handleInputFocus = () => {
    if (query.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icons.search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={disabled}
            >
              <Icons.x className="h-4 w-4" />
            </button>
          )}
          
          <Button
            type="button"
            size="sm"
            onClick={handleSearch}
            disabled={disabled || !query.trim()}
            className="ml-2"
          >
            <Icons.search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* サジェスチョン */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                index === selectedSuggestionIndex ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icons.search className="h-4 w-4 text-gray-400" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
