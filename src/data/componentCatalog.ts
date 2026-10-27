export type ComponentVisibility = 'prospect' | 'internal'

export interface CatalogEntry {
  id: string
  name: string
  /** One line an AE can read to decide whether the room needs it */
  summary: string
  /** What the prospect (or AE) actually sees and can do */
  whatItShows: string[]
  visibility: ComponentVisibility
  /** True when AEs can change it from the Edit-mode dialogs on the room page */
  editableInRoom: boolean
  /** Room fields this component reads, as sent to POST/PATCH /api/rooms */
  apiFields: string[]
  /** 'half' blocks sit side by side on the Home page, so they preview at half width */
  previewWidth: 'full' | 'half'
  /** True for components that are a whole page in the room (reached from the sidebar) rather than a block on Home */
  page?: boolean
}

export const componentCatalog: CatalogEntry[] = [
  {
    id: 'hero',
    name: 'Welcome hero',
    summary: 'A personal greeting that opens the room and tells returning visitors what changed.',
    whatItShows: [
      'Greeting from the AE, with the prospect name',
      'A "Since your last visit" list: new documents, next meeting, and similar updates',
    ],
    visibility: 'prospect',
    editableInRoom: false,
    apiFields: ['aeFirstName', 'prospectName', 'components.hero'],
    previewWidth: 'full',
  },
  {
    id: 'links',
    name: 'Quick links',
    summary: 'A grid of tiles that send the buying committee to the pages or tools they need first.',
    whatItShows: [
      'Tiles with an icon (plus, branch, users), a title and a subtitle',
      'Each tile opens a room section or an external URL',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['components.links'],
    previewWidth: 'full',
  },
  {
    id: 'media',
    name: 'Media spotlight',
    summary: 'A featured video, such as a personal welcome or a recorded walkthrough.',
    whatItShows: [
      'Video player',
      'Title, who recorded it, their role, and when it was posted',
    ],
    visibility: 'prospect',
    editableInRoom: false,
    apiFields: ['components.media'],
    previewWidth: 'half',
  },
  {
    id: 'team',
    name: 'Team card',
    summary: 'Who the prospect is working with at Talon.One, and how to reach them.',
    whatItShows: [
      'Team members with name, role, initials avatar and colour',
      'Book a meeting button',
      'Link to the joint Slack channel',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['team', 'bookMeetingUrl', 'slackChannelUrl'],
    previewWidth: 'half',
  },
  {
    id: 'milestone',
    name: 'Go-live countdown',
    summary: 'Keeps the target go-live date front and centre, with the time remaining.',
    whatItShows: ['Label and target date', 'Days remaining until go-live'],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['targetGoLive'],
    previewWidth: 'full',
  },
  {
    id: 'documents',
    name: 'Documents',
    summary: 'The shared files for the deal: security reports, specs, ROI models and recordings.',
    whatItShows: [
      'File name, category and a type icon (PDF, Markdown, sheet, recording, other)',
      'An action button per file, such as View or Watch',
      'Optionally linked to a Google Drive file (planned)',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['components.documents'],
    previewWidth: 'full',
  },
  {
    id: 'journey',
    name: 'Project journey',
    summary: 'The deal milestones in the sidebar, so everyone can see where the project stands.',
    whatItShows: [
      'Numbered milestones: understand, validate, business case, commercials',
      'Each is marked done, active or upcoming',
      'The AE card at the bottom',
    ],
    visibility: 'prospect',
    editableInRoom: false,
    apiFields: ['milestones'],
    previewWidth: 'half',
  },
  {
    id: 'requirements',
    name: 'Requirements',
    summary: 'A page that points the buying committee to the requirements document for the deal.',
    whatItShows: [
      'One or more links, each with a title and short description',
      'Each link opens a PDF, a Google Doc or any web page, and is labelled with its type',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['components.requirements'],
    previewWidth: 'full',
    page: true,
  },
  {
    id: 'timeline',
    name: 'Joint project timeline',
    summary: 'A shared plan of the next steps, who owns each one and when it is due.',
    whatItShows: [
      'Steps in date order, each marked done, in progress or upcoming',
      'Owner for each step: Talon.One, the prospect or joint, plus the owner name',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['components.timeline'],
    previewWidth: 'full',
    page: true,
  },
  {
    id: 'architecture',
    name: 'Architecture',
    summary: 'A page that links to the technical architecture and integration documents.',
    whatItShows: [
      'Links to diagrams and integration specs, each with a title and short description',
      'Each link opens a PDF, a Google Doc or any web page, and is labelled with its type',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['components.architecture'],
    previewWidth: 'full',
    page: true,
  },
  {
    id: 'stories',
    name: 'Customer success stories',
    summary: 'Reference stories from real customers, picked to match the prospect.',
    whatItShows: [
      'A card per story: customer, industry, title and a short summary',
      'Each card opens a PDF or the customer story page',
    ],
    visibility: 'prospect',
    editableInRoom: true,
    apiFields: ['components.stories'],
    previewWidth: 'full',
    page: true,
  },
  {
    id: 'engagement',
    name: 'Buyer intent signals',
    summary: 'Who opened what, and for how long. Only the AE ever sees this; prospects never do.',
    whatItShows: [
      'Named and anonymous viewers, with what they viewed',
      'Time spent and how recently',
    ],
    visibility: 'internal',
    editableInRoom: false,
    apiFields: [],
    previewWidth: 'full',
  },
]
