import { AutoAwesome } from '@mui/icons-material'
import { Fab, Tooltip } from '@mui/material'

interface AiChatButtonProps {
  onClick: () => void
}

export function AiChatButton({ onClick }: AiChatButtonProps) {
  return (
    <Tooltip title="AI Field Generator" placement="left">
      <Fab
        color="secondary"
        onClick={onClick}
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
      >
        <AutoAwesome />
      </Fab>
    </Tooltip>
  )
}
