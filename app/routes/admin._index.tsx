import { Add, Delete, Edit, Publish, Unpublished } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { useState } from 'react'

import { listForms, publishForm, removeForm } from '~/services/forms.server'
import { requireUserId } from '~/utils/session.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)
  const forms = await listForms()
  return { forms }
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)
  const formData = await request.formData()
  const intent = String(formData.get('intent'))
  const formId = String(formData.get('formId'))

  if (intent === 'delete') {
    await removeForm(formId)
  } else if (intent === 'publish') {
    await publishForm(formId)
  }

  return { ok: true }
}

export default function AdminIndex() {
  const { forms } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function handleDelete() {
    if (!deleteId) return
    fetcher.submit({ intent: 'delete', formId: deleteId }, { method: 'post' })
    setDeleteId(null)
  }

  function handlePublishToggle(id: string) {
    fetcher.submit({ intent: 'publish', formId: id }, { method: 'post' })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}
      >
        <Typography variant="h5" fontWeight={600}>
          Forms
        </Typography>
        <Button
          component={Link}
          to="/admin/forms/new"
          variant="contained"
          startIcon={<Add />}
        >
          Create Form
        </Button>
      </Box>

      {forms.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            No forms yet. Create your first one!
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="center">Fields</TableCell>
                <TableCell align="center">Submissions</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Typography
                      component={Link}
                      to={`/admin/forms/${form.id}/edit`}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        fontWeight: 500,
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {form.title}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{form._count.fields}</TableCell>
                  <TableCell align="center">{form._count.submissions}</TableCell>
                  <TableCell>
                    <Chip
                      label={form.isPublished ? 'Published' : 'Draft'}
                      color={form.isPublished ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(form.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        component={Link}
                        to={`/admin/forms/${form.id}/edit`}
                        size="small"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={form.isPublished ? 'Unpublish' : 'Publish'}>
                      <IconButton onClick={() => handlePublishToggle(form.id)} size="small">
                        {form.isPublished ? (
                          <Unpublished fontSize="small" />
                        ) : (
                          <Publish fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => setDeleteId(form.id)}
                        size="small"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete form?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
