"use client"

import { Suspense } from "react"
import { VerifyContent } from "./VerifyContent"

export default function VerifyPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Suspense fallback={
        <div className="w-full max-w-sm bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center py-16">
          <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
