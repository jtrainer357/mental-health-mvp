export interface AgentState {
  name: string
  slug: string // lowercase: maren, reid, ava, kai, syd
  role: string // Researcher, Strategist, Designer, PM, Engineer
  lastUpdated: string
  hotContext: string[]
  sessionWork: string[]
  currentlyWorkingOn: string[]
  inboxCount: number
  unprocessedMessages: InboxMessage[]
  derivedStatus: 'working' | 'waiting' | 'idle' | 'blocked'
}

export interface InboxMessage {
  date: string
  from: string
  subject: string
  type: 'signal' | 'decision' | 'request' | 'alert' | 'question'
  priority: 'high' | 'medium' | 'low'
  content: string
  actionNeeded: string
  related: string[]
}

export interface Signal {
  id: string // SIG-XXX
  title: string
  strength: 'strong' | 'moderate' | 'weak'
  lifecycle: 'confirmed' | 'emerging' | 'challenged' | 'retired'
  filed: string
  lastValidated: string
  finding: string
  strategyImpact: string
  designImpact: string
  sources: string[]
  isStale: boolean
}

export interface DesignDecision {
  id: string // D-XX
  title: string
  status: string
  date: string
  author?: string
  signalRefs: string[]
  decisionRefs: string[]
  prdRefs: string[]
  wireflowRefs: string[]
  tags: string[]
  content: string // raw markdown content below frontmatter
}

export interface Disagreement {
  id: string
  title: string
  date: string
  agents: string[]
  status: 'active' | 'resolved'
  positions: string // markdown content
}

export interface ResearchRequest {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  status: 'open' | 'in-progress' | 'closed'
  filedDate: string
  content: string
}

export interface BootstrapData {
  lastUpdated: string
  hotItems: string[]
  agentDeltas: Record<string, string>
  openDecisions: string[]
  overdueItems: string[]
}

export interface DailyLog {
  title: string
  date: string
  type: string
  status: string
  slug: string // filename without .md
  content: string
}

export interface VaultHealth {
  agentCount: number
  signalCount: { confirmed: number; emerging: number; archive: number }
  decisionCount: number
  disagreementCount: number
  researchQueueCount: number
  actionCount: number
  inboxTotal: number
  lastVaultSync: string // from git
  staleSignalCount: number
}

export type WorkflowState = 'planned' | 'executing' | 'awaiting_external' | 'blocked' | 'done'

export interface WorkflowStream {
  id: string // WF-001
  title: string
  state: WorkflowState
  owner: string // agent slug or 'Jay' or 'Team'
  lastUpdated: string
  nextStep: string
  safeResume: string
  related: string[]
  blockers: string
  due?: string
}

export interface WorkflowBoard {
  lastUpdated: string
  streams: WorkflowStream[]
  counts: Record<WorkflowState, number>
}

export interface HarnessCheck {
  id: string // HC-01
  description: string
  passing: boolean
}

export interface HarnessRunLogEntry {
  date: string
  by: string
  passed: number
  failed: number
  notes: string
}

export interface HarnessStatus {
  lastRun: string
  lastRunBy: string
  status: 'passing' | 'warning' | 'failing' | 'stale'
  checks: HarnessCheck[]
  runLog: HarnessRunLogEntry[]
  isStale: boolean // computed: last_run > 3 days
  daysSinceLastRun: number
}

export interface EventLogEntry {
  timestamp: string // ISO-8601
  source: string
  type: string
  artifact: string
  result: string
}

