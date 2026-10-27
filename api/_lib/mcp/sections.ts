/**
 * The list-type parts of a room that the add/update/remove tools can edit.
 * `where` says whether the array sits at the top of the room or under
 * `components`, which decides the shape of the PATCH body.
 */
export const SECTIONS = {
  links: {
    where: 'components',
    idPrefix: 'link',
    shape: '{ title, subtitle, icon: "plus"|"branch"|"users", target (internal route like /room/<slug>/requirements, or https URL) }',
    page: 'Home: quick links tiles',
  },
  documents: {
    where: 'components',
    idPrefix: 'doc',
    shape: '{ displayName, category, fileType: "pdf"|"markdown"|"sheet"|"recording"|"other", actionLabel (e.g. "View"), href (https link to the file, a PDF or Google Doc; leave "" if there is none yet, and the View button stays disabled until it is set), driveFileId? (string or null) }',
    page: 'Home: Key Documents list, and the full Documents page behind its "View all" button',
  },
  requirements: {
    where: 'components',
    idPrefix: 'req',
    shape: '{ title, description, url (https link to a PDF, Google Doc or web page) }',
    page: 'Requirements page',
  },
  architecture: {
    where: 'components',
    idPrefix: 'arch',
    shape: '{ title, description, url (https link to a PDF, Google Doc or web page) }',
    page: 'Architecture page',
  },
  timeline: {
    where: 'components',
    idPrefix: 'tl',
    shape: '{ title, description, ownerSide: "talon"|"prospect"|"joint", ownerName, dueDate (YYYY-MM-DD), status: "done"|"active"|"upcoming" }',
    page: 'Joint project timeline page. The first two steps that are not done also appear on Home as the "What\'s next" block, so marking a step done moves it on',
  },
  stories: {
    where: 'components',
    idPrefix: 'story',
    shape: '{ customerName, industry, title, description, url (https link to a PDF or a real customer story page) }',
    page: 'Customer success stories page',
  },
  recordings: {
    where: 'components',
    idPrefix: 'rec',
    shape: '{ title, description (may be empty), url (https link to a recording: a Gong call or a Google Drive video) }',
    page: 'Home: recordings list (shown instead of the featured video when the room has no video)',
  },
  team: {
    where: 'room',
    idPrefix: 'tm',
    shape: '{ name, role, initials (2 letters), colorway: "electric"|"teal"|"lime"|"navy" }',
    page: 'Home: team card',
  },
  milestones: {
    where: 'room',
    idPrefix: 'm',
    shape: '{ label, date (YYYY-MM-DD), status: "done"|"active"|"upcoming" }',
    page: 'Sidebar: project journey',
  },
} as const

export type SectionName = keyof typeof SECTIONS
export const SECTION_NAMES = Object.keys(SECTIONS) as [SectionName, ...SectionName[]]

/**
 * Components that have no list of their own: they're configured through
 * update_room_details or read from another section. Kept here so
 * describe_sections can give the assistant the full picture of a room.
 */
export const OTHER_COMPONENTS = {
  welcomeHero: 'Home banner. Set aeFirstName / prospectName and the "since last visit" list with update_room_details (hero).',
  featuredVideo:
    'Home video. Set with update_room_details (media.videoUrl must be a direct video file, e.g. an .mp4 link). When videoUrl is empty, the Recordings block is shown in its place.',
  recordings: 'Home block: a list of links to recordings (Gong calls or Google Drive videos). Edit the "recordings" section with add_item. Only shown when the room has no featured video.',
  whatsNext: 'Home block showing the current and next timeline step. Nothing to configure: it reads the "timeline" section.',
  goLiveCountdown: 'Home banner with the target go-live date. Set targetGoLive with update_room_details or create_room.',
  teamCard: 'Home card. Team members are the "team" section; the Book a meeting and Slack buttons use bookMeetingUrl and slackChannelUrl (update_room_details).',
  buyerIntentSignals: 'Internal-only feed of who viewed what. Filled in automatically and not editable through these tools; prospects never see it.',
} as const
