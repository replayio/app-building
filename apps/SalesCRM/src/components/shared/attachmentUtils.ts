type FileCategory = 'image' | 'video' | 'audio' | 'spreadsheet' | 'presentation' | 'code' | 'archive' | 'document' | 'link' | 'other'

const extensionMap: Record<string, FileCategory> = {
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image', bmp: 'image', ico: 'image',
  mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio',
  xls: 'spreadsheet', xlsx: 'spreadsheet', csv: 'spreadsheet',
  ppt: 'presentation', pptx: 'presentation', key: 'presentation',
  js: 'code', ts: 'code', jsx: 'code', tsx: 'code', py: 'code', java: 'code', html: 'code', css: 'code', json: 'code', xml: 'code',
  zip: 'archive', rar: 'archive', tar: 'archive', gz: 'archive', '7z': 'archive',
  pdf: 'document', doc: 'document', docx: 'document', txt: 'document', md: 'document', rtf: 'document',
}

const categoryLabels: Record<FileCategory, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  code: 'Code',
  archive: 'Archive',
  document: 'Document',
  link: 'Link',
  other: 'File',
}

export function getFileCategory(filename: string, type: 'document' | 'link'): FileCategory {
  if (type === 'link') return 'link'
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return extensionMap[ext] ?? 'other'
}

export function getFileTypeLabel(filename: string, type: 'document' | 'link'): string {
  const category = getFileCategory(filename, type)
  return categoryLabels[category]
}
