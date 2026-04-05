'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'

function formatRelativeTime(raw: string): string {
  // Try to extract a date from the beginning of the lastUpdated string (e.g. "2026-03-31 (shutdown...)")
  const match = raw?.match(/^(\d{4}-\d{2}-\d{2})/)
  if (!match) return raw || 'Unknown'
  const then = new Date(match[1] + 'T12:00:00')
  const now = new Date()
  const diffMs = now.getTime() - then.getTime()
  if (diffMs < 0) return 'just now'
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `Last active ${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `Last active ${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays === 1) return 'Last active yesterday'
  return `Last active ${diffDays}d ago`
}

const AGENT_COLORS: Record<string, string> = {
  maren: '#10B981',
  reid: '#004952',
  ava: '#FF8D6E',
  kai: '#D4A017',
  syd: '#417E86',
}

const AGENT_ICONS: Record<string, string> = {
  maren: '\u{1F52C}',
  reid: '\u{1F3AF}',
  ava: '\u{270F}\u{FE0F}',
  kai: '\u{1F4CB}',
  syd: '\u{2699}\u{FE0F}',
}

const AGENT_ROLES: Record<string, string> = {
  maren: 'User Researcher',
  reid: 'Product Strategist',
  ava: 'Product Designer',
  kai: 'Project Manager',
  syd: 'Full-Stack Engineer',
}

export default function AgentsPage() {
  const { data } = useQuery({
    queryKey: ['mc-agents'],
    queryFn: () => fetch('/api/mc/agents').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const agents = data?.agents || []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--synapse, #2B2B2B)',
              margin: 0,
            }}>
              Agent System
            </h1>
            <p style={{
              fontSize: 14,
              fontWeight: 300,
              color: 'var(--text-secondary, #5A6364)',
              marginTop: 6,
              lineHeight: 1.55,
            }}>
              {agents.length} agents active
            </p>
          </div>
          <FreshnessIndicator timestamp={data?.timestamp} />
        </div>

        {/* Agent Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 20,
        }}>
          {agents.map((agent: any, i: number) => (
            <AgentCard key={agent.slug} agent={agent} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AgentCard({ agent, index }: { agent: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [inboxOpen, setInboxOpen] = useState(false)
  const color = AGENT_COLORS[agent.slug] || '#8CA7A2'
  const icon = AGENT_ICONS[agent.slug] || '\u25CF'

  return (
    <Link
      href={`/mc/agents/${agent.slug}`}
      onClick={(e) => {
        // Allow inner buttons to work without navigating
        if ((e.target as HTMLElement).closest('button')) {
          e.preventDefault()
        }
      }}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          background: '#FFF',
          border: '1px solid rgba(0,73,82,0.10)',
          borderRadius: 10,
          borderLeft: `3px solid ${color}`,
          padding: '18px 20px',
          transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,73,82,0.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
              backgroundColor: `${color}18`,
            }}
          >
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--synapse, #2B2B2B)',
              }}>
                {agent.name}
              </span>
              {agent.inboxCount > 0 && (
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase' as const,
                    fontWeight: 600,
                    padding: '3px 12px',
                    borderRadius: 9999,
                    backgroundColor: `${color}15`,
                    color,
                  }}
                >
                  {agent.inboxCount}
                </span>
              )}
            </div>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              color: 'var(--core, #8CA7A2)',
              marginTop: 4,
            }}>
              {agent.role || AGENT_ROLES[agent.slug] || 'Agent'}
            </p>
          </div>
        </div>

        {/* Last Updated — relative time */}
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: 'var(--core, #8CA7A2)',
          marginBottom: agent.hotContext?.length > 0 ? 6 : 16,
        }}>
          {formatRelativeTime(agent.lastUpdated)}
        </p>

        {/* Hot context one-line preview */}
        {agent.hotContext?.length > 0 && (
          <p style={{
            fontSize: 12,
            fontWeight: 400,
            color: 'var(--text-secondary, #5A6364)',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap' as const,
            margin: 0,
            marginBottom: 16,
            paddingLeft: 1,
          }}>
            {agent.hotContext[0]?.replace(/\*\*/g, '')}
          </p>
        )}

        {/* Hot Context */}
        <div style={{ marginBottom: 16 }}>
          <SectionLabel label="Hot Context" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {agent.hotContext.slice(0, 4).map((item: string, i: number) => (
              <p key={i} style={{
                fontSize: 13,
                fontWeight: 300,
                color: 'var(--text-secondary, #5A6364)',
                lineHeight: 1.55,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
                margin: 0,
              }}>
                {item}
              </p>
            ))}
            {agent.hotContext.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--core, #8CA7A2)', fontStyle: 'italic', margin: 0 }}>
                No hot context
              </p>
            )}
          </div>
        </div>

        {/* Working On */}
        {agent.currentlyWorkingOn.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <SectionLabel label="Working On" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {agent.currentlyWorkingOn.slice(0, 3).map((item: string, i: number) => (
                <p key={i} style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: 'var(--text-secondary, #5A6364)',
                  lineHeight: 1.55,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                  margin: 0,
                }}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Expand toggle for session work */}
        {agent.sessionWork.length > 0 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setExpanded(!expanded) }}
              style={{
                width: '100%',
                textAlign: 'left',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--core, #8CA7A2)',
                background: 'none',
                border: 'none',
                borderTop: '1px solid var(--care, #E0D3C8)',
                padding: '10px 0',
                cursor: 'pointer',
                transition: 'color 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {expanded
                ? 'Hide session work'
                : `${agent.sessionWork.length} session items`}
              <span style={{ marginLeft: 4 }}>{expanded ? '\u25B4' : '\u25BE'}</span>
            </button>

            {expanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, paddingBottom: 8 }}>
                {agent.sessionWork.map((item: string, i: number) => (
                  <p key={i} style={{
                    fontSize: 13,
                    fontWeight: 300,
                    color: 'var(--text-secondary, #5A6364)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}>
                    {item}
                  </p>
                ))}
              </div>
            )}
          </>
        )}

        {/* Inbox section */}
        {agent.inboxCount > 0 && (
          <>
            <button
              onClick={(e) => { e.preventDefault(); setInboxOpen(!inboxOpen) }}
              style={{
                width: '100%',
                textAlign: 'left',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--core, #8CA7A2)',
                background: 'none',
                border: 'none',
                borderTop: '1px solid var(--care, #E0D3C8)',
                padding: '10px 0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'color 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <span>Inbox ({agent.inboxCount})</span>
              <span style={{ marginLeft: 'auto' }}>{inboxOpen ? '\u25B4' : '\u25BE'}</span>
            </button>

            {inboxOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4, paddingBottom: 4 }}>
                {agent.unprocessedMessages?.slice(0, 5).map((msg: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--backbone, #F6F3EB)',
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <TypeBadge type={msg.type} />
                      <PriorityBadge priority={msg.priority} />
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        color: 'var(--core, #8CA7A2)',
                        marginLeft: 'auto',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}>
                        {msg.from}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13,
                      fontWeight: 400,
                      color: 'var(--synapse, #2B2B2B)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                      margin: 0,
                    }}>
                      {msg.subject}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
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
      <div style={{
        flex: 1,
        height: 2,
        background: 'var(--core, #8CA7A2)',
        opacity: 0.25,
      }} />
    </div>
  )
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    signal: { bg: 'rgba(16,185,129,0.12)', text: '#10B981' },
    decision: { bg: 'rgba(0,73,82,0.10)', text: '#004952' },
    request: { bg: 'rgba(255,141,110,0.15)', text: '#D4623B' },
    alert: { bg: 'rgba(220,38,38,0.10)', text: '#DC2626' },
    question: { bg: 'rgba(212,160,23,0.12)', text: '#A17A00' },
  }
  const c = colors[type] || { bg: 'rgba(140,167,162,0.15)', text: '#8CA7A2' }
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

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    high: { bg: 'rgba(220,38,38,0.10)', text: '#DC2626' },
    medium: { bg: 'rgba(212,160,23,0.12)', text: '#A17A00' },
    low: { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' },
  }
  const c = colors[priority] || { bg: 'rgba(140,167,162,0.12)', text: '#8CA7A2' }
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
      {priority}
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
