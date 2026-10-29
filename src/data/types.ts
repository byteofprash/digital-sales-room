export type MilestoneStatus = 'done' | 'active' | 'upcoming'

export interface Milestone {
  id: string
  label: string
  date: string // ISO date
  status: MilestoneStatus
}

export type TeamColorway = 'blue' | 'pine' | 'green' | 'black'

export interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
  colorway: TeamColorway
}

export type LinkIcon = 'plus' | 'branch' | 'users'

export interface LinkTile {
  id: string
  icon: LinkIcon
  title: string
  subtitle: string
  /** Internal route path (e.g. "/room/acme-corp/requirements") or an external URL */
  target: string
}

export type DocumentFileType = 'pdf' | 'markdown' | 'sheet' | 'recording' | 'other'

export interface DocumentEntry {
  id: string
  /** Google Drive file id once Phase 1 wires the Drive API; null while curated by hand */
  driveFileId: string | null
  displayName: string
  category: string
  fileType: DocumentFileType
  actionLabel: string
  href?: string
}

export interface EngagementEvent {
  id: string
  actorName: string
  actorInitials: string
  isAnonymous: boolean
  action: string
  targetLabel: string
  durationLabel?: string
  timeLabel: string
}

export interface SinceLastVisitItem {
  id: string
  icon: 'document' | 'calendar'
  text: string
}

export interface WelcomeHeroConfig {
  sinceLastVisit: SinceLastVisitItem[]
}

export interface MediaSpotlightConfig {
  videoUrl: string
  title: string
  presenterName: string
  presenterRole: string
  postedLabel: string
}

/** A document the AE points the buying committee to: a PDF, a Google Doc, or any web page. */
export interface ResourceLink {
  id: string
  title: string
  description: string
  /** http(s) URL to a PDF, a Google Doc/Drive file, or a web page */
  url: string
}

export type TimelineOwnerSide = 'talon' | 'prospect' | 'joint'

export interface TimelineStep {
  id: string
  title: string
  description: string
  ownerSide: TimelineOwnerSide
  ownerName: string
  dueDate: string // ISO date
  status: MilestoneStatus
}

/** A link to a recording: a Gong call, a Google Drive video, or any other page. */
export interface Recording {
  id: string
  title: string
  /** Optional one-liner on what was covered */
  description: string
  url: string
}

/** A reference story: a PDF or a link to a real customer's story. */
export interface SuccessStory {
  id: string
  customerName: string
  industry: string
  title: string
  description: string
  url: string
}

/**
 * Lifecycle of a room. Only `published` rooms are readable by prospects
 * (see firestore.rules); `draft` and `archived` are AE-only. Rooms created
 * before this field existed are treated as `published`.
 */
export type RoomStatus = 'draft' | 'published' | 'archived'

/**
 * Components an AE can switch on or off for a room from the "My rooms" page. `engagement` is not
 * here: Buyer intent signals are filled from visitor activity and only ever shown to the AE.
 */
export type ComponentId =
  | 'hero'
  | 'links'
  | 'media'
  | 'recordings'
  | 'team'
  | 'milestone'
  | 'whatsnext'
  | 'documents'
  | 'journey'
  | 'requirements'
  | 'timeline'
  | 'architecture'
  | 'stories'

/** What the "My rooms" list shows for each room the AE owns. */
export interface RoomSummary {
  slug: string
  status: RoomStatus
  prospectName: string
  targetGoLive: { date: string; label: string }
}

export interface Workspace {
  id: string
  slug: string
  status: RoomStatus
  prospectName: string
  aeFirstName: string
  team: TeamMember[]
  milestones: Milestone[]
  targetGoLive: { date: string; label: string }
  bookMeetingUrl: string
  slackChannelUrl: string
  /** Components shown in this room. Missing on rooms saved before the picker existed: all are shown. */
  enabledComponents?: ComponentId[]
  components: {
    hero: WelcomeHeroConfig
    links: LinkTile[]
    media: MediaSpotlightConfig
    documents: DocumentEntry[]
    engagement: EngagementEvent[]
    requirements: ResourceLink[]
    timeline: TimelineStep[]
    architecture: ResourceLink[]
    stories: SuccessStory[]
    recordings: Recording[]
  }
}
