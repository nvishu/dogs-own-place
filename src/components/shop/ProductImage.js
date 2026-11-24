'use client'
import { useState } from 'react'

// Plain <img> (not next/image) so local SVG packshots and your own JPG/PNG/WebP photos all work,
// with a friendly fallback if a file is missing.
export default function ProductImage({ src, alt, className = '', priority = false }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return <div className={`flex items-center justify-center bg-brand-light text-5xl ${className}`} role="img" aria-label={alt}>🐾</div>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading={priority ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />
  )
}
