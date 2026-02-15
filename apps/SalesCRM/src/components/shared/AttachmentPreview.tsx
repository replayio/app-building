import { useState } from 'react'
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Film,
  Music,
  File,
  Presentation,
  Link as LinkIcon,
} from 'lucide-react'
import { getFileCategory } from './attachmentUtils'

type FileCategory = 'image' | 'video' | 'audio' | 'spreadsheet' | 'presentation' | 'code' | 'archive' | 'document' | 'link' | 'other'

function CategoryIcon({ category, size = 16 }: { category: FileCategory; size?: number }) {
  const props = { size, strokeWidth: 1.5, className: 'text-text-muted' }
  switch (category) {
    case 'image': return <ImageIcon {...props} />
    case 'video': return <Film {...props} />
    case 'audio': return <Music {...props} />
    case 'spreadsheet': return <FileSpreadsheet {...props} />
    case 'presentation': return <Presentation {...props} />
    case 'code': return <FileCode {...props} />
    case 'archive': return <FileArchive {...props} />
    case 'document': return <FileText {...props} />
    case 'link': return <LinkIcon {...props} />
    default: return <File {...props} />
  }
}

interface AttachmentPreviewProps {
  filename: string
  url: string
  type: 'document' | 'link'
}

export function AttachmentPreview({ filename, url, type }: AttachmentPreviewProps) {
  const [imgError, setImgError] = useState(false)
  const category = getFileCategory(filename, type)
  const showThumbnail = category === 'image' && !imgError && url

  return (
    <div className="flex items-center gap-2 flex-shrink-0" data-testid="attachment-preview">
      {showThumbnail ? (
        <div className="w-8 h-8 rounded-[4px] overflow-hidden bg-hover flex items-center justify-center flex-shrink-0">
          <img
            src={url}
            alt={filename}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            data-testid="attachment-thumbnail"
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-[4px] bg-hover flex items-center justify-center flex-shrink-0" data-testid="attachment-icon">
          <CategoryIcon category={category} />
        </div>
      )}
    </div>
  )
}
