'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo, useCallback } from 'react'

export default function CommandsPage() {
  const [toast, setToast] = useState<string | null>(null)
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['mc-commands'],
    queryFn: () => fetch('/api/mc/commands').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const commands = data?.commands || []

  const grouped = useMemo(() => {
    const groups: Record<string, any[]> = {}
    for (const cmd of commands) {
      if (!groups[cmd.category]) groups[cmd.category] = []
      groups[cmd.category]!.push(cmd)
    }
    return groups
  }, [commands])

  const categoryOrder = [
    'Morning Routine', 'Research', 'Planning', 'Design',
    'Operations', 'Evidence', 'Communication', 'Other',
  ]

  const sortedCategories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const ai = categoryOrder.indexOf(a)
      const bi = categoryOrder.indexOf(b)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }, [grouped])

  const copyCommand = useCallback((name: string) => {
    navigator.clipboard.writeText(`/${name}`).then(() => {
      setCopiedName(name)
      setToast(`/${name}`)
      setTimeout(() => {
        setToast(null)
        setCopiedName(null)
      }, 2000)
    })
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light tracking-tight text-[#2B2B2B] font-[family-name:var(--font-body)]">Commands</h2>
        <p className="text-sm text-[#8CA7A2] mt-1 font-light font-[family-name:var(--font-body)]">
          Click to copy. Paste in Claude Code terminal.
        </p>
      </div>

      {/* Categories */}
      {sortedCategories.map(category => {
        const cmds = grouped[category] || []

        return (
          <section key={category} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div className="w-0.5 h-4 rounded-full bg-[#FF8D6E] shrink-0" />
              <h3
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8CA7A2] font-[family-name:var(--font-mono)]"
              >
                {category}
              </h3>
              <span className="text-[11px] text-[#E0D3C8] tabular-nums font-[family-name:var(--font-mono)]">{cmds.length}</span>
            </div>

            {/* Command cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cmds.map((cmd: any) => (
                <button
                  key={cmd.name}
                  onClick={() => copyCommand(cmd.name)}
                  className="bg-white rounded-[10px] border border-[rgba(0,73,82,0.10)] shadow-[0_2px_8px_rgba(0,73,82,0.04)] p-4 text-left group"
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    backgroundColor: copiedName === cmd.name ? 'rgba(0,73,82,0.02)' : 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,73,82,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,73,82,0.04)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <code
                      className="rounded-lg px-2 py-0.5"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        backgroundColor: 'rgba(0,73,82,0.04)',
                        color: '#004952',
                      }}
                    >
                      /{cmd.name}
                    </code>
                    <span className="text-[#E0D3C8] opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] ml-auto font-[family-name:var(--font-mono)] uppercase tracking-[0.12em]">
                      copy
                    </span>
                  </div>
                  <p className="text-xs text-[#8CA7A2] leading-relaxed font-[family-name:var(--font-body)]">{cmd.description}</p>
                </button>
              ))}
            </div>
          </section>
        )
      })}

      {commands.length === 0 && (
        <div className="text-center py-16 text-[#E0D3C8] text-sm font-light font-[family-name:var(--font-body)]">
          No commands found
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className="bg-[#004952] text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2"
            style={{ animation: 'toastIn 0.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
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
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
