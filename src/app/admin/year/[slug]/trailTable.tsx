import { Box, Card, IconButton, Paper, Table, TableContainer, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import Edit from '@mui/icons-material/Edit';

import ConfirmDialog from '../../../components/confirmDialog';
import supabase from '../../../lib/supabaseClient';

export default function TrailTable (props: any) {
  const { trailList, onEdit, onDelete } = props;
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
                <TableCell>Distance (km)</TableCell>
                <TableCell>Elevation (m)</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trailList.map((trail: any) => {
                const onEditTrail = () => onEdit(trail.id);
                const onDeleteTrail = () => onDelete(trail.id);
                return (
                  <TableRow key={trail.id} hover={true}>
                    <TableCell>{trail.title}</TableCell>
                    <TableCell>{trail.description}</TableCell>
                    <TableCell>{trail.distance}</TableCell>
                    <TableCell>{trail.elevation}</TableCell>
                    <TableCell style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <IconButton onClick={onEditTrail} size='small'>
                        <Edit />
                      </IconButton>
                      <ConfirmDialog onConfirm={onDeleteTrail} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>}
    </Box>
  )
}