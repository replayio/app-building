interface TagBadgeProps {
  tag: string
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-normal text-text-muted bg-border/50">
      {tag}
    </span>
  )
}
