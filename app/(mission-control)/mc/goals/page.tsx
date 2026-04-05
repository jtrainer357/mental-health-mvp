'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/* ------------------------------------------------------------------ */
/*  Agent metadata                                                     */
/* ------------------------------------------------------------------ */

const AGENT_META: Record<string, { name: string; color: string; initial: string }> = {
  maren: { name: 'Maren',  color: 'var(--agent-maren, #10B981)', initial: 'M' },
  reid:  { name: 'Reid',   color: 'var(--agent-reid, #004952)',  initial: 'R' },
  ava:   { name: 'Ava',    color: 'var(--agent-ava, #FF8D6E)',   initial: 'A' },
  kai:   { name: 'Kai',    color: 'var(--agent-kai, #D4A017)',   initial: 'K' },
  syd:   { name: 'Syd',    color: 'var(--agent-syd, #417E86)',   initial: 'S' },
}

const AGENT_ROLES: Record<string, string> = {
  maren: 'Researcher',
  reid: 'Strategist',
  ava: 'Designer',
  kai: 'PM',
  syd: 'Engineer',
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FlightPlanStep {
  order: number
  agent: string
  task: string
  dependsOn: number | null
}

interface FlightPlan {
  id: string
  goal: string
  summary: string
  steps: FlightPlanStep[]
  estimatedMinutes: number
  parallel: boolean
  status: string
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GoalsPage() {
  const router = useRouter()
  const [goal, setGoal] = useState('')
  const [plan, setPlan] = useState<FlightPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) return
    setLoading(true)
    setError(null)
    setPlan(null)

    try {
      const res = await fetch('/api/mc/execute/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Generation failed')
      setPlan(data.plan)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [goal])

  const handleApprove = useCallback(async () => {
    if (!plan) return
    setExecuting(true)
    setError(null)

    try {
      const res = await fetch('/api/mc/execute/goal/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Execution failed')
      showToast(`Flight plan queued: ${plan.steps.length} agent tasks created`)
      setTimeout(() => router.push('/mc'), 2000)
    } catch (e: any) {
      setError(e.message || 'Execution failed')
      showToast(`Error: ${e.message || 'Execution failed'}`)
    } finally {
      setExecuting(false)
    }
  }, [plan, showToast, router])

  const handleEdit = useCallback(() => {
    setPlan(null)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Page Header */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--synapse, #2B2B2B)',
          margin: '0 0 8px 0',
        }}>
          Goals
        </h1>
        <p style={{
          fontSize: 14,
          fontWeight: 300,
          color: 'var(--text-secondary, #5A6364)',
          lineHeight: 1.55,
          margin: '0 0 32px 0',
        }}>
          Describe what you want to accomplish. Mission Control will generate a flight plan.
        </p>

        {/* Goal Input */}
        {!plan && (
          <div style={{ marginBottom: 24 }}>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Synthesize last week's interview notes and update the signal registry..."
              rows={3}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 18px',
                fontSize: 15,
                fontWeight: 300,
                lineHeight: 1.6,
                color: 'var(--synapse, #2B2B2B)',
                background: loading ? '#FAFAF7' : '#FFF',
                border: '1px solid rgba(0,73,82,0.12)',
                borderRadius: 10,
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : undefined,
              }}
              onFocus={(e) => {
                if (!loading) e.currentTarget.style.borderColor = 'var(--growth, #004952)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,73,82,0.12)'
              }}
            />

            {/* Loading state */}
            {loading && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 0 4px',
                animation: 'mc-toast-in 0.3s cubic-bezier(0.22,1,0.36,1)',
              }}>
                <div style={{
                  display: 'flex',
                  gap: 5,
                  alignItems: 'center',
                }}>
                  {[0, 1, 2].map(dot => (
                    <span
                      key={dot}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--growth, #004952)',
                        display: 'inline-block',
                        animation: `mc-goal-pulse 1.4s ease-in-out ${dot * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  color: 'var(--growth, #004952)',
                }}>
                  Generating flight plan...
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: loading ? 8 : 16 }}>
              <button
                onClick={handleGenerate}
                disabled={loading || !goal.trim()}
                style={{
                  padding: '10px 28px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#FFF',
                  background: loading || !goal.trim()
                    ? 'var(--core, #8CA7A2)'
                    : 'var(--growth, #004952)',
                  border: 'none',
                  borderRadius: 9999,
                  cursor: loading || !goal.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {loading && <Spinner />}
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            fontSize: 13,
            color: '#DC2626',
            background: 'rgba(220,38,38,0.06)',
            borderRadius: 10,
            border: '1px solid rgba(220,38,38,0.12)',
            marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        {/* Flight Plan Display */}
        {plan && (
          <div style={{ marginBottom: 32 }}>
            {/* Plan header */}
            <div style={{
              background: '#FFF',
              border: '1px solid rgba(0,73,82,0.10)',
              borderRadius: 10,
              padding: '20px 24px',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--growth, #004952)',
                  background: 'rgba(0,73,82,0.06)',
                  padding: '3px 12px',
                  borderRadius: 9999,
                }}>
                  FLIGHT PLAN
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: 'var(--core, #8CA7A2)',
                }}>
                  {plan.id}
                </span>
              </div>
              <p style={{
                fontSize: 16,
                fontWeight: 400,
                color: 'var(--synapse, #2B2B2B)',
                lineHeight: 1.5,
                margin: '8px 0 0 0',
              }}>
                {plan.summary}
              </p>
              <div style={{
                display: 'flex',
                gap: 16,
                marginTop: 12,
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: 'var(--core, #8CA7A2)',
                }}>
                  {plan.steps.length} steps
                </span>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  color: 'var(--core, #8CA7A2)',
                }}>
                  ~{plan.estimatedMinutes}min
                </span>
                {plan.parallel && (
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: 'var(--agent-maren, #10B981)',
                  }}>
                    parallelizable
                  </span>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: 15,
                top: 20,
                bottom: 20,
                width: 2,
                background: 'var(--care, #E0D3C8)',
                borderRadius: 1,
              }} />

              {plan.steps.map((step, i) => {
                const meta = AGENT_META[step.agent] || { name: step.agent, color: '#8CA7A2', initial: '?' }
                const role = AGENT_ROLES[step.agent] || 'Agent'
                return (
                  <div key={step.order} style={{ position: 'relative', marginBottom: i < plan.steps.length - 1 ? 16 : 0 }}>
                    {/* Step number circle on the line */}
                    <div style={{
                      position: 'absolute',
                      left: -28,
                      top: 18,
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#FFF',
                      border: `2px solid var(--care, #E0D3C8)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--growth, #004952)',
                      }}>
                        {step.order}
                      </span>
                    </div>

                    {/* Step card */}
                    <div style={{
                      background: '#FFF',
                      border: '1px solid rgba(0,73,82,0.10)',
                      borderRadius: 10,
                      padding: '16px 20px',
                      marginLeft: 12,
                      transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        {/* Agent avatar */}
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: meta.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#FFF',
                          }}>
                            {meta.initial}
                          </span>
                        </div>
                        <div>
                          <span style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: 'var(--synapse, #2B2B2B)',
                          }}>
                            {meta.name}
                          </span>
                          <span style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase' as const,
                            color: 'var(--core, #8CA7A2)',
                            marginLeft: 8,
                          }}>
                            {role}
                          </span>
                        </div>
                        {step.dependsOn !== null && (
                          <span style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                            fontSize: 10,
                            color: 'var(--core, #8CA7A2)',
                            background: 'rgba(140,167,162,0.12)',
                            padding: '2px 8px',
                            borderRadius: 9999,
                            marginLeft: 'auto',
                          }}>
                            after step {step.dependsOn}
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: 13,
                        fontWeight: 300,
                        color: 'var(--text-secondary, #5A6364)',
                        lineHeight: 1.6,
                        margin: 0,
                      }}>
                        {step.task}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              marginTop: 28,
            }}>
              <button
                onClick={handleEdit}
                disabled={executing}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--growth, #004952)',
                  background: 'rgba(255,141,110,0.10)',
                  border: '1px solid rgba(0,73,82,0.12)',
                  borderRadius: 9999,
                  cursor: executing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}
              >
                Edit Plan
              </button>
              <button
                onClick={handleApprove}
                disabled={executing}
                style={{
                  padding: '10px 28px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#FFF',
                  background: executing
                    ? 'var(--core, #8CA7A2)'
                    : 'var(--growth, #004952)',
                  border: 'none',
                  borderRadius: 9999,
                  cursor: executing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {executing && <Spinner />}
                {executing ? 'Executing...' : 'Approve & Execute'}
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}>
            <div style={{
              background: 'var(--growth, #004952)',
              color: '#FFF',
              borderRadius: 9999,
              padding: '10px 20px',
              boxShadow: '0 8px 32px rgba(0,73,82,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              animation: 'mc-toast-in 0.2s cubic-bezier(0.22,1,0.36,1)',
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--vitality, #FF8D6E)', flexShrink: 0 }}>
                <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {toast}
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes mc-toast-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes mc-spin {
            to { transform: rotate(360deg); }
          }
          @keyframes mc-goal-pulse {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Spinner                                                            */
/* ------------------------------------------------------------------ */

function Spinner() {
  return (
    <div style={{
      width: 14,
      height: 14,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#FFF',
      borderRadius: '50%',
      animation: 'mc-spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  )
}
