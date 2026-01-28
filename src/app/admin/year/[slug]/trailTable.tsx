import { Box, Card, Paper, Table, TableContainer, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

export default function TrailTable (props: any) {
  const { trailList } = props;
  return (
    <Box>
      {trailList.length === 0
      ? <Card style={{ marginTop: 15 }}>
          <Box p={2}>
            <Typography>No trails available</Typography>
          </Box>
        </Card>
      : <TableContainer component={Paper} style={{ marginTop: 15 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Distance</TableCell>
                <TableCell>Elevation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trailList.map((trail: any) => {
                return (
                  <TableRow key={trail.id} hover={true}>
                    <TableCell>{trail.title}</TableCell>
                    <TableCell>{trail.description}</TableCell>
                    <TableCell>{trail.distance}</TableCell>
                    <TableCell>{trail.elevation}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>}
    </Box>
  )
}