import Box from '@mui/material/Box';
import { DataGrid, GridToolbarContainer, GridToolbarExport} from '@mui/x-data-grid';

const columns = [
  { field: 'name', headerName: 'Name', width: 300 },
  { field: 'email', headerName: 'Email', width: 300 },
];

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
}

export default function EmailTable({ list, handle, loading }) {

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
        components={{
          Toolbar: CustomToolbar,
        }}
        loading={loading}
      />
    </Box>
  )
}