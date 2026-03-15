'use client'
import { useState } from 'react'

export function CopyButton({ text, label = 'Copy' }: { text: string, label?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all"
    >
      {copied ? '✓ Copied' : label}
    </button>
  )
}
