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
    shape: '{ displayName, category, fileType: "pdf"|"markdown"|"sheet"|"recording"|"other", actionLabel (e.g. "View"), href? (https URL), driveFileId? (string or null) }',
    page: 'Home: documents list',
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
    page: 'Joint project timeline page',
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
    shape: '{ title, date (YYYY-MM-DD), description (may be empty), url (https link to the call in Gong) }',
    page: 'Home: call recordings (shown instead of the featured video when the room has no video)',
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
