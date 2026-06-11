'use client';

import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material';
import Download from '@mui/icons-material/Download';
import Groups from '@mui/icons-material/Groups';
import Landscape from '@mui/icons-material/Landscape';
import Map from '@mui/icons-material/Map';
import Route from '@mui/icons-material/Route';

function StatBox (props: any) {
  const { icon, label, value } = props;

  return (
    <Paper variant='outlined' sx={{ p: 2, height: '100%', borderRadius: 2 }}>
      <Box display='flex' alignItems='center' gap={1.5}>
        <Box sx={{ color: '#0a580a', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant='body2' color='text.secondary'>{label}</Typography>
          <Typography variant='h6'>{value}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function TrailDetailPage (props: any) {
  const { trail, year, GpxMap } = props;
  const participantCount = trail.participant_count;

  return (
    <Box mt={2}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display='flex' justifyContent='space-between' gap={2} flexWrap='wrap'>
          <Box>
            <Box display='flex' alignItems='center' gap={1} mb={1}>
              <Typography variant='h4' component='h1' fontWeight={700}>{trail.title}</Typography>
              <Chip size='small' label={trail.type === 'cycling' ? 'Cycling' : 'Hiking'} color='success' variant='outlined' />
            </Box>
            <Typography color='text.secondary'>Year {year.year}</Typography>
          </Box>
          {trail.gpxFileUrl && (
            <Button variant='outlined' href={`${trail.gpxFileUrl}?download=1`} startIcon={<Download />} sx={{ alignSelf: 'flex-start' }}>
              Download GPX
            </Button>
          )}
        </Box>

        <Typography mt={3} whiteSpace='pre-line'>{trail.description}</Typography>

        <Grid container spacing={2} mt={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatBox icon={<Route />} label='Distance' value={`${trail.distance} km`} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatBox icon={<Landscape />} label='Elevation' value={`${trail.elevation} m`} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatBox icon={<Groups />} label='Participants' value={participantCount == null ? '-' : participantCount} />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ mt: 2, p: 3, borderRadius: 2 }}>
        <Box display='flex' alignItems='center' gap={1} mb={2}>
          <Map sx={{ color: '#0a580a' }} />
          <Typography variant='h5' component='h2' fontWeight={700}>Route map</Typography>
        </Box>
        <Box sx={{ height: { xs: 360, md: 560 }, overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          {trail.gpxFileUrl ? <GpxMap gpxUrl={trail.gpxFileUrl} /> : (
            <Box display='flex' alignItems='center' justifyContent='center' height='100%'>
              <Typography color='text.secondary'>No GPX file available</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
