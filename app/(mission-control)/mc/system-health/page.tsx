'use client'

import { useQuery } from '@tanstack/react-query'

interface HarnessCheck {
  id: string
  description: string
  passing: boolean
}

interface HarnessRunLogEntry {
  date: string
  by: string
  passed: number
  failed: number
  notes: string
}

interface HarnessStatus {
  lastRun: string
  lastRunBy: string
  status: 'passing' | 'warning' | 'failing' | 'stale'
  checks: HarnessCheck[]
  runLog: HarnessRunLogEntry[]
  isStale: boolean
  daysSinceLastRun: number
}

interface EventLogEntry {
  timestamp: string
  source: string
  type: string
  artifact: string
  result: string
}

const STATUS_COLORS: Record<HarnessStatus['status'], { color: string; bg: string; label: string }> = {
  passing: { color: '#10B981', bg: 'rgba(16,185,129,0.10)', label: 'Passing' },
  warning: { color: '#D4A017', bg: 'rgba(212,160,23,0.10)', label: 'Warning' },
  failing: { color: '#D94040', bg: 'rgba(217,64,64,0.10)', label: 'Failing' },
  stale: { color: '#8CA7A2', bg: 'rgba(140,167,162,0.12)', label: 'Stale' },
}

export default function SystemHealthPage() {
  const { data } = useQuery({
    queryKey: ['mc-harness'],
    queryFn: () => fetch('/api/mc/harness').then(r => r.json()),
    refetchInterval: 30_000,
  })
  const { data: eventsData } = useQuery({
    queryKey: ['mc-events-harness'],
    queryFn: () => fetch('/api/mc/events?type=harness_check&limit=20').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const harness: HarnessStatus | undefined = data?.harness
  const harnessEvents: EventLogEntry[] = eventsData?.events || []
  const statusMeta = harness ? STATUS_COLORS[harness.status] : STATUS_COLORS.stale
  const passingCount = harness?.checks.filter(c => c.passing).length || 0
  const totalCount = harness?.checks.length || 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--synapse, #2B2B2B)',
            margin: 0,
          }}>
            System Health
          </h1>
          <p style={{
            fontSize: 14,
            fontWeight: 300,
            color: 'var(--text-secondary, #5A6364)',
            marginTop: 6,
            lineHeight: 1.55,
          }}>
            Level-2 harness regression checks. Run <code style={{ fontSize: 12, background: 'rgba(0,73,82,0.08)', padding: '2px 6px', borderRadius: 4 }}>/verify-harness</code> after any change to CLAUDE.md, orchestrator.md, or skills.
          </p>
        </div>

        {/* Status card */}
        <div style={{
          background: '#FFF',
          border: '1px solid rgba(0,73,82,0.10)',
          borderLeft: `4px solid ${statusMeta.color}`,
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--core, #8CA7A2)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase' as const,
                marginBottom: 6,
              }}>
                Current Status
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 400,
                color: statusMeta.color,
                marginBottom: 4,
              }}>
                {statusMeta.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary, #5A6364)' }}>
                {passingCount}/{totalCount} checks passing
                {harness && harness.lastRun !== 'Never' && (
                  <> · last run <strong>{harness.lastRun}</strong>
                    {harness.daysSinceLastRun >= 0 && ` (${harness.daysSinceLastRun}d ago)`}
                    {harness.lastRunBy && ` by ${harness.lastRunBy}`}
                  </>
                )}
              </div>
            </div>
            <div style={{
              padding: '8px 16px',
              background: statusMeta.bg,
              color: statusMeta.color,
              borderRadius: 9999,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}>
              {statusMeta.label}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{
          background: '#FFF',
          border: '1px solid rgba(0,73,82,0.10)',
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(0,73,82,0.08)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--synapse, #2B2B2B)',
          }}>
            Checks
          </div>
          {harness?.checks.map((check, i) => (
            <div
              key={check.id}
              style={{
                padding: '14px 24px',
                borderBottom: i < (harness.checks.length - 1) ? '1px solid rgba(0,73,82,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: check.passing ? 'rgba(16,185,129,0.15)' : 'rgba(140,167,162,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {check.passing && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--core, #8CA7A2)',
                width: 56,
                flexShrink: 0,
              }}>
                {check.id}
              </span>
              <span style={{
                fontSize: 13,
                color: check.passing ? 'var(--synapse, #2B2B2B)' : 'var(--text-secondary, #5A6364)',
                lineHeight: 1.5,
              }}>
                {check.description}
              </span>
            </div>
          ))}
          {(!harness || harness.checks.length === 0) && (
            <div style={{ padding: '40px 24px', textAlign: 'center' as const, color: 'var(--core, #8CA7A2)', fontSize: 13 }}>
              No checks found. Run /verify-harness to initialize.
            </div>
          )}
        </div>

        {/* Run log */}
        {harness && harness.runLog.length > 0 && (
          <div style={{
            background: '#FFF',
            border: '1px solid rgba(0,73,82,0.10)',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 24,
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(0,73,82,0.08)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--synapse, #2B2B2B)',
            }}>
              Recent Runs
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(0,73,82,0.04)' }}>
                  <th style={{ padding: '10px 24px', textAlign: 'left' as const, fontWeight: 600, color: 'var(--core, #8CA7A2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Date</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left' as const, fontWeight: 600, color: 'var(--core, #8CA7A2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>By</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' as const, fontWeight: 600, color: 'var(--core, #8CA7A2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Pass</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right' as const, fontWeight: 600, color: 'var(--core, #8CA7A2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Fail</th>
                  <th style={{ padding: '10px 24px', textAlign: 'left' as const, fontWeight: 600, color: 'var(--core, #8CA7A2)', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {harness.runLog.slice().reverse().map((entry, i) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(0,73,82,0.05)' }}>
                    <td style={{ padding: '10px 24px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--synapse, #2B2B2B)' }}>{entry.date}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, color: 'var(--text-secondary, #5A6364)' }}>{entry.by}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, color: '#10B981', textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' as const }}>{entry.passed}</td>
                    <td style={{ padding: '10px 8px', fontSize: 12, color: entry.failed > 0 ? '#D94040' : 'var(--core, #8CA7A2)', textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' as const }}>{entry.failed}</td>
                    <td style={{ padding: '10px 24px', fontSize: 12, color: 'var(--text-secondary, #5A6364)' }}>{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent harness events */}
        {harnessEvents.length > 0 && (
          <div style={{
            background: '#FFF',
            border: '1px solid rgba(0,73,82,0.10)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(0,73,82,0.08)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--synapse, #2B2B2B)',
            }}>
              Harness Events
            </div>
            {harnessEvents.slice(0, 10).map((e, i) => (
              <div key={i} style={{
                padding: '12px 24px',
                borderTop: i > 0 ? '1px solid rgba(0,73,82,0.05)' : 'none',
                display: 'flex',
                gap: 16,
                fontSize: 12,
              }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--core, #8CA7A2)', width: 140, flexShrink: 0 }}>
                  {e.timestamp.slice(0, 16).replace('T', ' ')}
                </span>
                <span style={{ color: 'var(--text-secondary, #5A6364)', flex: 1 }}>{e.result}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
