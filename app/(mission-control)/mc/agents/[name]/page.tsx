'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

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

export default function AgentDetailPage() {
  const params = useParams<{ name: string }>()
  const slug = params.name

  const { data } = useQuery({
    queryKey: ['mc-agent', slug],
    queryFn: () => fetch(`/api/mc/agents/${slug}`).then(r => r.json()),
    refetchInterval: 30_000,
  })

  const agent = data?.agent

  if (!agent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 18,
            height: 18,
            border: '2px solid var(--care, #E0D3C8)',
            borderTopColor: 'var(--growth-2, #417E86)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--core, #8CA7A2)' }}>
            Loading agent...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const color = AGENT_COLORS[agent.slug] || '#8CA7A2'
  const icon = AGENT_ICONS[agent.slug] || '\u25CF'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Back link */}
      <a
        href="/mc/agents"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 400,
          color: 'var(--core, #8CA7A2)',
          textDecoration: 'none',
          transition: 'color 0.4s cubic-bezier(0.22,1,0.36,1)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--growth, #004952)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--core, #8CA7A2)' }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.7 }}>
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All Agents
      </a>

      {/* Header Card */}
      <div style={{
        background: '#FFF',
        border: '1px solid rgba(0,73,82,0.10)',
        borderRadius: 10,
        padding: '22px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0,
              backgroundColor: `${color}15`,
            }}
          >
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
              <h2 style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: 'var(--synapse, #2B2B2B)',
                margin: 0,
              }}>
                {agent.name}
              </h2>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                fontWeight: 600,
                padding: '3px 12px',
                borderRadius: 9999,
                backgroundColor: `${color}12`,
                color,
              }}>
                {agent.role}
              </span>
              {agent.inboxCount > 0 && (
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase' as const,
                  fontWeight: 600,
                  padding: '3px 12px',
                  borderRadius: 9999,
                  backgroundColor: 'rgba(255,141,110,0.15)',
                  color: '#D4623B',
                }}>
                  {agent.inboxCount} inbox
                </span>
              )}
            </div>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: 'var(--core, #8CA7A2)',
              marginTop: 8,
            }}>
              Last updated {agent.lastUpdated}
            </p>
          </div>
          <FreshnessIndicator timestamp={data?.timestamp} />
        </div>
      </div>

      {/* Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {/* Hot Context */}
        <Card>
          <CardHeader title="Hot Context" count={agent.hotContext.length} />
          {agent.hotContext.length > 0 ? (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {agent.hotContext.map((item: string, i: number) => (
                <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary, #5A6364)' }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--core, #8CA7A2)',
                    width: 16,
                    flexShrink: 0,
                    textAlign: 'right' as const,
                    marginTop: 2,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ lineHeight: 1.55, fontWeight: 300 }}>{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState>No hot context items</EmptyState>
          )}
        </Card>

        {/* Currently Working On */}
        <Card>
          <CardHeader title="Currently Working On" count={agent.currentlyWorkingOn.length} />
          {agent.currentlyWorkingOn.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {agent.currentlyWorkingOn.map((item: string, i: number) => (
                <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary, #5A6364)' }}>
                  <span style={{ color: 'var(--care, #E0D3C8)', marginTop: 6, flexShrink: 0 }}>
                    <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>
                  </span>
                  <span style={{ lineHeight: 1.55, fontWeight: 300 }}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>Nothing in progress</EmptyState>
          )}
        </Card>

        {/* Session Work */}
        <Card>
          <CardHeader title="Session Work" count={agent.sessionWork.length} />
          {agent.sessionWork.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {agent.sessionWork.map((item: string, i: number) => (
                <li key={i} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-secondary, #5A6364)' }}>
                  <span style={{ color: 'var(--care, #E0D3C8)', marginTop: 6, flexShrink: 0 }}>
                    <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>
                  </span>
                  <span style={{ lineHeight: 1.55, fontWeight: 300 }}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No session work recorded</EmptyState>
          )}
        </Card>

        {/* Inbox */}
        <Card>
          <CardHeader title="Inbox" count={agent.inboxCount} />
          {agent.unprocessedMessages && agent.unprocessedMessages.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agent.unprocessedMessages.map((msg: any, i: number) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--backbone, #F6F3EB)',
                    borderRadius: 8,
                    padding: '14px 16px',
                    border: '1px solid rgba(0,73,82,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                    <TypeBadge type={msg.type} />
                    <PriorityBadge priority={msg.priority} />
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: 'var(--core, #8CA7A2)',
                    }}>
                      from {msg.from}
                    </span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      color: 'var(--care, #E0D3C8)',
                      marginLeft: 'auto',
                    }}>
                      {msg.date}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--synapse, #2B2B2B)', margin: 0 }}>
                    {msg.subject}
                  </p>
                  {msg.content && (
                    <p style={{ fontSize: 12, fontWeight: 300, color: 'var(--text-secondary, #5A6364)', lineHeight: 1.55, marginTop: 6, margin: '6px 0 0' }}>
                      {msg.content}
                    </p>
                  )}
                  {msg.actionNeeded && (
                    <p style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: '#A17A00',
                      background: 'rgba(212,160,23,0.08)',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid rgba(212,160,23,0.15)',
                      marginTop: 8,
                      margin: '8px 0 0',
                    }}>
                      Action: {msg.actionNeeded}
                    </p>
                  )}
                  {msg.related.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 8 }}>
                      {msg.related.map((ref: string, j: number) => (
                        <span
                          key={j}
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            color: 'var(--core, #8CA7A2)',
                            backgroundColor: 'rgba(140,167,162,0.12)',
                            padding: '2px 8px',
                            borderRadius: 9999,
                          }}
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>Inbox clear</EmptyState>
          )}
        </Card>
      </div>
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#FFF',
        border: '1px solid rgba(0,73,82,0.10)',
        borderRadius: 10,
        padding: '18px 20px',
        transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
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
      {children}
    </div>
  )
}

function CardHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase' as const,
        color: 'var(--core, #8CA7A2)',
        whiteSpace: 'nowrap' as const,
      }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 2, background: 'var(--core, #8CA7A2)', opacity: 0.25 }} />
      {count !== undefined && count > 0 && (
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--core, #8CA7A2)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}
        </span>
      )}
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 300, color: 'var(--core, #8CA7A2)' }}>{children}</p>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
