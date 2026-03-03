import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Outlet } from '@remix-run/react'

import { requireUserId } from '~/utils/session.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  return json({})
}

export default function AdminLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}
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
      <Outlet />
    </Box>
  )
}
