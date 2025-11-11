'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Mic, LogOut, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const pathname = usePathname()
  const isVerifyPage = pathname === '/verify'

  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ECHO</h1>
              <p className="text-xs text-gray-400">Tamper-Proof Audio</p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {/* Prominent Verify Button */}
            <Link
              href="/verify"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isVerifyPage
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 border border-purple-500/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Verify</span>
            </Link>

            {ready && !authenticated && (
              <button
                onClick={login}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
              >
                Login
              </button>
            )}

            {ready && authenticated && (
              <div className="flex items-center gap-3">
                <div className="text-sm text-right hidden md:block">
                  <div className="text-gray-400 text-xs">Logged in</div>
                  <div className="font-medium text-xs">{user?.email?.address}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-gray-800 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
