'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

// --- Agent Config ---

type AgentSlug = 'maren' | 'reid' | 'ava' | 'kai' | 'syd'

interface AgentDef {
  slug: AgentSlug
  name: string
  role: string
  color: string
}

const AGENTS: AgentDef[] = [
  { slug: 'maren', name: 'Maren', role: 'Researcher', color: '#10B981' },
  { slug: 'reid', name: 'Reid', role: 'Strategist', color: '#004952' },
  { slug: 'ava', name: 'Ava', role: 'Designer', color: '#FF8D6E' },
  { slug: 'kai', name: 'Kai', role: 'PM', color: '#D4A017' },
  { slug: 'syd', name: 'Syd', role: 'Engineer', color: '#417E86' },
]

const AGENT_PROMPTS: Record<AgentSlug, string[]> = {
  maren: [
    'What signals need validation?',
    'Summarize prototype testing results',
    "What's in the research queue?",
  ],
  reid: [
    'What are the top 3 priorities?',
    'Run a scope check',
    'What risks need attention?',
  ],
  ava: [
    'What design decisions are pending?',
    'Show wireflow progress',
    'What needs design critique?',
  ],
  kai: [
    "What's blocked?",
    'Show action items',
    'Sprint velocity check',
  ],
  syd: [
    'What build specs are ready?',
    'Architecture constraints',
    "What's the tech debt status?",
  ],
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  agent?: AgentSlug
}

// --- Main Page ---

import { Suspense } from 'react'

export default function AgentChatPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--core, #8CA7A2)' }}>Loading chat...</div>}>
      <AgentChatPage />
    </Suspense>
  )
}

function AgentChatPage() {
  const searchParams = useSearchParams()
  const defaultAgent = (searchParams.get('agent') as AgentSlug) || 'maren'
  const isValidDefault = AGENTS.some(a => a.slug === defaultAgent)

  const [activeAgent, setActiveAgent] = useState<AgentSlug>(isValidDefault ? defaultAgent : 'maren')
  const [messages, setMessages] = useState<Record<AgentSlug, ChatMsg[]>>({
    maren: [], reid: [], ava: [], kai: [], syd: [],
  })
  const [input, setInput] = useState('')
  const [chatFiles, setChatFiles] = useState<{ name: string; textContent?: string | null }[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatFileRef = useRef<HTMLInputElement>(null)

  const agent = AGENTS.find(a => a.slug === activeAgent)!
  const thread = messages[activeAgent]

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thread])

  // Focus input on agent switch
  useEffect(() => {
    inputRef.current?.focus()
  }, [activeAgent])

  const chatMutation = useMutation({
    mutationFn: async ({ message, history }: { message: string; history: ChatMsg[] }) => {
      const res = await fetch(`/api/mc/chat/${activeAgent}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: history.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error('Chat request failed')
      return res.json()
    },
    onSuccess: (data) => {
      const assistantMsg: ChatMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
        agent: activeAgent,
      }
      setMessages(prev => ({
        ...prev,
        [activeAgent]: [...prev[activeAgent], assistantMsg],
      }))
    },
  })

  const handleChatFileUpload = useCallback(async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await fetch('/api/mc/upload', { method: 'POST', body: form })
        const data = await res.json()
        if (data.success) {
          setChatFiles(prev => [...prev, { name: data.filename, textContent: data.textContent }])
        }
      } catch { /* ignore */ }
    }
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || chatMutation.isPending) return

    // Include file content in the message
    const fileContext = chatFiles.map(f => f.textContent ? `[Attached: ${f.name}]\n${f.textContent}` : `[Attached: ${f.name}]`).join('\n\n')
    const fullMessage = fileContext ? `${trimmed}\n\n--- Attached files ---\n${fileContext}` : trimmed

    const userMsg: ChatMsg = {
      role: 'user',
      content: trimmed + (chatFiles.length > 0 ? ` (${chatFiles.length} file${chatFiles.length > 1 ? 's' : ''} attached)` : ''),
      timestamp: new Date().toISOString(),
    }

    const updatedThread = [...thread, userMsg]

    setMessages(prev => ({
      ...prev,
      [activeAgent]: updatedThread,
    }))
    setInput('')
    setChatFiles([])

    chatMutation.mutate({ message: fullMessage, history: thread })
  }, [input, chatMutation, thread, activeAgent, chatFiles])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Header */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--synapse, #2B2B2B)',
          margin: '0 0 28px 0',
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          Agent Chat
        </h1>

        {/* Main Layout: Sidebar + Chat */}
        <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 180px)', minHeight: 500 }}>

          {/* Left: Agent Selector Panel */}
          <div style={{
            width: 220,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {AGENTS.map((a) => {
              const isActive = a.slug === activeAgent
              const hasMessages = messages[a.slug].length > 0
              return (
                <button
                  key={a.slug}
                  onClick={() => setActiveAgent(a.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: `1px solid ${isActive ? a.color + '30' : 'rgba(0,73,82,0.10)'}`,
                    background: isActive ? a.color + '14' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                    textAlign: 'left',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = a.color + '30'
                      e.currentTarget.style.background = a.color + '08'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(0,73,82,0.10)'
                      e.currentTarget.style.background = '#fff'
                    }
                  }}
                >
                  {/* Color bar */}
                  <div style={{
                    width: 4,
                    height: 36,
                    borderRadius: 2,
                    background: a.color,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--synapse, #2B2B2B)',
                        fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                      }}>
                        {a.name}
                      </span>
                      {/* Status dot */}
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: hasMessages ? a.color : 'var(--core, #8CA7A2)',
                        flexShrink: 0,
                      }} />
                    </div>
                    <span style={{
                      fontSize: 12,
                      color: 'var(--text-secondary, #5A6364)',
                      fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                    }}>
                      {a.role}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right: Conversation Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid rgba(0,73,82,0.10)',
            overflow: 'hidden',
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(0,73,82,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: agent.color,
              }} />
              <span style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--synapse, #2B2B2B)',
                fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
              }}>
                {agent.name}
              </span>
              <span style={{
                fontSize: 13,
                color: 'var(--text-secondary, #5A6364)',
                fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
              }}>
                {agent.role}
              </span>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 20px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {thread.length === 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  gap: 16,
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: agent.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.5,
                  }}>
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: agent.color,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 14,
                    color: 'var(--text-secondary, #5A6364)',
                    fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                    opacity: 0.5,
                  }}>
                    Start a conversation with {agent.name}
                  </span>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    justifyContent: 'center',
                    maxWidth: 420,
                    marginTop: 4,
                  }}>
                    {AGENT_PROMPTS[activeAgent].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setInput(prompt)
                          // Submit after a tick so React state settles
                          setTimeout(() => {
                            const userMsg: ChatMsg = {
                              role: 'user',
                              content: prompt,
                              timestamp: new Date().toISOString(),
                            }
                            setMessages(prev => ({
                              ...prev,
                              [activeAgent]: [...prev[activeAgent], userMsg],
                            }))
                            setInput('')
                            chatMutation.mutate({ message: prompt, history: [] })
                          }, 0)
                        }}
                        style={{
                          padding: '8px 16px',
                          fontSize: 12,
                          fontWeight: 500,
                          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
                          color: agent.color,
                          background: agent.color + '0A',
                          border: `1px solid ${agent.color}30`,
                          borderRadius: 9999,
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = agent.color + '18'
                          e.currentTarget.style.borderColor = agent.color + '50'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = agent.color + '0A'
                          e.currentTarget.style.borderColor = agent.color + '30'
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {thread.map((msg, i) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{ maxWidth: '75%' }}>
                      {/* Agent name for assistant messages */}
                      {!isUser && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 4,
                          paddingLeft: 2,
                        }}>
                          <div style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: agent.color,
                          }} />
                          <span style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: 'var(--synapse, #2B2B2B)',
                            fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                          }}>
                            {agent.name}
                          </span>
                        </div>
                      )}
                      {/* Bubble */}
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isUser ? 'var(--growth, #004952)' : '#fff',
                        color: isUser ? '#fff' : 'var(--synapse, #2B2B2B)',
                        border: isUser ? 'none' : `1px solid ${agent.color}1A`,
                        fontSize: 14,
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {msg.content}
                      </div>
                      {/* Timestamp */}
                      <div style={{
                        fontSize: 10,
                        color: 'var(--core, #8CA7A2)',
                        fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
                        marginTop: 4,
                        textAlign: isUser ? 'right' : 'left',
                        paddingLeft: isUser ? 0 : 2,
                        paddingRight: isUser ? 2 : 0,
                      }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Loading dots */}
              {chatMutation.isPending && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginBottom: 4,
                      paddingLeft: 2,
                    }}>
                      <div style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: agent.color,
                      }} />
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--synapse, #2B2B2B)',
                        fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                      }}>
                        {agent.name}
                      </span>
                    </div>
                    <div style={{
                      padding: '14px 20px',
                      borderRadius: '16px 16px 16px 4px',
                      background: '#fff',
                      border: `1px solid ${agent.color}1A`,
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(dot => (
                        <span
                          key={dot}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: agent.color,
                            display: 'inline-block',
                            animation: `mcPulse 1.4s ease-in-out ${dot * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {chatMutation.isError && (
                <div style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  fontSize: 13,
                  color: '#DC2626',
                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                }}>
                  Failed to get response. Check that ANTHROPIC_API_KEY is set.
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(0,73,82,0.08)',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
            }}>
              {/* Upload button */}
              <button
                onClick={() => chatFileRef.current?.click()}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--core, #8CA7A2)', display: 'flex', alignItems: 'center',
                  padding: '4px', borderRadius: 6, transition: 'color 150ms', flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = agent.color }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--core, #8CA7A2)' }}
                title="Attach file"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input
                ref={chatFileRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files) handleChatFileUpload(e.target.files); e.target.value = '' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* File chips */}
                {chatFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', paddingLeft: 4 }}>
                    {chatFiles.map((f, i) => (
                      <span key={i} style={{
                        fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
                        background: 'rgba(0,73,82,0.06)', color: 'var(--growth)',
                        padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {f.name.slice(0, 25)}{f.name.length > 25 ? '…' : ''}
                        <button onClick={() => setChatFiles(prev => prev.filter((_, j) => j !== i))} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--core)',
                          fontSize: 13, lineHeight: 1, padding: 0,
                        }}>&times;</button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
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
                      handleChatFileUpload(files)
                    }
                  }}
                  placeholder={`Message ${agent.name}...`}
                  disabled={chatMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(0,73,82,0.10)',
                    background: '#FAFAF7',
                    fontSize: 14,
                    fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                    color: 'var(--synapse, #2B2B2B)',
                    outline: 'none',
                    transition: 'border-color 0.3s cubic-bezier(0.22,1,0.36,1)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = agent.color + '60' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,73,82,0.10)' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || chatMutation.isPending}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  border: 'none',
                  background: input.trim() ? 'var(--growth, #004952)' : 'rgba(0,73,82,0.10)',
                  cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes mcPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
