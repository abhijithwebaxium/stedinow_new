import { useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  Paper,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

/**
 * DataTable Component - A reusable table with pagination, search, sort, and filter
 *
 * @param {Array} columns - Array of column definitions
 *   Example: [{ id: 'name', label: 'Name', sortable: true, filterable: true, render: (value, row) => value }]
 * @param {Array} data - Array of data objects
 * @param {Boolean} loading - Loading state
 * @param {String} searchPlaceholder - Search input placeholder
 * @param {Array} filterFields - Array of filter field definitions
 *   Example: [{ id: 'status', label: 'Status', options: ['Active', 'Inactive'] }]
 */
function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search...',
  filterFields = [],
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sorting
  const handleRequestSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page on search
  };

  // Handle filter
  const handleFilterChange = (filterId, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
    setPage(0); // Reset to first page on filter
  };

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((row) => {
        return columns.some((column) => {
          if (!column.searchable && column.searchable !== undefined) return false;
          const value = row[column.id];
          if (value === null || value === undefined) return false;

          // Handle nested objects (e.g., assigned.counselor.name)
          if (column.id.includes('.')) {
            const keys = column.id.split('.');
            let nestedValue = row;
            for (const key of keys) {
              nestedValue = nestedValue?.[key];
              if (nestedValue === undefined || nestedValue === null) break;
            }
            return String(nestedValue).toLowerCase().includes(searchTerm.toLowerCase());
          }

          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply column filters
    Object.keys(filters).forEach((filterId) => {
      const filterValue = filters[filterId];
      if (filterValue && filterValue !== 'all') {
        filtered = filtered.filter((row) => {
          const value = row[filterId];
          // Handle nested objects
          if (filterId.includes('.')) {
            const keys = filterId.split('.');
            let nestedValue = row;
            for (const key of keys) {
              nestedValue = nestedValue?.[key];
              if (nestedValue === undefined || nestedValue === null) break;
            }
            return nestedValue === filterValue;
          }
          return value === filterValue;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle nested objects
      if (orderBy.includes('.')) {
        const keys = orderBy.split('.');
        aValue = a;
        bValue = b;
        for (const key of keys) {
          aValue = aValue?.[key];
          bValue = bValue?.[key];
        }
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredData, orderBy, order]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  return (
    <Box>
      {/* Search and Filter Bar */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          sx={{ minWidth: 300, flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {filterFields.length > 0 && (
          <Stack direction="row" spacing={2} alignItems="center">
            <FilterListIcon color="action" />
            {filterFields.map((filter) => (
              <FormControl key={filter.id} size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={filters[filter.id] || 'all'}
                  label={filter.label}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  {filter.options.map((option) => (
                    <MenuItem key={option.value || option} value={option.value || option}>
                      {option.label || option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Stack>
        )}
      </Box>

      {/* Active Filters Display */}
      {Object.keys(filters).some(key => filters[key] && filters[key] !== 'all') && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.keys(filters).map((filterId) => {
            const filterValue = filters[filterId];
            if (!filterValue || filterValue === 'all') return null;

            const filterField = filterFields.find(f => f.id === filterId);
            return (
              <Chip
                key={filterId}
                label={`${filterField?.label}: ${filterValue}`}
                onDelete={() => handleFilterChange(filterId, 'all')}
                size="small"
                color="primary"
                variant="outlined"
              />
            );
          })}
        </Box>
      )}

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sx={{ fontWeight: 600 }}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : 'asc'}
                        onClick={() => handleRequestSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || Object.keys(filters).some(k => filters[k] && filters[k] !== 'all')
                        ? 'No results found for your search or filter criteria.'
                        : 'No data available.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow
                    key={row._id || row.id || rowIndex}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.render
                          ? column.render(row[column.id], row)
                          : row[column.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={sortedData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showFirstButton
          showLastButton
        />
      </Paper>
    </Box>
  );
}

export default DataTable;
