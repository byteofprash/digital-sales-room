export type MilestoneStatus = 'done' | 'active' | 'upcoming'

export interface Milestone {
  id: string
  label: string
  date: string // ISO date
  status: MilestoneStatus
}

export type TeamColorway = 'electric' | 'teal' | 'lime' | 'navy'

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

/**
 * Lifecycle of a room. Only `published` rooms are readable by prospects
 * (see firestore.rules); `draft` and `archived` are AE-only. Rooms created
 * before this field existed are treated as `published`.
 */
export type RoomStatus = 'draft' | 'published' | 'archived'

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
  components: {
    hero: WelcomeHeroConfig
    links: LinkTile[]
    media: MediaSpotlightConfig
    documents: DocumentEntry[]
    engagement: EngagementEvent[]
  }
}
