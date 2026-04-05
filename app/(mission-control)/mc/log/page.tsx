'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

const AGENT_COLORS: Record<string, string> = {
  maren: '#10B981',
  reid: '#004952',
  ava: '#FF8D6E',
  kai: '#D4A017',
  syd: '#417E86',
}

const TYPE_TO_AGENT: Record<string, string> = {
  signal: 'maren',
  analysis: 'maren',
  meeting: 'kai',
  planning: 'reid',
  retrospective: 'kai',
  'daily-log': 'kai',
}

function getAgentColor(log: Record<string, unknown>): string {
  const agent = typeof log.agent === 'string' ? log.agent : ''
  const type = typeof log.type === 'string' ? log.type : ''
  if (agent && agent in AGENT_COLORS) return AGENT_COLORS[agent] as string
  if (type && type in TYPE_TO_AGENT) {
    const mapped = TYPE_TO_AGENT[type] as string
    if (mapped in AGENT_COLORS) return AGENT_COLORS[mapped] as string
  }
  return '#8CA7A2'
}

export default function LogPage() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['mc-daily-logs'],
    queryFn: () => fetch('/api/mc/daily-logs').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const logs = data?.logs || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--synapse, #2B2B2B)',
              margin: 0,
            }}>
              Daily Logs
            </h1>
            <p style={{
              fontSize: 14,
              fontWeight: 300,
              color: 'var(--text-secondary, #5A6364)',
              marginTop: 6,
              lineHeight: 1.55,
            }}>
              {logs.length} recent {logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <FreshnessIndicator timestamp={data?.timestamp} />
        </div>

        {/* Log cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {logs.map((log: any, index: number) => (
            <div
              key={log.slug}
              style={{
                background: '#FFF',
                border: '1px solid rgba(0,73,82,0.10)',
                borderLeft: `3px solid ${getAgentColor(log)}`,
                borderRadius: 10,
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                cursor: 'pointer',
                overflow: 'hidden',
                opacity: 0,
                transform: 'translateY(8px)',
                animation: `fadeInUp 0.3s cubic-bezier(0.22,1,0.36,1) ${index * 40}ms forwards`,
              }}
              onClick={() => setExpandedSlug(expandedSlug === log.slug ? null : log.slug)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,73,82,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--core, #8CA7A2)',
                  width: 96,
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {log.date}
                </span>
                <p style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--synapse, #2B2B2B)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                  margin: 0,
                }}>
                  {log.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <LogTypeBadge type={log.type} />
                  <LogStatusBadge status={log.status} />
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    color: 'var(--care, #E0D3C8)',
                    flexShrink: 0,
                    transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
                    transform: expandedSlug === log.slug ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {expandedSlug === log.slug && log.content && (
                <div style={{
                  padding: '0 20px 20px',
                  borderTop: '1px solid var(--care, #E0D3C8)',
                }}>
                  <div style={{ paddingTop: 16 }}>
                    <pre style={{
                      fontFamily: "inherit",
                      fontSize: 13,
                      fontWeight: 300,
                      color: 'var(--text-secondary, #5A6364)',
                      whiteSpace: 'pre-wrap' as const,
                      maxHeight: 384,
                      overflowY: 'auto' as const,
                      lineHeight: 1.55,
                      margin: 0,
                    }}>
                      {log.content.slice(0, 2500)}
                      {log.content.length > 2500 && '\n\n... (truncated)'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}

          {logs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--core, #8CA7A2)' }}>
                No daily logs found
              </p>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

function LogTypeBadge({ type }: { type: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    'daily-log': { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' },
    meeting: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    analysis: { bg: 'rgba(65,126,134,0.12)', text: '#417E86' },
    signal: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
    retrospective: { bg: 'rgba(255,141,110,0.15)', text: '#D4623B' },
    planning: { bg: 'rgba(212,160,23,0.12)', text: '#A17A00' },
  }
  const c = colors[type] || { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' }
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
      {type}
    </span>
  )
}

function LogStatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    done: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    'in-progress': { bg: 'rgba(212,160,23,0.12)', text: '#A17A00' },
    draft: { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' },
    published: { bg: 'rgba(65,126,134,0.12)', text: '#417E86' },
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
        {label}
      </span>
    </div>
  )
}
