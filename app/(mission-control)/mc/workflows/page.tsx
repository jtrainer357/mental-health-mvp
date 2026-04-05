'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type WorkflowState = 'planned' | 'executing' | 'awaiting_external' | 'blocked' | 'done'

interface WorkflowStream {
  id: string
  title: string
  state: WorkflowState
  owner: string
  lastUpdated: string
  nextStep: string
  safeResume: string
  related: string[]
  blockers: string
  due?: string
}

const AGENT_COLORS: Record<string, string> = {
  maren: '#10B981',
  reid: '#004952',
  ava: '#FF8D6E',
  kai: '#D4A017',
  syd: '#417E86',
  jay: '#2B2B2B',
  team: '#8CA7A2',
}

const STATE_META: Record<WorkflowState, { label: string; color: string; bg: string }> = {
  planned: { label: 'Planned', color: '#8CA7A2', bg: 'rgba(140,167,162,0.08)' },
  executing: { label: 'Executing', color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  awaiting_external: { label: 'Awaiting External', color: '#D4A017', bg: 'rgba(212,160,23,0.10)' },
  blocked: { label: 'Blocked', color: '#D94040', bg: 'rgba(217,64,64,0.10)' },
  done: { label: 'Done (7d)', color: '#417E86', bg: 'rgba(65,126,134,0.08)' },
}

const COLUMN_ORDER: WorkflowState[] = ['planned', 'executing', 'awaiting_external', 'blocked', 'done']

function getOwnerColor(owner: string): string {
  const slug = owner.toLowerCase().trim()
  return AGENT_COLORS[slug] || '#8CA7A2'
}

export default function WorkflowsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data } = useQuery({
    queryKey: ['mc-workflow-board'],
    queryFn: () => fetch('/api/mc/workflows').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const board = data?.board
  const streams: WorkflowStream[] = board?.streams || []
  const counts = board?.counts || { planned: 0, executing: 0, awaiting_external: 0, blocked: 0, done: 0 }
  const selected = streams.find(s => s.id === selectedId) || null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '40px 24px' }}>
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
              Workflows
            </h1>
            <p style={{
              fontSize: 14,
              fontWeight: 300,
              color: 'var(--text-secondary, #5A6364)',
              marginTop: 6,
              lineHeight: 1.55,
            }}>
              {streams.length} active {streams.length === 1 ? 'stream' : 'streams'} · {counts.executing} executing · {counts.blocked + counts.awaiting_external} waiting
            </p>
          </div>
          <FreshnessIndicator timestamp={data?.timestamp} />
        </div>

        {/* Kanban columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}>
          {COLUMN_ORDER.map(state => {
            const colStreams = streams.filter(s => s.state === state)
            const meta = STATE_META[state]
            return (
              <div
                key={state}
                style={{
                  background: meta.bg,
                  border: `1px solid ${meta.color}20`,
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 240,
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  padding: '0 4px',
                }}>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    color: meta.color,
                  }}>
                    {meta.label}
                  </span>
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    color: meta.color,
                    background: `${meta.color}15`,
                    borderRadius: 9999,
                    padding: '2px 8px',
                    minWidth: 22,
                    textAlign: 'center' as const,
                  }}>
                    {colStreams.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colStreams.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      style={{
                        all: 'unset' as const,
                        cursor: 'pointer',
                        background: '#FFF',
                        border: '1px solid rgba(0,73,82,0.08)',
                        borderLeft: `3px solid ${getOwnerColor(s.owner)}`,
                        borderRadius: 8,
                        padding: '12px 14px',
                        display: 'block',
                        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                        animation: `fadeInUp 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms forwards`,
                        opacity: 0,
                        transform: 'translateY(8px)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,73,82,0.06)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--core, #8CA7A2)',
                        letterSpacing: '0.08em',
                        marginBottom: 6,
                      }}>
                        {s.id}
                      </div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--synapse, #2B2B2B)',
                        lineHeight: 1.4,
                        marginBottom: 8,
                      }}>
                        {s.title}
                      </div>
                      {s.nextStep && (
                        <div style={{
                          fontSize: 11,
                          fontWeight: 300,
                          color: 'var(--text-secondary, #5A6364)',
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                        }}>
                          → {s.nextStep}
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px solid rgba(0,73,82,0.06)',
                      }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 500,
                          color: getOwnerColor(s.owner),
                          textTransform: 'capitalize' as const,
                        }}>
                          {s.owner}
                        </span>
                        {s.due && (
                          <span style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            color: 'var(--core, #8CA7A2)',
                          }}>
                            due {s.due}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {colStreams.length === 0 && (
                    <div style={{
                      fontSize: 11,
                      fontWeight: 300,
                      color: 'var(--core, #8CA7A2)',
                      textAlign: 'center' as const,
                      padding: '20px 8px',
                    }}>
                      —
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {streams.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '64px 0' }}>
            <p style={{ fontSize: 14, fontWeight: 300, color: 'var(--core, #8CA7A2)' }}>
              No active streams — run /shutdown or /checkpoint to seed the board
            </p>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div
            onClick={() => setSelectedId(null)}
            style={{
              position: 'fixed' as const,
              inset: 0,
              background: 'rgba(0,0,0,0.15)',
              animation: 'fadeInBackdrop 0.3s forwards',
              zIndex: 40,
            }}
          />
          <aside style={{
            position: 'fixed' as const,
            top: 0,
            right: 0,
            bottom: 0,
            width: 420,
            background: '#FFF',
            borderLeft: '1px solid rgba(0,73,82,0.10)',
            padding: '32px 28px',
            overflowY: 'auto' as const,
            animation: 'slideInRight 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
            zIndex: 50,
          }}>
            <button
              onClick={() => setSelectedId(null)}
              style={{
                all: 'unset' as const,
                cursor: 'pointer',
                fontSize: 22,
                color: 'var(--core, #8CA7A2)',
                position: 'absolute' as const,
                top: 20,
                right: 24,
              }}
            >
              ×
            </button>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--core, #8CA7A2)',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}>
              {selected.id}
            </div>
            <h2 style={{
              fontSize: 22,
              fontWeight: 400,
              color: 'var(--synapse, #2B2B2B)',
              margin: '0 0 20px 0',
              lineHeight: 1.3,
            }}>
              {selected.title}
            </h2>

            <Field label="State" value={STATE_META[selected.state].label} color={STATE_META[selected.state].color} />
            <Field label="Owner" value={selected.owner} color={getOwnerColor(selected.owner)} />
            <Field label="Last Updated" value={selected.lastUpdated} />
            {selected.due && <Field label="Due" value={selected.due} />}
            <Field label="Next Step" value={selected.nextStep} multiline />
            <Field label="Safe Resume" value={selected.safeResume} multiline />
            {selected.blockers && selected.blockers !== 'none' && (
              <Field label="Blockers" value={selected.blockers} multiline />
            )}
            {selected.related.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--core, #8CA7A2)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  marginBottom: 6,
                }}>
                  Related
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.related.map(r => (
                    <span key={r} style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      padding: '3px 10px',
                      background: 'rgba(0,73,82,0.08)',
                      color: 'var(--growth, #004952)',
                      borderRadius: 9999,
                    }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

function Field({ label, value, color, multiline }: { label: string; value: string; color?: string; multiline?: boolean }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--core, #8CA7A2)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: 400,
        color: color || 'var(--synapse, #2B2B2B)',
        lineHeight: multiline ? 1.55 : 1.3,
        whiteSpace: multiline ? 'pre-wrap' as const : 'normal' as const,
      }}>
        {value || '—'}
      </div>
    </div>
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
