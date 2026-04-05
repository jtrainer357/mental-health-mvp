'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface Command {
  name: string
  description: string
  category: string
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery<{ commands: Command[] }>({
    queryKey: ['mc-commands-palette'],
    queryFn: () => fetch('/api/mc/commands').then((r) => r.json()),
    staleTime: Infinity,
  })

  const commands = data?.commands || []

  // Fuzzy search
  const filtered = useMemo(() => {
    if (!search.trim()) return commands
    const q = search.toLowerCase()
    return commands.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    )
  }, [commands, search])

  // Group by category
  const grouped = useMemo(() => {
    const groups: { category: string; commands: Command[] }[] = []
    const seen = new Set<string>()
    for (const cmd of filtered) {
      if (!seen.has(cmd.category)) {
        seen.add(cmd.category)
        groups.push({ category: cmd.category, commands: [] })
      }
      groups.find((g) => g.category === cmd.category)!.commands.push(cmd)
    }
    return groups
  }, [filtered])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => filtered, [filtered])

  // Global keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        setSearch('')
        setActiveIndex(0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Reset active index on search change
  useEffect(() => {
    setActiveIndex(0)
  }, [search])

  // Copy to clipboard
  const copyCommand = useCallback(
    (name: string) => {
      const text = `/${name}`
      navigator.clipboard.writeText(text).then(() => {
        setToast(text)
        setTimeout(() => setToast(null), 2000)
        setOpen(false)
        setSearch('')
      })
    },
    []
  )

  // Keyboard navigation within palette
  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        setSearch('')
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, flatList.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        if (flatList[activeIndex]) {
          copyCommand(flatList[activeIndex].name)
        }
        return
      }
    },
    [flatList, activeIndex, copyCommand]
  )

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const active = listRef.current.querySelector('[data-active="true"]')
    if (active) {
      active.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  if (!open && !toast) return null

  return (
    <>
      {/* Palette overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setOpen(false)
              setSearch('')
            }}
          />

          {/* Dialog */}
          <div
            className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl overflow-hidden"
            style={{
              borderRadius: 16,
              border: '1px solid rgba(0,73,82,0.10)',
              boxShadow: '0 24px 80px rgba(0,73,82,0.12), 0 8px 24px rgba(0,73,82,0.06)',
              animation: 'paletteIn 0.15s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            onKeyDown={handlePaletteKeyDown}
          >
            {/* Search input */}
            <div className="px-5 py-4 flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-[#E0D3C8] shrink-0">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search commands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 text-lg font-light text-[#2B2B2B] bg-transparent focus:outline-none font-[family-name:var(--font-body)]"
                style={{ color: '#2B2B2B' }}
              />
            </div>

            {/* Placeholder color override */}
            <style jsx>{`
              input::placeholder {
                color: #E0D3C8;
              }
            `}</style>

            {/* Divider */}
            <div className="h-px bg-[rgba(0,73,82,0.06)]" />

            {/* Command list */}
            <div ref={listRef} className="max-h-[50vh] overflow-auto py-2 px-2">
              {grouped.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#E0D3C8] font-light font-[family-name:var(--font-body)]">
                  No commands matching &ldquo;{search}&rdquo;
                </div>
              ) : (
                grouped.map((group) => (
                  <div key={group.category} className="mb-1 last:mb-0">
                    {/* Category header */}
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: '#FF8D6E' }}
                      />
                      <span
                        className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8CA7A2] font-[family-name:var(--font-mono)]"
                      >
                        {group.category}
                      </span>
                    </div>

                    {/* Commands */}
                    {group.commands.map((cmd) => {
                      const globalIndex = flatList.indexOf(cmd)
                      const isActive = globalIndex === activeIndex
                      return (
                        <button
                          key={cmd.name}
                          data-active={isActive}
                          onClick={() => copyCommand(cmd.name)}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200"
                          style={{
                            borderRadius: 10,
                            backgroundColor: isActive ? 'rgba(255,141,110,0.08)' : 'transparent',
                            color: isActive ? '#2B2B2B' : '#2B2B2B',
                            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                          onMouseLeave={() => {}}
                        >
                          <code
                            className="text-sm min-w-[90px] shrink-0 rounded-lg px-2 py-0.5"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: 'rgba(0,73,82,0.04)',
                              color: '#004952',
                            }}
                          >
                            /{cmd.name}
                          </code>
                          <span className="text-sm text-[#5A6364] font-[family-name:var(--font-body)]" style={{ lineHeight: 1.5 }}>{cmd.description}</span>
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-[rgba(0,73,82,0.06)]" style={{ borderRadius: '0 0 16px 16px' }}>
              <div className="flex items-center justify-center gap-6 text-[10px] text-[#E0D3C8] font-[family-name:var(--font-mono)]">
                <span className="flex items-center gap-1">
                  <span>&#8593;&#8595;</span>
                  <span>navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>&#8629;</span>
                  <span>copy</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>esc</span>
                  <span>close</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
          <div
            className="bg-[#004952] text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
            style={{ animation: 'paletteIn 0.15s cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#FF8D6E] shrink-0">
              <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-[family-name:var(--font-body)]">Copied</span>
            <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded" style={{ fontFamily: 'var(--font-mono)' }}>{toast}</code>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes paletteIn {
          from { opacity: 0; transform: scale(0.98) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
    </>
  )
}
