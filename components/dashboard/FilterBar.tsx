'use client'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    label: string
    value: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void
  }[]
  onClear?: () => void
}

export function FilterBar({ searchValue, onSearchChange, filters = [], onClear }: FilterBarProps) {
  const hasActiveFilters = searchValue || filters.some(f => f.value)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Buscar..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filters */}
        {filters.map((filter, index) => (
          <div key={index} className="w-full md:w-48">
            <Select
              label={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              options={filter.options}
            />
          </div>
        ))}

        {/* Clear Button */}
        {hasActiveFilters && onClear && (
          <div className="flex items-end">
            <Button variant="outline" onClick={onClear}>
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}




