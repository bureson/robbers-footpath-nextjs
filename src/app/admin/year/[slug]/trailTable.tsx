import { Box, Card, IconButton, Paper, Table, TableContainer, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import Edit from '@mui/icons-material/Edit';

import ConfirmDialog from '../../../components/confirmDialog';

export default function TrailTable (props: any) {
  const { trailList, onEdit, onDelete, onSelect } = props;
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
                <TableCell>Participants</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trailList.map((trail: any) => {
                const onSelectTrail = () => onSelect?.(trail.id);
                const onEditTrail = (ev: any) => {
                  ev.stopPropagation();
                  onEdit(trail.id);
                };
                const onDeleteTrail = () => onDelete(trail.id);
                return (
                  <TableRow key={trail.id} hover={true} onClick={onSelectTrail} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
                    <TableCell>{trail.title}</TableCell>
                    <TableCell>{trail.description}</TableCell>
                    <TableCell>{trail.distance}</TableCell>
                    <TableCell>{trail.elevation}</TableCell>
                    <TableCell>{trail.participant_count ?? '-'}</TableCell>
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
