'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'

type FilterTab = 'all' | 'confirmed' | 'emerging' | 'stale'
type SortKey = 'id' | 'filed' | 'strength'

const STRENGTH_ORDER: Record<string, number> = { strong: 0, moderate: 1, weak: 2 }
const PAGE_SIZE = 20

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return dateStr
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays <= 30) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function SignalsPage() {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const { data } = useQuery({
    queryKey: ['mc-signals'],
    queryFn: () => fetch('/api/mc/signals').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const signals = data?.signals || []

  const filtered = useMemo(() => {
    let result = signals

    if (filter === 'confirmed') result = result.filter((s: any) => s.lifecycle === 'confirmed')
    else if (filter === 'emerging') result = result.filter((s: any) => s.lifecycle === 'emerging')
    else if (filter === 'stale') result = result.filter((s: any) => s.isStale)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s: any) =>
          s.id.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.finding.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a: any, b: any) => {
      let cmp = 0
      if (sortKey === 'id') {
        const numA = parseInt(a.id.replace('SIG-', ''))
        const numB = parseInt(b.id.replace('SIG-', ''))
        cmp = numA - numB
      } else if (sortKey === 'filed') {
        cmp = new Date(a.filed || 0).getTime() - new Date(b.filed || 0).getTime()
      } else if (sortKey === 'strength') {
        cmp = (STRENGTH_ORDER[a.strength] ?? 9) - (STRENGTH_ORDER[b.strength] ?? 9)
      }
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [signals, filter, search, sortKey, sortAsc])

  const counts = useMemo(
    () => ({
      all: signals.length,
      confirmed: signals.filter((s: any) => s.lifecycle === 'confirmed').length,
      emerging: signals.filter((s: any) => s.lifecycle === 'emerging').length,
      stale: signals.filter((s: any) => s.isStale).length,
    }),
    [signals]
  )

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'confirmed', label: `Confirmed (${counts.confirmed})` },
    { key: 'emerging', label: `Emerging (${counts.emerging})` },
    { key: 'stale', label: `Stale (${counts.stale})` },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--synapse, #2B2B2B)',
              margin: 0,
            }}>
              Signal Registry
            </h1>
            <p style={{
              fontSize: 14,
              fontWeight: 300,
              color: 'var(--text-secondary, #5A6364)',
              marginTop: 6,
              lineHeight: 1.55,
            }}>
              {signals.length} signals tracked
            </p>
          </div>
          <FreshnessIndicator timestamp={data?.timestamp} />
        </div>

        {/* Filter Tabs + Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setVisibleCount(PAGE_SIZE) }}
                style={{
                  borderRadius: 9999,
                  padding: '6px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                  background: filter === tab.key ? 'var(--growth, #004952)' : 'transparent',
                  color: filter === tab.key ? '#FFF' : 'var(--text-secondary, #5A6364)',
                }}
                onMouseEnter={(e) => {
                  if (filter !== tab.key) e.currentTarget.style.color = 'var(--growth, #004952)'
                }}
                onMouseLeave={(e) => {
                  if (filter !== tab.key) e.currentTarget.style.color = 'var(--text-secondary, #5A6364)'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: 288, marginLeft: 'auto' }}>
            <svg
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
                color: 'var(--core, #8CA7A2)',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search signals..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE) }}
              style={{
                width: '100%',
                paddingLeft: 40,
                paddingRight: 16,
                paddingTop: 8,
                paddingBottom: 8,
                fontSize: 14,
                borderRadius: 10,
                background: '#FFF',
                border: '1px solid rgba(0,73,82,0.10)',
                outline: 'none',
                color: 'var(--synapse, #2B2B2B)',
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--growth, #004952)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,73,82,0.10)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,73,82,0.10)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: 'var(--core, #8CA7A2)',
          }}>
            Sort
          </span>
          {(['id', 'filed', 'strength'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              style={{
                borderRadius: 9999,
                padding: '4px 12px',
                fontSize: 12,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                background: sortKey === key ? 'var(--growth, #004952)' : 'transparent',
                color: sortKey === key ? '#FFF' : 'var(--core, #8CA7A2)',
              }}
            >
              {key}
              {sortKey === key ? (sortAsc ? ' \u2191' : ' \u2193') : ''}
            </button>
          ))}
        </div>

        {/* Signal Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.slice(0, visibleCount).map((signal: any, i: number) => (
            <SignalCard key={signal.id} signal={signal} index={i} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--core, #8CA7A2)' }}>
                No signals match the current filter
              </p>
            </div>
          )}
          {visibleCount < filtered.length && (
            <button
              onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
              style={{
                borderRadius: 9999,
                padding: '8px 24px',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                background: 'var(--growth, #004952)',
                color: '#FFF',
                alignSelf: 'center',
                marginTop: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              Show more ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SignalCard({ signal, index }: { signal: any; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: '#FFF',
        border: '1px solid rgba(0,73,82,0.10)',
        borderRadius: 10,
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,73,82,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Compact Row */}
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Left: ID + Strength */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, width: 80 }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--core, #8CA7A2)',
          }}>
            {signal.id}
          </span>
          <StrengthBadge strength={signal.strength} />
        </div>

        {/* Center: Title/Finding */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--synapse, #2B2B2B)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
            margin: 0,
          }}>
            {signal.title || signal.finding}
          </p>
          {!expanded && signal.finding && signal.finding !== signal.title && (
            <p style={{
              fontSize: 13,
              fontWeight: 300,
              color: 'var(--text-secondary, #5A6364)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap' as const,
              marginTop: 4,
              margin: '4px 0 0',
            }}>
              {signal.finding}
            </p>
          )}
        </div>

        {/* Right: Lifecycle + Stale + Dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LifecycleBadge lifecycle={signal.lifecycle} />
          {signal.isStale && (
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: 9999,
              backgroundColor: 'rgba(220,38,38,0.10)',
              color: '#DC2626',
            }}>
              Stale
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 8 }}>
            {signal.filed && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--core, #8CA7A2)',
              }}>
                {timeAgo(signal.filed)}
              </span>
            )}
            {signal.lastValidated && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--care, #E0D3C8)',
              }}>
                {timeAgo(signal.lastValidated)}
              </span>
            )}
          </div>
          <svg
            style={{
              width: 16,
              height: 16,
              color: 'var(--care, #E0D3C8)',
              transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid var(--care, #E0D3C8)',
        }}>
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {signal.finding && (
              <div>
                <SectionLabel label="Finding" />
                <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-secondary, #5A6364)', lineHeight: 1.55, margin: 0 }}>
                  {signal.finding}
                </p>
              </div>
            )}
            {signal.strategyImpact && (
              <div>
                <SectionLabel label="Strategy Impact" />
                <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-secondary, #5A6364)', lineHeight: 1.55, margin: 0 }}>
                  {signal.strategyImpact}
                </p>
              </div>
            )}
            {signal.designImpact && (
              <div>
                <SectionLabel label="Design Impact" />
                <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-secondary, #5A6364)', lineHeight: 1.55, margin: 0 }}>
                  {signal.designImpact}
                </p>
              </div>
            )}
          </div>

          {/* Mobile dates fallback */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {signal.filed && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--core, #8CA7A2)' }}>
                Filed: {timeAgo(signal.filed)}
              </span>
            )}
            {signal.lastValidated && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--core, #8CA7A2)' }}>
                Validated: {timeAgo(signal.lastValidated)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        color: 'var(--core, #8CA7A2)',
        whiteSpace: 'nowrap' as const,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 2, background: 'var(--core, #8CA7A2)', opacity: 0.25 }} />
    </div>
  )
}

function StrengthBadge({ strength }: { strength: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    strong: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    moderate: { bg: 'rgba(255,141,110,0.15)', text: '#D4623B' },
    weak: { bg: 'rgba(140,167,162,0.15)', text: '#8CA7A2' },
  }
  const c = colors[strength] || { bg: 'rgba(140,167,162,0.15)', text: '#8CA7A2' }
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      fontWeight: 600,
      padding: '3px 12px',
      borderRadius: 9999,
      backgroundColor: c.bg,
      color: c.text,
    }}>
      {strength}
    </span>
  )
}

function LifecycleBadge({ lifecycle }: { lifecycle: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    emerging: { bg: 'rgba(212,160,23,0.12)', text: '#A17A00' },
    challenged: { bg: 'rgba(220,38,38,0.10)', text: '#DC2626' },
    retired: { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' },
  }
  const c = colors[lifecycle] || { bg: 'rgba(140,167,162,0.15)', text: '#8CA7A2' }
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      fontWeight: 600,
      padding: '3px 12px',
      borderRadius: 9999,
      backgroundColor: c.bg,
      color: c.text,
    }}>
      {lifecycle}
    </span>
  )
}

function FreshnessIndicator({ timestamp }: { timestamp?: string }) {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const label =
    seconds < 60
      ? 'just now'
      : seconds < 3600
        ? `${Math.floor(seconds / 60)}m ago`
        : `${Math.floor(seconds / 3600)}h ago`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: '#10B981',
        animation: 'pulse 2s infinite',
      }} />
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: 'var(--core, #8CA7A2)',
      }}>
        Updated {label}
      </span>
    </div>
  )
}
