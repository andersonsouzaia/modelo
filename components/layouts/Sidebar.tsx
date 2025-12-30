'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Car, 
  Shield, 
  Megaphone, 
  Image as ImageIcon,
  Users,
  Tablet,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  BarChart3,
  Package,
  Activity
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  userType: 'empresa' | 'motorista' | 'admin'
}

const menuItems = {
  empresa: [
    { href: '/empresa/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/empresa/campanhas', label: 'Campanhas', icon: Megaphone },
    { href: '/empresa/campanhas/nova', label: 'Nova Campanha', icon: Megaphone },
    { href: '/empresa/pagamentos', label: 'Pagamentos', icon: DollarSign },
  ],
  motorista: [
    { href: '/motorista/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/motorista/ganhos', label: 'Ganhos', icon: DollarSign },
    { href: '/motorista/suporte', label: 'Suporte', icon: Settings },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
    { href: '/admin/motoristas', label: 'Motoristas', icon: Car },
    { href: '/admin/tablets', label: 'Tablets', icon: Tablet },
    { href: '/admin/midias', label: 'Mídias', icon: ImageIcon },
    { href: '/admin/campanhas', label: 'Campanhas', icon: Megaphone },
    { href: '/admin/repasses', label: 'Repasses', icon: DollarSign },
    { href: '/admin/planos', label: 'Planos', icon: Package },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  ],
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const items = menuItems[userType] || []

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-sm"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-light p-2 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-gray-800">Movello</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-light text-primary font-medium' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

