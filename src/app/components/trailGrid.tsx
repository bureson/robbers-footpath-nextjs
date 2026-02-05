import { useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Box, Button, Dialog, DialogContent, Grid, IconButton } from '@mui/material';
import Close from '@mui/icons-material/Close';
import Download from '@mui/icons-material/Download';
import Map from '@mui/icons-material/Map';

const GpxMap = dynamic(() => import('./gpxMap'), { ssr:false })

export default function TrailGrid (props: any) {
  const { trailList } = props;
  const [open, setOpen] = useState(false);
  const [trail, setTrail] = useState<any>({});
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
          <GpxMap gpxUrl={trail.gpxFileUrl} />
        </DialogContent>
      </Dialog>
      {trailList.length === 0 && <Box className="text-center py-10">
        <h3 className="text-xl font-semibold text-gray-500">Pro aktuální ročník nejsou zatím žádné trasy k dispozici. Zveřejněny budou během několika následujících dní!</h3>
      </Box>}
      {trailList.map((trail: any) => {
        const onViewMap = () => {
          setOpen(true);
          setTrail(trail);
        };
        return (
          <Box key={trail.id} className='group trail-card relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 transform hover:translate-y-[-8px] hover:shadow-xl'>
            <Box className='flex flex-col p-6 space-y-4 h-full'>
              <Box className='flex items-center space-x-2'>
                <h3 className='text-2xl font-semibold text-gray-800'>{trail.title}</h3>
                <Box className='flex items-center text-sm text-gray-600 ml-auto'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-trending-up w-4 h-4'>
                    <polyline points='22 7 13.5 15.5 8.5 10.5 2 17'></polyline>
                    <polyline points='16 7 22 7 22 13'></polyline>
                  </svg>
                  <span className='ml-2'>{trail.elevation} m</span>
                </Box>
              </Box>
              <p className='text-sm text-gray-600 text-justify'>{trail.description}</p>
              <Box className='mt-auto flex space-x-4 mt-4'>
                <Grid container spacing={2} style={{ width: '100%' }}>
                  <Grid size={4}>
                    <Button
                      variant='outlined'
                      href={`${trail.gpxFileUrl}?download=1`}
                      startIcon={<Download />}
                      className='w-full bg-blue-600 text-white text-center py-2 rounded-lg transition duration-300 hover:bg-blue-700'
                    >
                      GPX
                    </Button>
                  </Grid>
                  <Grid size={8}>
                    <Button
                      variant='contained'
                      onClick={onViewMap}
                      className='w-full bg-gray-600 text-white text-center py-2 rounded-lg transition duration-300 hover:bg-gray-700'
                      startIcon={<Map />}
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