import { Box, Button, Card, CardActions, CardContent, Grid, Typography } from '@mui/material'
import type { MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { getPublishedForms } from '~/models/forms.server'

export const meta: MetaFunction = () => [{ title: 'Forms — Form Builder' }]

export async function loader() {
  const forms = await getPublishedForms()
  return { forms }
}

export default function PublicIndex() {
  const { forms } = useLoaderData<typeof loader>()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 6, px: 3 }}>
      <Box sx={{ maxWidth: 960, mx: 'auto' }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, textAlign: 'center' }}>
          Available Forms
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 5, textAlign: 'center' }}
        >
          Fill out and submit any of the forms below
        </Typography>

        {forms.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">No forms available at the moment</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {forms.map((form) => (
              <Grid item xs={12} sm={6} md={4} key={form.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {form.title}
                    </Typography>
                    {form.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {form.description}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1.5, display: 'block' }}
                    >
                      {form._count.fields} field{form._count.fields !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/forms/${form.id}`}
                      variant="contained"
                      fullWidth
                    >
                      Fill Out Form
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  )
}
