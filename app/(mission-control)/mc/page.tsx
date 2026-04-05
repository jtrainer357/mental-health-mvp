'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

/* ─── Tebra Agent Colors ─── */

const AGENT_COLORS: Record<string, string> = {
  maren: '#10B981',
  reid: '#004952',
  ava: '#FF8D6E',
  kai: '#D4A017',
  syd: '#417E86',
}

const AGENT_ROLES: Record<string, string> = {
  maren: 'User Researcher',
  reid: 'Product Strategist',
  ava: 'Product Designer',
  kai: 'Project Manager',
  syd: 'Full-Stack Engineer',
}

/* ─── CSS Keyframes ─── */

const STYLES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
@keyframes fadeInBackdrop {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes toastUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes mcPulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}
`

/* ─── Inline SVG Icons ─── */

function InboxIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}

function ActivityIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

function CheckCircleIcon({ color = 'currentColor', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}

function ZapIcon({ color = 'currentColor', size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

/* ─── Pill Badge ─── */

type PillVariant = 'coral' | 'teal' | 'urgent' | 'amber' | 'green' | 'default'

function Pill({ label, variant = 'default' }: { label: string; variant?: PillVariant }) {
  const styles: Record<PillVariant, React.CSSProperties> = {
    coral: {
      color: 'var(--vitality, #FF8D6E)',
      background: 'rgba(255,141,110,0.1)',
      border: '1px solid rgba(255,141,110,0.2)',
    },
    teal: {
      color: 'var(--growth, #004952)',
      background: 'var(--growth-08, rgba(0,73,82,0.08))',
      border: '1px solid var(--growth-20, rgba(0,73,82,0.20))',
    },
    urgent: {
      color: '#D94040',
      background: 'rgba(217,64,64,0.08)',
      border: '1px solid rgba(217,64,64,0.15)',
    },
    amber: {
      color: '#D4A017',
      background: 'rgba(212,160,23,0.08)',
      border: '1px solid rgba(212,160,23,0.15)',
    },
    green: {
      color: '#10B981',
      background: 'rgba(16,185,129,0.08)',
      border: '1px solid rgba(16,185,129,0.15)',
    },
    default: {
      color: 'var(--core, #8CA7A2)',
      background: 'var(--growth-04, rgba(0,73,82,0.04))',
      border: '1px solid var(--growth-08, rgba(0,73,82,0.08))',
    },
  }

  return (
    <span
      style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '11px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        borderRadius: '100px',
        padding: '3px 12px',
        display: 'inline-block',
        fontWeight: 500,
        lineHeight: '1.4',
        ...styles[variant],
      }}
    >
      {label}
    </span>
  )
}

/* ─── Kanban Card ─── */

function KanbanCard({
  title,
  description,
  agentSlug,
  time,
  pills = [],
  delay = 0,
  muted = false,
  showCheck = false,
  progress,
  dashed = false,
  children,
  onClick,
}: {
  title: string
  description?: string
  agentSlug?: string
  time?: string
  pills?: { label: string; variant: PillVariant }[]
  delay?: number
  muted?: boolean
  showCheck?: boolean
  progress?: { value: number; color: string }
  dashed?: boolean
  children?: React.ReactNode
  onClick?: () => void
}) {
  const agentColor = agentSlug ? AGENT_COLORS[agentSlug] || '#8CA7A2' : undefined
  const agentName = agentSlug ? agentSlug.charAt(0).toUpperCase() + agentSlug.slice(1) : undefined

  return (
    <div
      style={{
        background: dashed ? 'var(--growth-04, rgba(0,73,82,0.04))' : '#FFFFFF',
        border: dashed
          ? '1px dashed var(--growth-20, rgba(0,73,82,0.20))'
          : '1px solid rgba(0,73,82,0.10)',
        borderRadius: '10px',
        padding: '18px 20px',
        borderLeft: !dashed && agentColor ? `3px solid ${agentColor}` : undefined,
        opacity: muted ? 0.75 : 1,
        cursor: dashed || onClick ? 'pointer' : 'default',
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease',
        animation: `fadeUp 0.4s ease forwards`,
        animationDelay: `${delay}s`,
        // Start invisible for animation
        ...(delay > 0 ? { opacity: 0 } : {}),
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 16px 48px rgba(0,73,82,0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Progress bar */}
      {progress && (
        <div style={{ height: 2, borderRadius: 1, background: 'var(--growth-04, rgba(0,73,82,0.04))', marginBottom: 10 }}>
          <div style={{ height: '100%', borderRadius: 1, width: `${progress.value}%`, background: progress.color, transition: 'width 0.5s ease' }} />
        </div>
      )}

      {/* Pills row */}
      {pills.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {pills.map((p, i) => (
            <Pill key={i} label={p.label} variant={p.variant} />
          ))}
        </div>
      )}

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {showCheck && (
          <span style={{ color: '#10B981', marginTop: 1, flexShrink: 0 }}>
            <CheckCircleIcon color="#10B981" size={14} />
          </span>
        )}
        <div style={{ fontSize: 15, fontWeight: 500, color: '#2B2B2B', lineHeight: '1.4' }}>
          {title}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: 'var(--text-secondary, #5A6364)',
            lineHeight: '1.5',
            marginTop: 6,
          }}
        >
          {description}
        </div>
      )}

      {/* Children (for custom content like queued items) */}
      {children}

      {/* Footer: agent + time */}
      {(agentName || time) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginTop: 12,
          }}
        >
          {agentName && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: agentColor,
                letterSpacing: '0.04em',
                fontWeight: 500,
                flexShrink: 0,
              }}
            >
              {agentName}
            </span>
          )}
          {time && (
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                color: 'var(--care, #E0D3C8)',
                letterSpacing: '0.04em',
              }}
            >
              {time}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Column Header ─── */

function ColumnHeader({
  icon,
  label,
  count,
  accentColor,
}: {
  icon: React.ReactNode
  label: string
  count: number
  accentColor: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      {/* Full-width accent bar */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: accentColor,
          marginBottom: 14,
        }}
      />
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--core, #8CA7A2)',
            flex: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: accentColor,
            background:
              accentColor === '#FF8D6E'
                ? 'rgba(255,141,110,0.1)'
                : accentColor === '#10B981'
                  ? 'rgba(16,185,129,0.08)'
                  : 'var(--growth-08, rgba(0,73,82,0.08))',
            border: `1px solid ${
              accentColor === '#FF8D6E'
                ? 'rgba(255,141,110,0.2)'
                : accentColor === '#10B981'
                  ? 'rgba(16,185,129,0.15)'
                  : 'var(--growth-20, rgba(0,73,82,0.20))'
            }`,
            borderRadius: '100px',
            padding: '2px 10px',
            minWidth: 28,
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      </div>
    </div>
  )
}

/* ─── Toast Notification ─── */

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        background: 'var(--growth, #004952)',
        color: 'var(--white, #FFFFFF)',
        padding: '12px 24px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: '0 8px 32px rgba(0,73,82,0.24)',
        animation: 'toastUp 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
        cursor: 'pointer',
      }}
      onClick={onDone}
      onAnimationEnd={() => { setTimeout(onDone, 2800) }}
    >
      {message}
    </div>
  )
}

/* ─── Slide-Over Detail Panel ─── */

interface CardContextData {
  summary: string
  sections: { heading: string; content: string }[]
  signals: string[]
  source: string
  options?: { label: string; detail: string }[]
  question?: string
}

function SlideOverPanel({
  item,
  onClose,
  onApprove,
  onReject,
  prefetchCache,
}: {
  item: { title: string; description?: string; agentSlug?: string; type: string; priority?: string; id?: string }
  onClose: () => void
  onApprove: () => void
  onReject: (feedback: string) => void
  prefetchCache: React.MutableRefObject<Record<string, { context: CardContextData | null; loading: boolean }>>
}) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [decisionText, setDecisionText] = useState('')
  const [context, setContext] = useState<CardContextData | null>(null)
  const [loadingContext, setLoadingContext] = useState(true)
  const [loadingOptions, setLoadingOptions] = useState(false)
  const agentColor = item.agentSlug ? AGENT_COLORS[item.agentSlug] || '#8CA7A2' : '#8CA7A2'
  const agentName = item.agentSlug ? item.agentSlug.charAt(0).toUpperCase() + item.agentSlug.slice(1) : 'Unknown'

  // Check prefetch cache first, fall back to fetching
  useEffect(() => {
    setDecisionText('')
    const cached = prefetchCache.current[item.title]

    if (cached && !cached.loading && cached.context) {
      // Cache hit — instant
      setContext(cached.context)
      setLoadingContext(false)
      const isDecision = item.type === 'decision' || item.type === 'disagreement'
      const hasOptions = cached.context.options && cached.context.options.length > 0
      setLoadingOptions(isDecision && !hasOptions)
      // Still poll for options updates (they arrive after context)
      const optPoll = setInterval(() => {
        const latest = prefetchCache.current[item.title]
        if (latest?.context?.options && latest.context.options.length > 0) {
          setContext(latest.context)
          clearInterval(optPoll)
        }
      }, 500)
      const optTimeout = setTimeout(() => clearInterval(optPoll), 30000)
      return () => { clearInterval(optPoll); clearTimeout(optTimeout) }
    }

    if (cached && cached.loading) {
      // Cache is still loading — poll it
      setLoadingContext(true)
      setLoadingOptions(false)
      const interval = setInterval(() => {
        const entry = prefetchCache.current[item.title]
        if (entry && !entry.loading) {
          setContext(entry.context)
          setLoadingContext(false)
          if (entry.context?.question && (!entry.context?.options || entry.context.options.length === 0)) {
            setLoadingOptions(true)
            const optInterval = setInterval(() => {
              const latest = prefetchCache.current[item.title]
              if (latest?.context?.options && latest.context.options.length > 0) {
                setContext(latest.context)
                setLoadingOptions(false)
                clearInterval(optInterval)
              }
            }, 500)
            setTimeout(() => { clearInterval(optInterval); setLoadingOptions(false) }, 30000)
          }
          clearInterval(interval)
        }
      }, 200)
      const timeout = setTimeout(() => clearInterval(interval), 30000)
      return () => { clearInterval(interval); clearTimeout(timeout) }
    }

    // No cache — fetch fresh
    setLoadingContext(true)
    setLoadingOptions(false)
    setContext(null)
    fetch('/api/mc/card-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: item.title, type: item.type, agentSlug: item.agentSlug, id: item.id }),
    })
      .then(r => r.json())
      .then(data => {
        const ctx = data.context as CardContextData | null
        setContext(ctx)
        setLoadingContext(false)

        const isDecision = item.type === 'decision' || item.type === 'disagreement'
        if (ctx && isDecision && (!ctx.options || ctx.options.length === 0)) {
          setLoadingOptions(true)
          const contextText = ctx.sections.map(s => `## ${s.heading}\n${s.content}`).join('\n\n')
          const question = ctx.question || `Review and decide on: ${ctx.summary || item.title}`
          fetch('/api/mc/card-options', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, contextText }),
          })
            .then(r => r.json())
            .then(optData => {
              if (optData.options?.length >= 2) {
                setContext(prev => prev ? { ...prev, options: optData.options } : prev)
              }
              setLoadingOptions(false)
            })
            .catch(() => setLoadingOptions(false))
        }
      })
      .catch(() => setLoadingContext(false))
    return undefined
  }, [item.title, item.type, item.agentSlug, item.id, prefetchCache])

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.1)',
          zIndex: 90,
          animation: 'fadeInBackdrop 0.2s ease forwards',
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 56,
          right: 0,
          bottom: 0,
          width: 480,
          background: 'var(--white, #FFFFFF)',
          border: '1px solid rgba(0,73,82,0.10)',
          borderRadius: '16px 0 0 16px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
          boxShadow: '0 16px 64px rgba(0,73,82,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid rgba(0,73,82,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <Pill label={item.type} variant={item.type === 'decision' ? 'coral' : item.type === 'disagreement' ? 'urgent' : item.type === 'action' ? 'amber' : 'teal'} />
                {item.priority === 'urgent' && <Pill label="urgent" variant="urgent" />}
                {item.priority === 'review' && <Pill label="review" variant="amber" />}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 500, color: 'var(--synapse, #2B2B2B)', lineHeight: 1.3, margin: 0 }}>
                {item.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--core, #8CA7A2)',
                fontSize: 20,
                lineHeight: 1,
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,73,82,0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body — vault context */}
        <div style={{ flex: 1, padding: '20px 28px', overflowY: 'auto' }}>
          {/* Agent info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(0,73,82,0.03)', marginBottom: 16,
          }}>
            <div style={{ width: 3, height: 24, borderRadius: 2, background: agentColor }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--synapse)' }}>{agentName}</span>
              <span style={{ fontSize: 11, color: 'var(--core)', marginLeft: 8 }}>{AGENT_ROLES[item.agentSlug || ''] || ''}</span>
            </div>
            {context?.source && (
              <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--care, #E0D3C8)' }}>
                {context.source.split('/').pop()}
              </span>
            )}
          </div>

          {/* Loading state */}
          {loadingContext && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--core)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: agentColor,
                    animation: `mcPulse 1.4s ease-in-out ${i * 0.16}s infinite`,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>Loading context...</span>
            </div>
          )}

          {/* Context sections */}
          {!loadingContext && context && context.sections.map((section, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--core, #8CA7A2)',
                fontFamily: "'IBM Plex Mono', monospace",
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: '1px solid rgba(0,73,82,0.06)',
              }}>
                {section.heading}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 300, color: 'var(--text-secondary, #5A6364)',
                lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>
                {formatMarkdownLight(section.content)}
              </div>
            </div>
          ))}

          {/* Signal refs */}
          {!loadingContext && context?.signals && context.signals.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--core)',
                fontFamily: "'IBM Plex Mono', monospace",
                marginBottom: 8,
              }}>
                Related Signals
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {context.signals.map(sig => (
                  <a
                    key={sig}
                    href={`/mc/signals?search=${sig}`}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11, fontWeight: 500,
                      color: 'var(--growth, #004952)',
                      background: 'rgba(0,73,82,0.06)',
                      border: '1px solid rgba(0,73,82,0.12)',
                      borderRadius: 100, padding: '3px 10px',
                      textDecoration: 'none', transition: 'background 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,73,82,0.12)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,73,82,0.06)' }}
                  >
                    {sig}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* No context found */}
          {!loadingContext && !context && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--core, #8CA7A2)', fontSize: 13, fontWeight: 300 }}>
              No vault context found for this item. Try opening Agent Chat to discuss it with {agentName}.
            </div>
          )}

          {/* Feedback textarea */}
          {showFeedback && (
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--core)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'IBM Plex Mono', monospace" }}>
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What needs to change?"
                style={{
                  width: '100%',
                  minHeight: 100,
                  border: '1px solid rgba(0,73,82,0.12)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 14,
                  fontWeight: 300,
                  fontFamily: 'inherit',
                  color: 'var(--synapse)',
                  background: 'var(--white)',
                  outline: 'none',
                  resize: 'vertical',
                  marginTop: 8,
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--vitality)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,73,82,0.12)' }}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: '16px 28px 24px',
          borderTop: '1px solid rgba(0,73,82,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {!showFeedback ? (
            <>
              {/* Surface the decision question if available */}
              {context?.question && item.type !== 'action' && (
                <div style={{
                  fontSize: 13, fontWeight: 400, color: 'var(--text-secondary, #5A6364)',
                  lineHeight: 1.5, marginBottom: 8,
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(0,73,82,0.03)',
                  borderLeft: '3px solid var(--vitality, #FF8D6E)',
                }}>
                  {context.question}
                </div>
              )}
              {/* Action items — Mark Done / Discuss with Kai */}
              {item.type === 'action' ? (
                <>
                  <button
                    onClick={onApprove}
                    style={{
                      background: 'var(--growth, #004952)',
                      color: 'var(--white, #FFFFFF)',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '10px 24px',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'opacity 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                  >
                    Mark Done
                  </button>
                </>
              ) : context?.options && context.options.length > 0 ? (
                <>
                  <div style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--core, #8CA7A2)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    marginBottom: 2,
                  }}>
                    Choose
                  </div>
                  {context.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => onApprove()}
                      style={{
                        background: i === 0 ? 'var(--growth, #004952)' : 'var(--white, #FFFFFF)',
                        color: i === 0 ? 'var(--white, #FFFFFF)' : 'var(--growth, #004952)',
                        border: i === 0 ? 'none' : '1px solid rgba(0,73,82,0.2)',
                        borderRadius: 9999,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'opacity 150ms',
                        textAlign: 'left',
                        lineHeight: 1.4,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                    >
                      <span style={{ fontWeight: 600 }}>{opt.label}:</span>{' '}
                      <span style={{ fontWeight: 300 }}>{opt.detail}</span>
                    </button>
                  ))}
                </>
              ) : loadingOptions ? (
                /* Options are being generated */
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', justifyContent: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--growth, #004952)',
                      animation: `mcPulse 1.4s ease-in-out ${i * 0.16}s infinite`,
                    }} />
                  ))}
                  <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--core, #8CA7A2)' }}>
                    Generating options...
                  </span>
                </div>
              ) : context?.question || item.type === 'decision' || item.type === 'disagreement' ? (
                /* Decision/disagreement — options failed to generate, fall back to text input */
                <>
                  <div style={{
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--core, #8CA7A2)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    marginBottom: 4,
                  }}>
                    Your decision
                  </div>
                  <textarea
                    value={decisionText}
                    onChange={(e) => setDecisionText(e.target.value)}
                    placeholder="State your decision here..."
                    style={{
                      width: '100%',
                      minHeight: 64,
                      border: '1px solid rgba(0,73,82,0.12)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: 14,
                      fontWeight: 300,
                      fontFamily: 'inherit',
                      color: 'var(--synapse)',
                      background: 'var(--white)',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'border-color 150ms',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--growth, #004952)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,73,82,0.12)' }}
                  />
                  <button
                    onClick={onApprove}
                    disabled={!decisionText.trim()}
                    style={{
                      background: decisionText.trim() ? 'var(--growth, #004952)' : 'rgba(0,73,82,0.15)',
                      color: decisionText.trim() ? 'var(--white, #FFFFFF)' : 'var(--core, #8CA7A2)',
                      border: 'none',
                      borderRadius: 9999,
                      padding: '10px 24px',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: decisionText.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={(e) => { if (decisionText.trim()) e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                  >
                    Record Decision
                  </button>
                </>
              ) : (
                /* Non-decision items — simple approve */
                <button
                  onClick={onApprove}
                  style={{
                    background: 'var(--growth, #004952)',
                    color: 'var(--white, #FFFFFF)',
                    border: 'none',
                    borderRadius: 9999,
                    padding: '10px 24px',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'opacity 150ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => setShowFeedback(true)}
                style={{
                  background: 'rgba(255,141,110,0.1)',
                  color: 'var(--vitality, #FF8D6E)',
                  border: '1px solid rgba(255,141,110,0.2)',
                  borderRadius: 9999,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,141,110,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,141,110,0.1)' }}
              >
                Need More Info
              </button>
              <a
                href={`/mc/chat?agent=${item.agentSlug || ''}`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'transparent',
                  color: 'var(--growth, #004952)',
                  border: '1px solid rgba(0,73,82,0.2)',
                  borderRadius: 9999,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,73,82,0.04)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Discuss with {agentName}
              </a>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #5A6364)',
                  fontSize: 14,
                  fontWeight: 400,
                  cursor: 'pointer',
                  padding: '8px 0',
                }}
              >
                Dismiss
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onReject(feedback); setShowFeedback(false); setFeedback('') }}
                disabled={!feedback.trim()}
                style={{
                  background: feedback.trim() ? 'rgba(255,141,110,0.1)' : 'rgba(0,73,82,0.04)',
                  color: feedback.trim() ? 'var(--vitality, #FF8D6E)' : 'var(--core)',
                  border: `1px solid ${feedback.trim() ? 'rgba(255,141,110,0.2)' : 'rgba(0,73,82,0.08)'}`,
                  borderRadius: 9999,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: feedback.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms',
                }}
              >
                Send Feedback
              </button>
              <button
                onClick={() => { setShowFeedback(false); setFeedback('') }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #5A6364)',
                  fontSize: 14,
                  fontWeight: 400,
                  cursor: 'pointer',
                  padding: '8px 0',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ─── Light markdown formatter ─── */

function formatMarkdownLight(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // strip bold markers for now (rendered as plain text in pre-wrap)
    .replace(/\[\[(.+?)\]\]/g, '$1') // strip wikilinks
    .replace(/^#+\s+/gm, '') // strip heading markers
    .trim()
}

/* ─── Time helpers ─── */

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.floor(diffHr / 24)
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */

export default function DashboardPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState<{
    title: string; description?: string; agentSlug?: string; type: string; priority?: string; id?: string
  } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [goalInput, setGoalInput] = useState('')
  const [showAllItems, setShowAllItems] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; relativePath: string; textContent?: string | null }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set())

  // Pre-fetch cache: context + options for all decision cards, keyed by title
  const prefetchCache = useRef<Record<string, { context: CardContextData | null; loading: boolean }>>({})

  const handleApprove = useCallback(async () => {
    if (!selectedCard) return
    const cardKey = selectedCard.title
    try {
      if (selectedCard.type === 'action') {
        const actId = selectedCard.id || selectedCard.title.match(/ACT-\d+/)?.[0]
        if (actId) {
          await fetch(`/api/mc/actions/${encodeURIComponent(actId)}/done`, { method: 'POST' })
          setToast(`${actId} marked done`)
        }
      } else {
        await fetch(`/api/mc/decisions/${encodeURIComponent(selectedCard.id || selectedCard.title)}/approve`, { method: 'POST' })
        setToast('Decided — removed from queue')
      }
      setDismissedCards(prev => new Set(prev).add(cardKey))
      setSelectedCard(null)
      queryClient.invalidateQueries({ queryKey: ['mc-agents'] })
      queryClient.invalidateQueries({ queryKey: ['mc-bootstrap'] })
      queryClient.invalidateQueries({ queryKey: ['mc-disagreements'] })
      queryClient.invalidateQueries({ queryKey: ['mc-actions'] })
      queryClient.invalidateQueries({ queryKey: ['mc-health'] })
    } catch {
      setToast('Failed')
    }
  }, [selectedCard, queryClient])

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await fetch('/api/mc/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (data.success) {
          setAttachedFiles(prev => [...prev, {
            name: data.filename,
            relativePath: data.relativePath,
            textContent: data.textContent,
          }])
          setToast(`Attached: ${file.name}`)
        }
      } catch {
        setToast(`Failed to upload ${file.name}`)
      }
    }
  }, [])

  const handleReject = useCallback(async (feedback: string) => {
    if (!selectedCard) return
    const cardKey = selectedCard.title
    try {
      await fetch(`/api/mc/decisions/${encodeURIComponent(selectedCard.id || selectedCard.title)}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      setToast('Feedback sent — removed from queue')
      setDismissedCards(prev => new Set(prev).add(cardKey))
      setSelectedCard(null)
      queryClient.invalidateQueries({ queryKey: ['mc-agents'] })
      queryClient.invalidateQueries({ queryKey: ['mc-bootstrap'] })
      queryClient.invalidateQueries({ queryKey: ['mc-disagreements'] })
    } catch {
      setToast('Failed to send feedback')
    }
  }, [selectedCard, queryClient])

  const { data: agentsData } = useQuery({
    queryKey: ['mc-agents'],
    queryFn: () => fetch('/api/mc/agents').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: bootstrapData } = useQuery({
    queryKey: ['mc-bootstrap'],
    queryFn: () => fetch('/api/mc/bootstrap').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: healthData } = useQuery({
    queryKey: ['mc-health'],
    queryFn: () => fetch('/api/mc/health').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: workflowsData } = useQuery({
    queryKey: ['mc-workflow-board-summary'],
    queryFn: () => fetch('/api/mc/workflows').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: harnessData } = useQuery({
    queryKey: ['mc-harness-summary'],
    queryFn: () => fetch('/api/mc/harness').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: disagreementsData } = useQuery({
    queryKey: ['mc-disagreements'],
    queryFn: () => fetch('/api/mc/disagreements').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: decisionsData } = useQuery({
    queryKey: ['mc-decisions'],
    queryFn: () => fetch('/api/mc/decisions').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const { data: actionsData } = useQuery({
    queryKey: ['mc-actions'],
    queryFn: () => fetch('/api/mc/actions').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const agents = agentsData?.agents || []
  const bootstrap = bootstrapData?.bootstrap
  const health = healthData?.health
  const disagreements = (disagreementsData?.disagreements || []).filter((d: any) => d.status === 'active')
  const allDecisions = decisionsData?.decisions || []
  const allActions = actionsData?.actions || []

  /* ── Derive column data ── */

  // YOUR TURN: decisions needing review + agents with inbox items
  const yourTurnItems: {
    title: string
    description?: string
    agentSlug?: string
    type: string
    priority?: string
    id?: string
  }[] = []

  // Add all decisions with needs-review or proposed status
  const reviewStatuses = ['needs-review', 'proposed', 'needs_review']
  const seenTitles = new Set<string>()

  allDecisions
    .filter((d: any) => reviewStatuses.includes(d.status))
    .forEach((d: any) => {
      const title = d.title ? `${d.id}: ${d.title}` : d.id
      if (!seenTitles.has(title)) {
        seenTitles.add(title)
        yourTurnItems.push({
          title,
          type: 'decision',
          priority: 'review',
          agentSlug: 'reid',
          id: d.id,
        })
      }
    })

  // Also add bootstrap open decisions that weren't already caught
  if (bootstrap?.openDecisions) {
    bootstrap.openDecisions.forEach((d: string) => {
      if (!seenTitles.has(d)) {
        seenTitles.add(d)
        yourTurnItems.push({
          title: d,
          type: 'decision',
          priority: 'review',
          agentSlug: 'reid',
        })
      }
    })
  }

  // Jay's open action items from Kai's tracker — prioritized
  const jayStatuses = ['pending', 'in-progress', 'open', 'urgent']
  const jayActions = allActions
    .filter((a: any) => /jay/i.test(a.owner) && jayStatuses.includes(a.status))
    .sort((a: any, b: any) => {
      // Urgent first, then by ACT number (higher = newer)
      if (a.status === 'urgent' && b.status !== 'urgent') return -1
      if (b.status === 'urgent' && a.status !== 'urgent') return 1
      const aNum = parseInt(a.id.replace('ACT-', '')) || 0
      const bNum = parseInt(b.id.replace('ACT-', '')) || 0
      return bNum - aNum // newer first
    })
  jayActions.forEach((a: any) => {
    yourTurnItems.push({
      title: `${a.id}: ${a.description}`,
      description: `Due: ${a.due}`,
      type: 'action',
      priority: a.status === 'urgent' ? 'urgent' : undefined,
      agentSlug: 'kai',
      id: a.id,
    })
  })

  // Agents with inbox items
  agents.forEach((agent: any) => {
    if (agent.inboxCount > 0) {
      yourTurnItems.push({
        title: `${agent.inboxCount} item${agent.inboxCount > 1 ? 's' : ''} waiting`,
        description: agent.hotContext?.[0] || `${AGENT_ROLES[agent.slug] || agent.role} needs your input`,
        agentSlug: agent.slug,
        type: 'inbox',
        priority: agent.inboxCount > 2 ? 'urgent' : 'review',
      })
    }
  })

  // Active disagreements as your-turn items
  disagreements.forEach((d: any) => {
    yourTurnItems.push({
      title: d.title,
      description: `${d.id} — Needs resolution`,
      type: 'disagreement',
      priority: 'urgent',
      agentSlug: d.agents?.[0],
    })
  })

  // Filter out dismissed cards
  const visibleYourTurnItems = yourTurnItems.filter(item => !dismissedCards.has(item.title))

  // Pre-fetch context + options for all decision cards on board load
  useEffect(() => {
    const decisions = yourTurnItems.filter(i => i.type === 'decision' || i.type === 'disagreement')
    for (const item of decisions) {
      if (prefetchCache.current[item.title]) continue // already fetching/fetched
      prefetchCache.current[item.title] = { context: null, loading: true }

      // Fetch context
      fetch('/api/mc/card-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: item.title, type: item.type, agentSlug: item.agentSlug }),
      })
        .then(r => r.json())
        .then(data => {
          const ctx = data.context as CardContextData | null
          if (!ctx) {
            prefetchCache.current[item.title] = { context: null, loading: false }
            return
          }
          prefetchCache.current[item.title] = { context: ctx, loading: false }

          // Generate options if needed (for decisions, derive question from summary if not explicit)
          if (!ctx.options || ctx.options.length === 0) {
            const contextText = ctx.sections.map(s => `## ${s.heading}\n${s.content}`).join('\n\n')
            const question = ctx.question || `Review and decide on: ${ctx.summary || item.title}`
            fetch('/api/mc/card-options', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ question, contextText }),
            })
              .then(r => r.json())
              .then(optData => {
                if (optData.options?.length >= 2) {
                  prefetchCache.current[item.title] = {
                    context: { ...ctx, options: optData.options },
                    loading: false,
                  }
                }
              })
              .catch(() => {})
          }
        })
        .catch(() => {
          prefetchCache.current[item.title] = { context: null, loading: false }
        })
    }
  }, [yourTurnItems.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // AGENTS WORKING: agents with recent sessionWork / hotContext
  const agentsWorking = agents.filter((a: any) => a.hotContext?.length > 0)

  // COMPLETED TODAY: derive from bootstrap hotItems or health
  const completedItems = bootstrap?.hotItems?.slice(0, 4) || []

  // Burndown stats — things that need attention, driving toward zero
  const workflowCounts = workflowsData?.board?.counts || { planned: 0, executing: 0, awaiting_external: 0, blocked: 0, done: 0 }
  const activeWorkflows = workflowCounts.executing + workflowCounts.awaiting_external + workflowCounts.blocked
  const blockedWorkflows = workflowCounts.blocked + workflowCounts.awaiting_external
  const harness = harnessData?.harness
  const harnessStatus: 'passing' | 'warning' | 'failing' | 'stale' = harness?.status || 'stale'
  const harnessStatusColor = harnessStatus === 'passing' ? '#10B981' : harnessStatus === 'warning' ? '#D4A017' : harnessStatus === 'failing' ? '#D94040' : '#8CA7A2'
  const harnessDays = harness?.daysSinceLastRun ?? -1

  const emergingSignals = health?.signalCount?.emerging || 0
  const reviewDecisions = allDecisions.filter((d: any) =>
    ['needs-review', 'proposed', 'needs_review'].includes(d.status)
  ).length
  const openActions = health?.actionCount || 0
  const staleSignals = health?.staleSignalCount || 0

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: '-0.02em',
                color: 'var(--synapse, #2B2B2B)',
                lineHeight: 1.2,
              }}
            >
              Team Board
            </h2>
            <p
              style={{
                fontSize: 14,
                color: 'var(--core, #8CA7A2)',
                marginTop: 4,
                fontWeight: 300,
              }}
            >
              {today}
            </p>
          </div>

          {/* Meta stats */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              color: 'var(--core, #8CA7A2)',
              letterSpacing: '0.04em',
              alignItems: 'center',
            }}
          >
            {emergingSignals > 0 && (
              <span>
                <span style={{ fontWeight: 600, color: 'var(--growth, #004952)' }}>{emergingSignals}</span>{' '}
                to validate
              </span>
            )}
            {emergingSignals > 0 && reviewDecisions > 0 && <span style={{ color: 'var(--care, #E0D3C8)' }}>·</span>}
            {reviewDecisions > 0 && (
              <span>
                <span style={{ fontWeight: 600, color: 'var(--growth, #004952)' }}>{reviewDecisions}</span>{' '}
                to decide
              </span>
            )}
            {(emergingSignals > 0 || reviewDecisions > 0) && openActions > 0 && <span style={{ color: 'var(--care, #E0D3C8)' }}>·</span>}
            {openActions > 0 && (
              <span>
                <span style={{ fontWeight: 600, color: 'var(--growth, #004952)' }}>{openActions}</span>{' '}
                actions
              </span>
            )}
            {staleSignals > 0 && (
              <>
                <span style={{ color: 'var(--care, #E0D3C8)' }}>·</span>
                <span>
                  <span style={{ fontWeight: 600, color: '#D94040' }}>{staleSignals}</span>{' '}
                  stale
                </span>
              </>
            )}
            {activeWorkflows > 0 && (
              <>
                <span style={{ color: 'var(--care, #E0D3C8)' }}>·</span>
                <a href="/mc/workflows" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <span>
                    <span style={{ fontWeight: 600, color: 'var(--growth, #004952)' }}>{activeWorkflows}</span>{' '}
                    workflows{blockedWorkflows > 0 ? ` (${blockedWorkflows} waiting)` : ''}
                  </span>
                </a>
              </>
            )}
            <span style={{ color: 'var(--care, #E0D3C8)' }}>·</span>
            <a href="/mc/system-health" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: harnessStatusColor, display: 'inline-block' }} />
              <span>
                harness:{' '}
                <span style={{ fontWeight: 600, color: harnessStatusColor }}>{harnessStatus}</span>
                {harnessDays >= 0 && <span style={{ color: 'var(--core, #8CA7A2)', marginLeft: 4 }}>({harnessDays}d)</span>}
              </span>
            </a>
            {emergingSignals === 0 && reviewDecisions === 0 && openActions === 0 && staleSignals === 0 && activeWorkflows === 0 && (
              <span style={{ color: 'var(--core)' }}>All clear</span>
            )}
            <span style={{ color: 'var(--care, #E0D3C8)', marginLeft: 8 }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--core, #8CA7A2)' }}>Night shift 2am</span>
            <span style={{ fontSize: 11, color: 'var(--core, #8CA7A2)' }}>Brief 7am</span>
          </div>
        </div>

        {/* ── Goal Input Bar ── */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,73,82,0.10)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            height: 56,
            transition: 'box-shadow 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,141,110,0.15)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span style={{ color: 'var(--core, #8CA7A2)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <ZapIcon color="var(--core, #8CA7A2)" />
          </span>
          <input
            type="text"
            placeholder="What do you need to get done?"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && goalInput.trim()) {
                const fileContext = attachedFiles.map(f => f.textContent ? `[File: ${f.name}]\n${f.textContent}` : `[File: ${f.name}]`).join('\n\n')
                const fullGoal = fileContext ? `${goalInput.trim()}\n\n--- Attached files ---\n${fileContext}` : goalInput.trim()
                router.push(`/mc/goals?goal=${encodeURIComponent(fullGoal)}`)
                setAttachedFiles([])
              }
            }}
            onPaste={(e) => {
              const items = e.clipboardData?.items
              if (!items) return
              const files: File[] = []
              for (const item of Array.from(items)) {
                if (item.kind === 'file') {
                  const file = item.getAsFile()
                  if (file) files.push(file)
                }
              }
              if (files.length > 0) {
                e.preventDefault()
                handleFileUpload(files)
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontWeight: 300,
              color: 'var(--synapse, #2B2B2B)',
              background: 'transparent',
              padding: '0 14px',
              fontFamily: 'inherit',
            }}
          />
          {/* Attached files chips */}
          {attachedFiles.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginRight: 8 }}>
              {attachedFiles.map((f, i) => (
                <span key={i} style={{
                  fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                  background: 'rgba(0,73,82,0.06)', color: 'var(--growth)',
                  padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {f.name.slice(0, 20)}{f.name.length > 20 ? '…' : ''}
                  <button onClick={() => setAttachedFiles(prev => prev.filter((_, j) => j !== i))} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--core)',
                    fontSize: 14, lineHeight: 1, padding: 0,
                  }}>&times;</button>
                </span>
              ))}
            </div>
          )}
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--core, #8CA7A2)', display: 'flex', alignItems: 'center',
              padding: '4px', borderRadius: 6, transition: 'color 150ms', flexShrink: 0,
              marginRight: 8,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--growth, #004952)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--core, #8CA7A2)' }}
            title="Attach file"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); e.target.value = '' }}
          />
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {[
              { label: 'Status', href: '/mc/chat?agent=reid&prompt=Give+me+a+quick+status+update' },
              { label: 'Debrief', href: '/mc/chat?agent=maren&prompt=Run+a+debrief+on+the+latest+research' },
              { label: 'Critique', href: '/mc/chat?agent=ava&prompt=Run+a+design+critique+on+the+latest+work' },
            ].map((cmd) => (
              <a
                key={cmd.label}
                href={cmd.href}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--growth-2, #417E86)',
                  background: 'var(--growth-04, rgba(0,73,82,0.04))',
                  border: '1px solid var(--growth-08, rgba(0,73,82,0.08))',
                  borderRadius: 100,
                  padding: '5px 14px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'var(--growth-08, rgba(0,73,82,0.08))'
                  el.style.borderColor = 'var(--growth-20, rgba(0,73,82,0.20))'
                  el.style.color = 'var(--growth, #004952)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.background = 'var(--growth-04, rgba(0,73,82,0.04))'
                  el.style.borderColor = 'var(--growth-08, rgba(0,73,82,0.08))'
                  el.style.color = 'var(--growth-2, #417E86)'
                }}
              >
                {cmd.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Three-Column Kanban Grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            minHeight: 400,
          }}
        >
          {/* ─ Column 1: Your Turn ─ */}
          <div>
            <ColumnHeader
              icon={<InboxIcon color="#FF8D6E" />}
              label="Your Turn"
              count={visibleYourTurnItems.length}
              accentColor="#FF8D6E"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visibleYourTurnItems.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--core, #8CA7A2)',
                    fontSize: 13,
                    fontWeight: 300,
                  }}
                >
                  Nothing waiting — you're clear
                </div>
              )}
              {(showAllItems ? visibleYourTurnItems : visibleYourTurnItems.slice(0, 8)).map((item, i) => (
                <KanbanCard
                  key={i}
                  title={item.title}
                  description={item.description}
                  agentSlug={item.agentSlug}
                  time={timeAgo(bootstrap?.lastUpdated)}
                  delay={0.06 * Math.min(i + 1, 8)}
                  onClick={() => setSelectedCard(item)}
                  pills={[
                    { label: item.type, variant: item.type === 'decision' ? 'coral' : item.type === 'disagreement' ? 'urgent' : item.type === 'action' ? 'amber' : 'teal' },
                    ...(item.priority === 'urgent'
                      ? [{ label: 'urgent' as const, variant: 'urgent' as PillVariant }]
                      : item.priority === 'review'
                        ? [{ label: 'review' as const, variant: 'amber' as PillVariant }]
                        : []),
                  ]}
                />
              ))}
              {!showAllItems && visibleYourTurnItems.length > 8 && (
                <button
                  onClick={() => setShowAllItems(true)}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12, fontWeight: 500,
                    color: 'var(--growth, #004952)',
                    background: 'rgba(0,73,82,0.04)',
                    border: '1px solid rgba(0,73,82,0.10)',
                    borderRadius: 8, padding: '10px 16px',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all 180ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,73,82,0.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,73,82,0.04)' }}
                >
                  Show all {visibleYourTurnItems.length} items
                </button>
              )}
            </div>
          </div>

          {/* ─ Column 2: Agents Working ─ */}
          <div>
            <ColumnHeader
              icon={<ActivityIcon color="var(--growth, #004952)" />}
              label="Agents Working"
              count={agentsWorking.length}
              accentColor="var(--growth, #004952)"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agentsWorking.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 20px',
                    color: 'var(--core, #8CA7A2)',
                    fontSize: 13,
                    fontWeight: 300,
                  }}
                >
                  <div style={{ marginBottom: 12 }}>All agents idle</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
                    {agents.slice(0, 5).map((a: any) => (
                      <div key={a.slug} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace" }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: AGENT_COLORS[a.slug] || '#8CA7A2' }} />
                        <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{a.name || a.slug}</span>
                        <span style={{ color: 'var(--care, #E0D3C8)' }}>{timeAgo(a.lastUpdated)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {agentsWorking.map((agent: any, i: number) => {
                const color = AGENT_COLORS[agent.slug] || '#8CA7A2'
                return (
                  <KanbanCard
                    key={agent.slug}
                    title={agent.hotContext?.[0] || `${agent.name} working`}
                    description={agent.hotContext?.[1]}
                    agentSlug={agent.slug}
                    time={agent.lastUpdated}
                    delay={0.12 * (i + 1)}
                    pills={[
                      { label: AGENT_ROLES[agent.slug] || agent.role, variant: 'teal' },
                    ]}
                    progress={{ value: 65, color }}
                  />
                )
              })}

              {/* Queued / flight plan card */}
              {bootstrap?.hotItems && bootstrap.hotItems.length > 0 && (
                <KanbanCard
                  title="Up Next"
                  dashed
                  delay={0.12 * (agentsWorking.length + 1)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                    {bootstrap.hotItems.slice(0, 3).map((item: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 13,
                          fontWeight: 300,
                          color: 'var(--text-secondary, #5A6364)',
                        }}
                      >
                        <span style={{ color: 'var(--core, #8CA7A2)', display: 'flex', alignItems: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </KanbanCard>
              )}
            </div>
          </div>

          {/* ─ Column 3: Completed Today ─ */}
          <div>
            <ColumnHeader
              icon={<CheckCircleIcon color="#10B981" />}
              label="Completed Today"
              count={completedItems.length}
              accentColor="#10B981"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {completedItems.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--core, #8CA7A2)',
                    fontSize: 13,
                    fontWeight: 300,
                  }}
                >
                  Nothing completed yet today
                </div>
              )}
              {completedItems.map((item: string, i: number) => (
                <KanbanCard
                  key={i}
                  title={item}
                  delay={0.18 * (i + 1)}
                  muted
                  showCheck
                  time="today"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats bar removed — stats consolidated into top-right header */}
      </div>

      {/* ── Slide-Over Panel ── */}
      {selectedCard && (
        <SlideOverPanel
          item={selectedCard}
          onClose={() => setSelectedCard(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          prefetchCache={prefetchCache}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  )
}

