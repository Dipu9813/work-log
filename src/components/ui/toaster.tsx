'use client'

import { useToast } from '@/components/ui/use-toast'
import { X } from 'lucide-react'

export function Toaster() {
  const { toast: toastData } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {Array.isArray(toastData) && toastData.map((toast: any) => (
        <div
          key={toast.id}
          className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${
            toast.variant === 'destructive'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-pink-200 bg-white text-pink-900'
          }`}
        >
          <div className="grid gap-1">
            {toast.title && (
              <div className="text-sm font-semibold">
                {toast.title}
              </div>
            )}
            {toast.description && (
              <div className="text-sm opacity-90">
                {toast.description}
              </div>
            )}
          </div>
          <button
            onClick={() => toast.dismiss?.()}
            className="absolute right-2 top-2 rounded-md p-1 text-pink-400 opacity-0 transition-opacity hover:text-pink-600 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}