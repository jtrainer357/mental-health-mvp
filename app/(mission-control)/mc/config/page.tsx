'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// --- Types ---

type ConfigTab = 'agents' | 'orchestrator' | 'pipeline' | 'skills'

interface AgentDef {
  slug: string
  name: string
  role: string
  color: string
  file: string
}

const AGENTS: AgentDef[] = [
  { slug: 'maren', name: 'Maren', role: 'Researcher', color: '#10B981', file: '_agents/researcher.md' },
  { slug: 'reid', name: 'Reid', role: 'Strategist', color: '#004952', file: '_agents/strategist.md' },
  { slug: 'ava', name: 'Ava', role: 'Designer', color: '#FF8D6E', file: '_agents/designer.md' },
  { slug: 'kai', name: 'Kai', role: 'PM', color: '#D4A017', file: '_agents/pm.md' },
  { slug: 'syd', name: 'Syd', role: 'Engineer', color: '#417E86', file: '_agents/engineer.md' },
]

// --- Simple Markdown Renderer ---

function renderMarkdown(text: string) {
  if (!text) return null

  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let listKey = 0

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} style={{ margin: '6px 0', paddingLeft: 24 }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--synapse, #2B2B2B)',
              fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
            }}>
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!

    // Headers
    if (line.startsWith('### ')) {
      flushList()
      elements.push(
        <h4 key={i} style={{
          fontSize: 14,
          fontWeight: 700,
          margin: '16px 0 4px',
          color: 'var(--synapse, #2B2B2B)',
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          {line.slice(4)}
        </h4>
      )
    } else if (line.startsWith('## ')) {
      flushList()
      elements.push(
        <h3 key={i} style={{
          fontSize: 16,
          fontWeight: 700,
          margin: '20px 0 6px',
          color: 'var(--synapse, #2B2B2B)',
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          {line.slice(3)}
        </h3>
      )
    } else if (line.startsWith('# ')) {
      flushList()
      elements.push(
        <h2 key={i} style={{
          fontSize: 18,
          fontWeight: 700,
          margin: '24px 0 8px',
          color: 'var(--synapse, #2B2B2B)',
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          {line.slice(2)}
        </h2>
      )
    } else if (line.match(/^[-*] /)) {
      // Bullet
      listItems.push(line.replace(/^[-*] /, ''))
    } else if (line.trim() === '') {
      flushList()
      // skip blank
    } else {
      flushList()
      elements.push(
        <p key={i} style={{
          fontSize: 14,
          lineHeight: 1.7,
          margin: '4px 0',
          color: 'var(--synapse, #2B2B2B)',
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          {renderInline(line)}
        </p>
      )
    }
  }
  flushList()
  return <>{elements}</>
}

function renderInline(text: string): React.ReactNode {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} style={{
          background: 'rgba(0,73,82,0.06)',
          padding: '1px 5px',
          borderRadius: 4,
          fontSize: 13,
          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
        }}>
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      return (
        <span key={i} style={{
          color: 'var(--growth, #004952)',
          fontWeight: 500,
          textDecoration: 'underline',
          textDecorationColor: 'rgba(0,73,82,0.2)',
          textUnderlineOffset: 2,
        }}>
          {part}
        </span>
      )
    }
    return part
  })
}

// --- Main Page ---

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('agents')
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({})
  const queryClient = useQueryClient()

  // Fetch agent states for name/status
  const { data: agentsData } = useQuery({
    queryKey: ['mc-agents'],
    queryFn: () => fetch('/api/mc/agents').then(r => r.json()),
    refetchInterval: 60_000,
  })

  // Fetch commands for Skills tab
  const { data: commandsData } = useQuery({
    queryKey: ['mc-commands'],
    queryFn: () => fetch('/api/mc/commands').then(r => r.json()),
    enabled: activeTab === 'skills',
  })

  // Load a vault file's content via the config read API
  const loadFileContent = async (file: string) => {
    if (fileContents[file] || loadingFiles[file]) return
    setLoadingFiles(prev => ({ ...prev, [file]: true }))
    try {
      const res = await fetch(`/api/mc/config/read?file=${encodeURIComponent(file)}`)
      if (res.ok) {
        const data = await res.json()
        setFileContents(prev => ({ ...prev, [file]: data.content || '' }))
      } else {
        setFileContents(prev => ({ ...prev, [file]: `(Could not load ${file})` }))
      }
    } catch {
      setFileContents(prev => ({ ...prev, [file]: `(Error loading ${file})` }))
    } finally {
      setLoadingFiles(prev => ({ ...prev, [file]: false }))
    }
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ file, content }: { file: string; content: string }) => {
      const res = await fetch('/api/mc/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, content }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }
      return res.json()
    },
    onSuccess: (_data, vars) => {
      setFileContents(prev => ({ ...prev, [vars.file]: vars.content }))
      setEditingFile(null)
      setEditContent('')
      queryClient.invalidateQueries({ queryKey: ['mc-agents'] })
    },
  })

  const handleEdit = (file: string) => {
    setEditingFile(file)
    setEditContent(fileContents[file] || '')
  }

  const handleSave = (file: string) => {
    saveMutation.mutate({ file, content: editContent })
  }

  const handleCancel = () => {
    setEditingFile(null)
    setEditContent('')
  }

  // Tab config
  const tabs: { key: ConfigTab; label: string }[] = [
    { key: 'agents', label: 'Agents' },
    { key: 'orchestrator', label: 'Orchestrator' },
    { key: 'pipeline', label: 'Signal Pipeline' },
    { key: 'skills', label: 'Skills' },
  ]

  const commands = commandsData?.commands || []
  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof commands> = {}
    for (const cmd of commands) {
      const cat = cmd.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(cmd)
    }
    return groups
  }, [commands])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--backbone, #F6F3EB)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Header */}
        <h1 style={{
          fontSize: 32,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--synapse, #2B2B2B)',
          margin: '0 0 8px 0',
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          System Config
        </h1>
        <p style={{
          fontSize: 14,
          fontWeight: 300,
          color: 'var(--text-secondary, #5A6364)',
          marginTop: 0,
          marginBottom: 28,
          lineHeight: 1.55,
          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
        }}>
          View and edit agent definitions, orchestration rules, and pipeline config.
        </p>

        {/* Tab Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                borderRadius: 9999,
                padding: '6px 18px',
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                background: activeTab === tab.key ? 'var(--growth, #004952)' : 'transparent',
                color: activeTab === tab.key ? '#FFF' : 'var(--text-secondary, #5A6364)',
                fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) e.currentTarget.style.color = 'var(--growth, #004952)'
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) e.currentTarget.style.color = 'var(--text-secondary, #5A6364)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* ===== AGENTS TAB ===== */}
          {activeTab === 'agents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {AGENTS.map((agent) => {
                const isExpanded = expandedAgent === agent.slug
                return (
                  <div
                    key={agent.slug}
                    style={{
                      background: '#fff',
                      borderRadius: 10,
                      border: '1px solid rgba(0,73,82,0.10)',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.3s cubic-bezier(0.22,1,0.36,1)',
                    }}
                  >
                    {/* Header row */}
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedAgent(null)
                        } else {
                          setExpandedAgent(agent.slug)
                          loadFileContent(agent.file)
                        }
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '16px 20px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {/* Color bar */}
                      <div style={{
                        width: 4,
                        height: 32,
                        borderRadius: 2,
                        background: agent.color,
                        flexShrink: 0,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: 'var(--synapse, #2B2B2B)',
                          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                        }}>
                          {agent.name}
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: 'var(--text-secondary, #5A6364)',
                          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                        }}>
                          {agent.role}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11,
                        color: 'var(--core, #8CA7A2)',
                        fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
                      }}>
                        {agent.file}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--core, #8CA7A2)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div style={{
                        borderTop: '1px solid rgba(0,73,82,0.06)',
                        padding: '16px 20px',
                      }}>
                        {loadingFiles[agent.file] ? (
                          <div style={{
                            fontSize: 13,
                            color: 'var(--text-secondary, #5A6364)',
                            fontStyle: 'italic',
                          }}>
                            Loading...
                          </div>
                        ) : editingFile === agent.file ? (
                          <div>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              style={{
                                width: '100%',
                                minHeight: 300,
                                padding: 14,
                                borderRadius: 8,
                                border: '1px solid rgba(0,73,82,0.15)',
                                background: '#FAFAF7',
                                fontSize: 13,
                                fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
                                lineHeight: 1.6,
                                color: 'var(--synapse, #2B2B2B)',
                                resize: 'vertical',
                                outline: 'none',
                              }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                              <button
                                onClick={handleCancel}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(0,73,82,0.15)',
                                  background: '#fff',
                                  fontSize: 13,
                                  cursor: 'pointer',
                                  color: 'var(--text-secondary, #5A6364)',
                                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSave(agent.file)}
                                disabled={saveMutation.isPending}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: 'var(--growth, #004952)',
                                  color: '#fff',
                                  fontSize: 13,
                                  cursor: 'pointer',
                                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                                  opacity: saveMutation.isPending ? 0.7 : 1,
                                }}
                              >
                                {saveMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                            {saveMutation.isError && (
                              <div style={{
                                marginTop: 8,
                                padding: '8px 12px',
                                borderRadius: 6,
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                fontSize: 12,
                                color: '#DC2626',
                              }}>
                                {saveMutation.error?.message || 'Save failed'}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div style={{
                              maxHeight: 400,
                              overflowY: 'auto',
                              paddingRight: 8,
                            }}>
                              {renderMarkdown(fileContents[agent.file] || '')}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                              <button
                                onClick={() => handleEdit(agent.file)}
                                style={{
                                  padding: '7px 14px',
                                  borderRadius: 8,
                                  border: '1px solid rgba(0,73,82,0.15)',
                                  background: '#fff',
                                  fontSize: 13,
                                  cursor: 'pointer',
                                  color: 'var(--growth, #004952)',
                                  fontWeight: 500,
                                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'var(--growth, #004952)'
                                  e.currentTarget.style.color = '#fff'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fff'
                                  e.currentTarget.style.color = 'var(--growth, #004952)'
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ===== ORCHESTRATOR TAB ===== */}
          {activeTab === 'orchestrator' && (
            <ConfigFileCard
              title="Orchestrator"
              subtitle="Agent coordination rules and cross-pollination protocol"
              file="_agents/orchestrator.md"
              fileContents={fileContents}
              loadingFiles={loadingFiles}
              loadFileContent={loadFileContent}
              editingFile={editingFile}
              editContent={editContent}
              setEditContent={setEditContent}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              saveMutation={saveMutation}
            />
          )}

          {/* ===== SIGNAL PIPELINE TAB ===== */}
          {activeTab === 'pipeline' && (
            <ConfigFileCard
              title="Signal Pipeline"
              subtitle="Automated signal propagation, lifecycle states, and gate rules"
              file="_agents/signal-pipeline.md"
              fileContents={fileContents}
              loadingFiles={loadingFiles}
              loadFileContent={loadFileContent}
              editingFile={editingFile}
              editContent={editContent}
              setEditContent={setEditContent}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              saveMutation={saveMutation}
            />
          )}

          {/* ===== SKILLS TAB ===== */}
          {activeTab === 'skills' && (
            <div>
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category} style={{ marginBottom: 24 }}>
                  <h3 style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--core, #8CA7A2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    margin: '0 0 10px 0',
                    fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                  }}>
                    {category}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(cmds as any[]).map((cmd: any) => (
                      <div
                        key={cmd.name}
                        style={{
                          padding: '12px 16px',
                          background: '#fff',
                          borderRadius: 10,
                          border: '1px solid rgba(0,73,82,0.10)',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 12,
                        }}
                      >
                        <span style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--growth, #004952)',
                          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
                          flexShrink: 0,
                        }}>
                          /{cmd.name}
                        </span>
                        <span style={{
                          fontSize: 13,
                          color: 'var(--text-secondary, #5A6364)',
                          fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                          lineHeight: 1.5,
                        }}>
                          {cmd.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {commands.length === 0 && (
                <div style={{
                  padding: 40,
                  textAlign: 'center',
                  color: 'var(--text-secondary, #5A6364)',
                  fontSize: 14,
                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                }}>
                  Loading skills...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Reusable config file card for orchestrator + pipeline tabs ---

function ConfigFileCard({
  title,
  subtitle,
  file,
  fileContents,
  loadingFiles,
  loadFileContent,
  editingFile,
  editContent,
  setEditContent,
  onEdit,
  onSave,
  onCancel,
  saveMutation,
}: {
  title: string
  subtitle: string
  file: string
  fileContents: Record<string, string>
  loadingFiles: Record<string, boolean>
  loadFileContent: (f: string) => void
  editingFile: string | null
  editContent: string
  setEditContent: (v: string) => void
  onEdit: (f: string) => void
  onSave: (f: string) => void
  onCancel: () => void
  saveMutation: any
}) {
  // Auto-load on mount
  useEffect(() => {
    if (!fileContents[file] && !loadingFiles[file]) {
      loadFileContent(file)
    }
  }, [file, fileContents, loadingFiles, loadFileContent])

  return (
    <div style={{
      background: '#fff',
      borderRadius: 10,
      border: '1px solid rgba(0,73,82,0.10)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,73,82,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--synapse, #2B2B2B)',
            fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-secondary, #5A6364)',
            fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
            marginTop: 2,
          }}>
            {subtitle}
          </div>
        </div>
        <span style={{
          fontSize: 11,
          color: 'var(--core, #8CA7A2)',
          fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
        }}>
          {file}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        {loadingFiles[file] ? (
          <div style={{
            fontSize: 13,
            color: 'var(--text-secondary, #5A6364)',
            fontStyle: 'italic',
          }}>
            Loading...
          </div>
        ) : editingFile === file ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{
                width: '100%',
                minHeight: 400,
                padding: 14,
                borderRadius: 8,
                border: '1px solid rgba(0,73,82,0.15)',
                background: '#FAFAF7',
                fontSize: 13,
                fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)',
                lineHeight: 1.6,
                color: 'var(--synapse, #2B2B2B)',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onCancel}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,73,82,0.15)',
                  background: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'var(--text-secondary, #5A6364)',
                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => onSave(file)}
                disabled={saveMutation.isPending}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--growth, #004952)',
                  color: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                  opacity: saveMutation.isPending ? 0.7 : 1,
                }}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
            {saveMutation.isError && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 6,
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                fontSize: 12,
                color: '#DC2626',
              }}>
                {saveMutation.error?.message || 'Save failed'}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{
              maxHeight: 500,
              overflowY: 'auto',
              paddingRight: 8,
            }}>
              {renderMarkdown(fileContents[file] || '')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={() => onEdit(file)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,73,82,0.15)',
                  background: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'var(--growth, #004952)',
                  fontWeight: 500,
                  fontFamily: 'var(--font-ibm-plex-sans, "IBM Plex Sans", sans-serif)',
                  transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--growth, #004952)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.color = 'var(--growth, #004952)'
                }}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
