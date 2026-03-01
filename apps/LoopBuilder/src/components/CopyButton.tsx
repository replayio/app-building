import { useState } from 'react'
import './CopyButton.css'

interface CopyButtonProps {
  text: string
  label?: string
  'data-testid'?: string
}

function CopyButton({ text, label = 'Copy', 'data-testid': testId }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      data-testid={testId}
      onClick={handleCopy}
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}

export default CopyButton
