'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { QueryProvider } from '@/src/lib/queries/query-provider'
import CommandPalette from './command-palette'

/* ------------------------------------------------------------------ */
/*  Tebra Brand Tokens                                                */
/* ------------------------------------------------------------------ */

const BRAND_CSS = `
  :root {
    --growth: #004952;
    --growth-2: #417E86;
    --vitality: #FF8D6E;
    --vitality-soft: #FFB49E;
    --backbone: #F6F3EB;
    --synapse: #2B2B2B;
    --core: #6F8285;
    --care: #B8AFA6;
    --white: #FFFFFF;
    --text-secondary: #5A6364;
    --text-muted: #6F8285;

    --agent-maren: #10B981;
    --agent-reid: #004952;
    --agent-ava: #FF8D6E;
    --agent-kai: #D4A017;
    --agent-syd: #417E86;

    --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
  }
`

/* ------------------------------------------------------------------ */
/*  Agent metadata                                                     */
/* ------------------------------------------------------------------ */

const AGENTS_FALLBACK = [
  { name: 'Maren', slug: 'maren', role: 'Researcher',  color: 'var(--agent-maren)', derivedStatus: 'idle' as const },
  { name: 'Reid',  slug: 'reid',  role: 'Strategist',  color: 'var(--agent-reid)',  derivedStatus: 'idle' as const },
  { name: 'Ava',   slug: 'ava',   role: 'Designer',    color: 'var(--agent-ava)',   derivedStatus: 'idle' as const },
  { name: 'Kai',   slug: 'kai',   role: 'PM',          color: 'var(--agent-kai)',   derivedStatus: 'idle' as const },
  { name: 'Syd',   slug: 'syd',   role: 'Engineer',    color: 'var(--agent-syd)',   derivedStatus: 'idle' as const },
]

const AGENT_COLORS: Record<string, string> = {
  maren: 'var(--agent-maren)',
  reid: 'var(--agent-reid)',
  ava: 'var(--agent-ava)',
  kai: 'var(--agent-kai)',
  syd: 'var(--agent-syd)',
}

function getStatusDotStyle(status: string, agentColor: string): React.CSSProperties {
  switch (status) {
    case 'working':
      return {
        width: 6, height: 6, borderRadius: '50%',
        background: agentColor,
        animation: 'mc-breathe 2.4s ease-in-out infinite',
        flexShrink: 0,
      }
    case 'waiting':
      return {
        width: 6, height: 6, borderRadius: '50%',
        background: '#D4A017',
        flexShrink: 0,
      }
    case 'blocked':
      return {
        width: 6, height: 6, borderRadius: '50%',
        background: '#D94040',
        flexShrink: 0,
      }
    default: // idle
      return {
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--care)',
        flexShrink: 0,
      }
  }
}

/* ------------------------------------------------------------------ */
/*  Nav items                                                          */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { href: '/mc',                label: 'Team Board',     icon: 'layout-dashboard' },
  { href: '/mc/workflows',      label: 'Workflows',      icon: 'git-branch' },
  { href: '/mc/signals',        label: 'Signals',        icon: 'radio' },
  { href: '/mc/decisions',      label: 'Decisions',      icon: 'scale' },
  { href: '/mc/log',            label: 'Activity Log',   icon: 'clock' },
  { href: '/mc/system-health',  label: 'System Health',  icon: 'settings' },
]

const HEADER_TABS = [
  { href: '/mc',                label: 'Team Board',     icon: 'layout-dashboard' },
  { href: '/mc/workflows',      label: 'Workflows',      icon: 'git-branch' },
  { href: '/mc/signals',        label: 'Signals',        icon: 'radio' },
  { href: '/mc/decisions',      label: 'Decisions',      icon: 'scale' },
  { href: '/mc/log',            label: 'Activity Log',   icon: 'clock' },
  { href: '/mc/system-health',  label: 'System Health',  icon: 'settings' },
]

// Contextual sidebar items — only shown when on Team Board
const BOARD_TOOLS = [
  { href: '/mc/goals',     label: 'Goal',       icon: 'zap' },
  { href: '/mc/chat',      label: 'Agent Chat', icon: 'message-circle' },
  { href: '/mc/config',    label: 'Config',     icon: 'settings' },
]

/* ------------------------------------------------------------------ */
/*  Lucide icon paths (18px viewBox, stroke-width 1.5)                */
/* ------------------------------------------------------------------ */

function LucideIcon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    'layout-dashboard': (
      <>
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </>
    ),
    'git-branch': (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="6" cy="18" r="2" />
        <path d="M6 8v8" />
        <path d="M6 8c0 4 4 6 8 6h2" />
      </>
    ),
    'radio': (
      <>
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
    'scale': (
      <>
        <path d="M8 21h8" />
        <path d="M12 17V3" />
        <path d="M2 11h4l2-8 2 8h4" />
        <path d="M10 11h4l2-8 2 8h4" />
      </>
    ),
    'clock': (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    'zap': (
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    ),
    'message-circle': (
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    ),
    'settings': (
      <>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || null}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Agent Status List (live from API)                                  */
/* ------------------------------------------------------------------ */

function AgentStatusList() {
  const { data: agentsData } = useQuery({
    queryKey: ['mc-agents-sidebar'],
    queryFn: () => fetch('/api/mc/agents').then(r => r.json()),
    refetchInterval: 30_000,
  })

  const liveAgents = agentsData?.agents
  const agents = liveAgents
    ? liveAgents.map((a: any) => ({
        name: a.name,
        slug: a.slug,
        role: a.role,
        color: AGENT_COLORS[a.slug] || 'var(--core)',
        derivedStatus: a.derivedStatus || 'idle',
      }))
    : AGENTS_FALLBACK

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {agents.map((agent: any) => (
        <div
          key={agent.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            borderRadius: 8,
            transition: 'background 180ms var(--ease-out-expo)',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,73,82,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {/* Color bar */}
          <div
            style={{
              width: 3,
              height: 24,
              borderRadius: 2,
              background: agent.color,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--synapse)' }}>
              {agent.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--core)' }}>
              {agent.role}
            </div>
          </div>
          {/* Status dot */}
          <span style={getStatusDotStyle(agent.derivedStatus, agent.color)} />
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function MissionControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActiveNav = (href: string) => {
    if (href === '/mc') return pathname === '/mc'
    return pathname.startsWith(href)
  }

  const isActiveTab = (href: string) => {
    if (href === '/mc') return pathname === '/mc'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Brand tokens */}
      <style dangerouslySetInnerHTML={{ __html: BRAND_CSS }} />

      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: 'var(--synapse)' }}>
        <QueryProvider>

          {/* ---- Header ---- */}
          <header
            style={{
              height: 56,
              background: 'var(--growth)',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
            }}
          >
            {/* Left: logo + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* MC logo — orbital constellation mark */}
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer ring */}
                <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                {/* Orbital path */}
                <ellipse cx="16" cy="16" rx="13" ry="7" transform="rotate(-30 16 16)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
                {/* Five agent nodes */}
                <circle cx="16" cy="3.5" r="2.2" fill="rgba(255,255,255,0.85)" />
                <circle cx="27" cy="11" r="2.2" fill="rgba(255,255,255,0.85)" />
                <circle cx="24.5" cy="24" r="2.2" fill="rgba(255,255,255,0.85)" />
                <circle cx="7.5" cy="24" r="2.2" fill="rgba(255,255,255,0.85)" />
                <circle cx="5" cy="11" r="2.2" fill="rgba(255,255,255,0.85)" />
                {/* Center hub */}
                <circle cx="16" cy="16" r="3.5" fill="rgba(255,255,255,0.9)" />
                <circle cx="16" cy="16" r="1.5" fill="var(--growth, #004952)" />
              </svg>
              <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--white)' }}>
                Mission Control
              </span>
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Second Brain
              </span>
            </div>

            {/* Center: tab pills */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 9999,
                padding: 3,
              }}
            >
              {HEADER_TABS.map((tab) => {
                const active = isActiveTab(tab.href)
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 500,
                      background: active ? 'var(--white)' : 'transparent',
                      color: active ? 'var(--growth)' : 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      transition: 'all 200ms var(--ease-out-expo)',
                      cursor: 'pointer',
                    }}
                  >
                    <LucideIcon name={tab.icon} size={14} />
                    {tab.label}
                  </Link>
                )
              })}
            </div>

            {/* Right: live dot + cmd-K */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'inline-block',
                    animation: 'mc-breathe 2.4s ease-in-out infinite',
                  }}
                />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Live</span>
              </div>

              {/* Cmd-K hint */}
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                &#8984;K
              </kbd>
            </div>
          </header>

          {/* ---- Sidebar ---- */}
          <aside
            style={{
              position: 'fixed',
              top: 56,
              left: 0,
              bottom: 0,
              width: 220,
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(12px)',
              borderRight: '1px solid rgba(0,73,82,0.08)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 40,
              overflowY: 'auto',
            }}
          >
            <nav style={{ padding: '16px 12px 8px', flex: 1 }}>
              {/* Tools */}
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.1em',
                  color: 'var(--care)',
                  padding: '0 12px',
                  marginBottom: 6,
                }}
              >
                Tools
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {BOARD_TOOLS.map((item) => {
                  const active = isActiveNav(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '7px 12px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: active ? 600 : 400,
                        color: active ? 'var(--growth)' : 'var(--text-secondary)',
                        background: active ? 'rgba(0,73,82,0.08)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 180ms var(--ease-out-expo)',
                        borderLeft: active ? '3px solid var(--growth)' : '3px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) e.currentTarget.style.background = 'rgba(0,73,82,0.04)'
                      }}
                      onMouseLeave={(e) => {
                        if (!active) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span style={{ color: active ? 'var(--growth)' : 'var(--core)', display: 'flex' }}>
                        <LucideIcon name={item.icon} size={16} />
                      </span>
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--care)', margin: '12px 8px' }} />

              {/* Agents section */}
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.08em',
                  color: 'var(--core)',
                  padding: '0 12px',
                  marginBottom: 8,
                }}
              >
                Agents
              </div>

              <AgentStatusList />
            </nav>

            {/* Sidebar footer */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(0,73,82,0.06)',
              }}
            >
              <Link
                href="/mc/config"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--core)',
                  textDecoration: 'none',
                  transition: 'color 180ms var(--ease-out-expo)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--growth)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--core)' }}
              >
                <LucideIcon name="settings" size={16} />
                System Config
              </Link>
            </div>
          </aside>

          {/* ---- Main content ---- */}
          <main
            style={{
              marginLeft: 220,
              marginTop: 56,
              padding: '32px 40px 72px',
              background: 'var(--backbone)',
              minHeight: 'calc(100vh - 56px)',
            }}
          >
            {children}
          </main>

          <CommandPalette />
        </QueryProvider>
      </div>

      {/* Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mc-breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes mc-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mc-slide-in-left {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Page content entrance */
        main > * {
          animation: mc-fade-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Top tab pills — smooth underline and color */
        nav a, aside a {
          transition: all 220ms cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        /* Sidebar tool items — staggered entrance */
        aside nav > div > a:nth-child(1) { animation: mc-slide-in-left 0.3s 0.05s cubic-bezier(0.22,1,0.36,1) both; }
        aside nav > div > a:nth-child(2) { animation: mc-slide-in-left 0.3s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        aside nav > div > a:nth-child(3) { animation: mc-slide-in-left 0.3s 0.15s cubic-bezier(0.22,1,0.36,1) both; }

        /* Agent list — staggered entrance */
        aside nav > div:last-of-type > div:nth-child(1) { animation: mc-slide-in-left 0.3s 0.08s cubic-bezier(0.22,1,0.36,1) both; }
        aside nav > div:last-of-type > div:nth-child(2) { animation: mc-slide-in-left 0.3s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
        aside nav > div:last-of-type > div:nth-child(3) { animation: mc-slide-in-left 0.3s 0.16s cubic-bezier(0.22,1,0.36,1) both; }
        aside nav > div:last-of-type > div:nth-child(4) { animation: mc-slide-in-left 0.3s 0.20s cubic-bezier(0.22,1,0.36,1) both; }
        aside nav > div:last-of-type > div:nth-child(5) { animation: mc-slide-in-left 0.3s 0.24s cubic-bezier(0.22,1,0.36,1) both; }

        /* Header tab active pill — smooth background slide */
        header a {
          transition: all 250ms cubic-bezier(0.22, 1, 0.36, 1) !important;
        }

        /* Subtle hover lift on sidebar items */
        aside a:hover {
          transform: translateX(2px);
        }

        /* Smooth sidebar border-left accent */
        aside a {
          transition: all 220ms cubic-bezier(0.22, 1, 0.36, 1), border-left-color 180ms ease !important;
        }
      `}} />
    </>
  )
}
