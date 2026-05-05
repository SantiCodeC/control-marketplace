import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Control Marketplace',
  description: 'Control de publicaciones de propiedades en Facebook Marketplace',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#f9fafb' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
