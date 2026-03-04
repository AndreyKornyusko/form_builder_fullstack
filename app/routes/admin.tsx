import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Form, Outlet } from '@remix-run/react'

import { requireUserId } from '~/utils/session.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  return {}
}

export default function AdminLayout() {
  return (
    // overflow:hidden prevents double scrollbars; the editor route manages its own height
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', flexShrink: 0 }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Form Builder
          </Typography>
          <Form method="post" action="/auth/logout">
            <Button type="submit" variant="outlined" size="small">
              Logout
            </Button>
          </Form>
        </Toolbar>
      </AppBar>
      {/* Dashboard / new-form routes scroll normally; editor controls its own overflow */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'grey.50' }}>
        <Outlet />
      </Box>
    </Box>
  )
}
