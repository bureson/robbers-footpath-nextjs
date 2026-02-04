import { CircularProgress, Grid } from '@mui/material';

export default function LoadingSpinner () {
  return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{
          minHeight: '100vh'
        }}>
          <CircularProgress />
      </Grid>
    );
}