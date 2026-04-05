'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'

type StatusFilter = 'all' | 'approved' | 'proposed' | 'draft'

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

const STATUS_BORDER_COLORS: Record<string, string> = {
  approved: '#004952',
  accepted: '#004952',
  proposed: '#FF8D6E',
  draft: '#8CA7A2',
  superseded: '#E0D3C8',
}

export default function DecisionsPage() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data } = useQuery({
    queryKey: ['mc-decisions'],
    queryFn: () => fetch('/api/mc/decisions').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const decisions = data?.decisions || []

  const filtered = useMemo(() => {
    let result = decisions
    if (filter !== 'all') {
      result = result.filter((d: any) => d.status === filter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (d: any) =>
          d.id.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          (d.content && d.content.toLowerCase().includes(q))
      )
    }
    return result
  }, [decisions, filter, search])

  const counts = useMemo(
    () => ({
      all: decisions.length,
      approved: decisions.filter((d: any) => d.status === 'approved' || d.status === 'accepted').length,
      proposed: decisions.filter((d: any) => d.status === 'proposed').length,
      draft: decisions.filter((d: any) => d.status === 'draft').length,
    }),
    [decisions]
  )

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'approved', label: `Approved (${counts.approved})` },
    { key: 'proposed', label: `Proposed (${counts.proposed})` },
    { key: 'draft', label: `Draft (${counts.draft})` },
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
              Design Decisions
            </h1>
            <p style={{
              fontSize: 14,
              fontWeight: 300,
              color: 'var(--text-secondary, #5A6364)',
              marginTop: 6,
              lineHeight: 1.55,
            }}>
              {decisions.length} decisions recorded
            </p>
          </div>
          <FreshnessIndicator timestamp={data?.timestamp} />
        </div>

        {/* Filter Tabs + Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
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
              placeholder="Search decisions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {/* Decision Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((decision: any, i: number) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              index={i}
              expanded={expandedId === decision.id}
              onToggle={() =>
                setExpandedId(expandedId === decision.id ? null : decision.id)
              }
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--core, #8CA7A2)' }}>
                No decisions match the current filter
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DecisionCard({
  decision,
  index,
  expanded,
  onToggle,
}: {
  decision: any
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  const borderColor = STATUS_BORDER_COLORS[decision.status] || '#E0D3C8'

  return (
    <div
      style={{
        background: '#FFF',
        border: '1px solid rgba(0,73,82,0.10)',
        borderRadius: 10,
        borderLeft: `3px solid ${borderColor}`,
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={onToggle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,73,82,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Header Row */}
      <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* ID */}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--core, #8CA7A2)',
          flexShrink: 0,
          width: 56,
        }}>
          {decision.id}
        </span>

        {/* Title + refs */}
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
            {decision.title}
          </p>

          {/* Signal + PRD refs inline */}
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 8 }}>
            {decision.signalRefs.slice(0, 4).map((ref: string) => (
              <span
                key={ref}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  fontWeight: 600,
                  padding: '3px 12px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(16,185,129,0.12)',
                  color: '#10B981',
                }}
              >
                {ref}
              </span>
            ))}
            {decision.signalRefs.length > 4 && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--core, #8CA7A2)',
                alignSelf: 'center',
              }}>
                +{decision.signalRefs.length - 4}
              </span>
            )}
            {decision.prdRefs.slice(0, 3).map((ref: string) => (
              <span
                key={ref}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  fontWeight: 600,
                  padding: '3px 12px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(0,73,82,0.10)',
                  color: '#004952',
                }}
              >
                {ref}
              </span>
            ))}
            {decision.prdRefs.length > 3 && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--core, #8CA7A2)',
                alignSelf: 'center',
              }}>
                +{decision.prdRefs.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Status + Date + Chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <StatusBadge status={decision.status} />
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: 'var(--core, #8CA7A2)',
          }}>
            {timeAgo(decision.date)}
          </span>
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
          <div style={{
            paddingTop: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}>
            {decision.author && (
              <div>
                <SectionLabel label="Author" />
                <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-secondary, #5A6364)', margin: 0 }}>
                  {decision.author}
                </p>
              </div>
            )}
            {decision.wireflowRefs.length > 0 && (
              <div>
                <SectionLabel label="Wireflow Refs" />
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {decision.wireflowRefs.map((ref: string) => (
                    <span
                      key={ref}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase' as const,
                        fontWeight: 600,
                        padding: '3px 12px',
                        borderRadius: 9999,
                        backgroundColor: 'rgba(65,126,134,0.12)',
                        color: '#417E86',
                      }}
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {decision.tags.length > 0 && (
              <div>
                <SectionLabel label="Tags" />
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                  {decision.tags.map((tag: string) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase' as const,
                        fontWeight: 600,
                        padding: '3px 12px',
                        borderRadius: 9999,
                        backgroundColor: 'rgba(140,167,162,0.12)',
                        color: '#8CA7A2',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {decision.content && (
            <div>
              <SectionLabel label="Content" />
              <div style={{
                background: 'var(--backbone, #F6F3EB)',
                borderRadius: 8,
                padding: 16,
                border: '1px solid rgba(0,73,82,0.05)',
              }}>
                <pre style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--text-secondary, #5A6364)',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap' as const,
                  maxHeight: 256,
                  overflowY: 'auto' as const,
                  margin: 0,
                }}>
                  {decision.content.slice(0, 1500)}
                  {decision.content.length > 1500 && '\n\n... (truncated)'}
                </pre>
              </div>
            </div>
          )}
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    approved: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    accepted: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    proposed: { bg: 'rgba(255,141,110,0.15)', text: '#D4623B' },
    draft: { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' },
    superseded: { bg: 'rgba(224,211,200,0.30)', text: '#8CA7A2' },
  }
  const c = colors[status] || { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' }
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
      {status}
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
