export type LinkKind = 'gong' | 'pdf' | 'google-doc' | 'google-sheet' | 'google-slides' | 'google-drive' | 'link'

export const linkKindLabel: Record<LinkKind, string> = {
  gong: 'Gong',
  pdf: 'PDF',
  'google-doc': 'Google Doc',
  'google-sheet': 'Google Sheet',
  'google-slides': 'Google Slides',
  'google-drive': 'Google Drive',
  link: 'Link',
}

/** Works out what a URL points at, so the UI can label it without the AE picking a type. */
export function linkKind(url: string): LinkKind {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return 'link'
  }
  if (parsed.hostname === 'gong.io' || parsed.hostname.endsWith('.gong.io')) return 'gong'
  if (parsed.pathname.toLowerCase().endsWith('.pdf')) return 'pdf'
  if (parsed.hostname === 'docs.google.com') {
    if (parsed.pathname.startsWith('/document')) return 'google-doc'
    if (parsed.pathname.startsWith('/spreadsheets')) return 'google-sheet'
    if (parsed.pathname.startsWith('/presentation')) return 'google-slides'
  }
  if (parsed.hostname === 'drive.google.com') return 'google-drive'
  return 'link'
}

export function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}
