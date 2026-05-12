import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const BasicDataGrid = ({ columns, rows, checkbox = false, length = 10, getRowHeight }) => {
  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <DataGrid
        checkboxSelection={checkbox}
        rows={rows}
        getRowHeight={getRowHeight}
        columns={columns}
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
        }
        initialState={{
          pagination: {
            paginationModel: { pageSize: length },
          },
        }}
        scrollbarSize={0}
        pageSizeOptions={[10, 15, 20, 50, 100]}
        slots={{
          toolbar: GridToolbar
        }}
        density="compact"
        disableRowSelectionOnClick
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: {
              debounceMs: 500,
              placeholder: 'Search...'
            },
            printOptions: { disableToolbarButton: false },
            csvOptions: { disableToolbarButton: false },
          },
        }}
        sx={{
          '& .even': {
            backgroundColor: 'action.hover',
          },
          '& .odd': {
            backgroundColor: 'background.paper',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: 2,
            gap: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'action.hover',
            fontWeight: 600,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 1,
            borderColor: 'divider',
          },
        }}
      />
    </Box>
  );
};

export default BasicDataGrid;
