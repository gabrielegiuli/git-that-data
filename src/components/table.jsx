import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'name', headerName: 'Name', width: 300 },
  { field: 'email', headerName: 'Email', width: 300 },
];

export default function EmailTable({ list, handle }) {

  const rows = list.map((committer, index) => {
    return {
      name: committer.name, 
      email: committer.email,
      id: index
    }
  })

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
        onSelectionModelChange={(ids) => handle(ids)}
      />
    </Box>
  )
}