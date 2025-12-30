'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Action {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
}

interface ActionMenuProps {
  actions: Action[]
}

export function ActionMenu({ actions }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (action: Action) => {
    action.onClick()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center space-x-2
                  hover:bg-gray-50 transition-colors
                  ${action.variant === 'danger' ? 'text-red-600' : 'text-gray-700'}
                `}
              >
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}




