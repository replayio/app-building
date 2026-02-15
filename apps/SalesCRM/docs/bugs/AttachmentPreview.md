# Bug: Attachment Preview

## Problem
Attachments on the clients page (and deal detail page) do not show a preview with file type indicators or thumbnails for images. All attachments show a generic FileText or Link icon regardless of file type.

## Root Cause
Both `AttachmentsSection.tsx` (client detail) and `DealAttachmentsSection.tsx` (deal detail) render a simple icon (FileText for documents, LinkIcon for links) without considering the actual file type. There is no logic to:
1. Determine the file extension/MIME type from the filename or URL
2. Show a file-type-specific icon (e.g., PDF, spreadsheet, image)
3. Render an image thumbnail when the attachment is an image file

## Affected Components
- `src/components/client-detail/AttachmentsSection.tsx` — uses FileText/LinkIcon only
- `src/components/deal-detail/DealAttachmentsSection.tsx` — uses FileText for all items

## Fix
1. Create a utility function to determine file type from filename extension
2. Show file-type-specific icons (Image, FileSpreadsheet, FileCode, etc.) based on extension
3. For image files (jpg, png, gif, webp, svg), show a small thumbnail preview using the attachment URL
4. Apply the same preview treatment to both client and deal attachment displays
