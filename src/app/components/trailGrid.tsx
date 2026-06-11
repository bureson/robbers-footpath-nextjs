import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, Dialog, DialogContent, Grid, IconButton } from '@mui/material';
import Close from '@mui/icons-material/Close';
import Download from '@mui/icons-material/Download';
import Groups from '@mui/icons-material/Groups';
import Map from '@mui/icons-material/Map';
import TrendingUp from '@mui/icons-material/TrendingUp';

const GpxMap = dynamic(() => import('./gpxMap'), { ssr:false })

type Trail = {
  id: string | number;
  title: string;
  description: string;
  elevation: number;
  gpxFileUrl: string;
  participantCount?: number | null;
};

type TrailGridProps = {
  trailList: Trail[];
};

export default function TrailGrid (props: TrailGridProps) {
  const { trailList } = props;
  const [open, setOpen] = useState(false);
  const [trail, setTrail] = useState<Trail | null>(null);
  const onClose = () => setOpen(false);
  return (
    <Box className={trailList.length > 0 ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : ''}>
      <Dialog open={open} onClose={onClose} fullScreen>
        <DialogContent style={{ padding: 0, position: 'relative' }}>
          <IconButton onClick={onClose} size='large' sx={{
            backgroundColor: 'white',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1, // similar to Button
            boxShadow: 1,
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 999,
            '&:hover': {
              backgroundColor: 'grey.100',
              boxShadow: 2,
            },
          }}>
            <Close />
          </IconButton>
          {trail && <GpxMap gpxUrl={trail.gpxFileUrl} />}
        </DialogContent>
      </Dialog>
      {trailList.length === 0 && <Box className="text-center py-10">
        <h3 className="text-xl font-semibold text-gray-500">Pro aktuální ročník nejsou zatím žádné trasy k dispozici. Zveřejněny budou během několika následujících dní!</h3>
      </Box>}
      {trailList.map((trail: Trail) => {
        const onViewMap = () => {
          setOpen(true);
          setTrail(trail);
        };
        const participants = trail.participantCount;
        return (
          <Box key={trail.id} className='group trail-card relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 transform hover:translate-y-[-8px] hover:shadow-xl'>
            <Box className='flex flex-col p-6 space-y-4 h-full'>
              <Box className='flex items-center space-x-2'>
                <h3 className='text-2xl font-semibold text-gray-800'>{trail.title}</h3>
              </Box>
              <p className='text-sm leading-relaxed text-gray-600'>{trail.description}</p>
              <Box className='mt-auto space-y-3 border-t border-gray-200 pt-4'>
                <Box className={`${participants == null ? 'flex' : 'grid grid-cols-2'} gap-3 rounded-lg bg-white/70 p-3 shadow-inner`}>
                  <Box className='flex items-center gap-3 min-w-0'>
                    <Box className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-10 text-primary'>
                      <TrendingUp fontSize='small' />
                    </Box>
                    <Box className='min-w-0'>
                      <Box className='text-xs font-medium uppercase tracking-wide text-gray-500'>Převýšení</Box>
                      <Box className='text-lg font-semibold leading-tight text-gray-800'>{trail.elevation} m</Box>
                    </Box>
                  </Box>
                  {participants != null && (
                    <Box className='flex items-center gap-3 min-w-0'>
                      <Box className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-10 text-primary'>
                        <Groups fontSize='small' />
                      </Box>
                      <Box className='min-w-0'>
                        <Box className='text-xs font-medium uppercase tracking-wide text-gray-500'>Účast</Box>
                        <Box className='text-lg font-semibold leading-tight text-gray-800'>{participants}</Box>
                      </Box>
                    </Box>
                  )}
                </Box>
                <Grid container spacing={2} style={{ width: '100%' }}>
                  <Grid size={4}>
                    <Button
                      variant='outlined'
                      href={`${trail.gpxFileUrl}?download=1`}
                      startIcon={<Download />}
                      fullWidth
                      sx={{
                        height: 44,
                        borderRadius: 2,
                        borderColor: '#0a580a',
                        color: '#0a580a',
                        fontWeight: 700,
                        textTransform: 'none',
                        backgroundColor: 'white',
                        '&:hover': {
                          borderColor: '#074407',
                          backgroundColor: '#e5e9e4',
                        },
                      }}
                    >
                      GPX
                    </Button>
                  </Grid>
                  <Grid size={8}>
                    <Button
                      variant='contained'
                      onClick={onViewMap}
                      fullWidth
                      startIcon={<Map />}
                      sx={{
                        height: 44,
                        borderRadius: 2,
                        backgroundColor: '#0a580a',
                        boxShadow: 'none',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#074407',
                          boxShadow: 2,
                        },
                      }}
                    >
                      Mapa trasy
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  )
}
