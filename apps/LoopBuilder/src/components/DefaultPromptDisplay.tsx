import './DefaultPromptDisplay.css'

interface DefaultPromptDisplayProps {
  prompt: string | null
}

function DefaultPromptDisplay({ prompt }: DefaultPromptDisplayProps) {
  return (
    <div className="default-prompt" data-testid="default-prompt">
      <h2 className="default-prompt__title">Default Prompt</h2>
      <div className="default-prompt__content" data-testid="default-prompt-value">
        {prompt || 'No default prompt configured'}
      </div>
    </div>
  )
}

export default DefaultPromptDisplay
