export type VideoSource =
  | { kind: 'none' }
  /** A video file the browser can play directly with <video> */
  | { kind: 'file'; url: string }
  /** A hosted player (YouTube, Vimeo, Loom, Google Drive) shown in an iframe */
  | { kind: 'embed'; url: string; provider: string }
  /** Some other web page: can't be played inline, so we link out to it */
  | { kind: 'link'; url: string }

const FILE_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)$/i

/**
 * Works out how to show the featured video from whatever URL the AE pasted.
 * A bare <video> tag only plays direct video files, so watch-page links from
 * YouTube, Drive and friends are converted to their embeddable player URL.
 */
export function videoSource(raw: string): VideoSource {
  const value = raw.trim()
  if (!value) return { kind: 'none' }
  if (value.startsWith('/') && !value.startsWith('//')) return { kind: 'file', url: value }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    return { kind: 'none' }
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { kind: 'none' }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const id =
      url.searchParams.get('v') ??
      (['embed', 'shorts', 'live', 'v'].includes(parts[0]) ? parts[1] : undefined)
    if (id) return { kind: 'embed', provider: 'YouTube', url: `https://www.youtube-nocookie.com/embed/${id}` }
  }
  if (host === 'youtu.be' && parts[0]) {
    return { kind: 'embed', provider: 'YouTube', url: `https://www.youtube-nocookie.com/embed/${parts[0]}` }
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parts.find((part) => /^\d+$/.test(part))
    if (id) return { kind: 'embed', provider: 'Vimeo', url: `https://player.vimeo.com/video/${id}` }
  }
  if (host === 'loom.com' && ['share', 'embed'].includes(parts[0]) && parts[1]) {
    return { kind: 'embed', provider: 'Loom', url: `https://www.loom.com/embed/${parts[1]}` }
  }
  if (host === 'drive.google.com' && parts[0] === 'file' && parts[1] === 'd' && parts[2]) {
    return { kind: 'embed', provider: 'Google Drive', url: `https://drive.google.com/file/d/${parts[2]}/preview` }
  }

  if (FILE_EXTENSION.test(url.pathname)) return { kind: 'file', url: value }
  return { kind: 'link', url: value }
}
