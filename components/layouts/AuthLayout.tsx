'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  backHref?: string
  title?: string
  subtitle?: string
}

export function AuthLayout({ children, backHref = '/', title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        {backHref && (
          <Link href={backHref} className="inline-flex items-center text-primary-dark mb-8 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        )}

        <div className="bg-white border-2 border-primary-light rounded-lg p-8 shadow-sm">
          {title && (
            <>
              <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-center text-gray-600 mb-8 text-sm">
                  {subtitle}
                </p>
              )}
            </>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}




