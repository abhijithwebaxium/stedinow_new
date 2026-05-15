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
  Paper,
  Typography,
  Stack,
  Button,
  Badge,
  Checkbox,
  Tooltip,
  Zoom,
  Skeleton,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { alpha, useTheme } from '@mui/material/styles';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useEffect } from 'react';
import CustomDropdown from './customComponents/CustomDropdown';
import BasicMenu from './customComponents/BasicMenu';
import CustomComboBox from './customComponents/CustomComboBox';
import CustomInput from './customComponents/CustomInput';
import MenuButton from './customComponents/MenuButton';
import { brand, gray } from '../theme/shared/themePrimitives';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.secondary,
  padding: '10px 0',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}));

const label = { inputProps: { 'aria-label': 'Checkbox' } };

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: (theme.vars || theme).palette.mode === 'dark' 
      ? alpha(brand[400], 0.05) 
      : alpha(brand[400], 0.02),
    '& td': {
      color: brand[500],
    }
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px 20px',
  borderBottom: `1px solid ${alpha(gray[300], 0.1)}`,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
  '& th': {
    padding: '20px',
    backgroundColor: (theme.vars || theme).palette.mode === 'dark'
      ? alpha('#121214', 0.8)
      : alpha(theme.palette.background.paper, 0.5),
    color: (theme.vars || theme).palette.text.secondary,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontSize: '0.7rem',
    borderBottom: `2px solid ${alpha(gray[300], 0.2)}`,
  },
}));

const StyledPagination = styled(TablePagination)(({ theme }) => ({
  borderTop: `1px solid ${alpha(gray[300], 0.1)}`,
  '& .MuiTablePagination-toolbar': {
    padding: '12px 24px',
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

/**
 * AdvancedDataTable Component
 *
 * Features:
 * - Column visibility toggle
 * - Multi-filter with dynamic filter rows
 * - Export to CSV
 * - Sort by various fields
 * - Pagination
 *
 * @param {Array} columns - Column definitions with field, headerName
 * @param {Array} data - Data rows
 * @param {Boolean} loading - Loading state
 * @param {Array} filterOptions - Available filter field options
 * @param {Array} sortOptions - Available sort options
 * @param {Function} onExportCSV - Callback for CSV export
 */
function AdvancedDataTable({
  columns = [],
  data = [],
  loading = false,
  filterOptions = [],
  sortOptions = [],
  onExportCSV,
  bulkActions = [], // [{ label, icon, onClick(selectedIds) }]
}) {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filteredColumns, setFilteredColumns] = useState(columns);
  const [filters, setFilters] = useState([{ id: 1, filter: '', value: '' }]);
  const [sort, setSort] = useState(null);
  const [triggerClose, setTriggerClose] = useState(false);
  const [columnSearch, setColumnSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');

  // Load presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stedinow_table_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse presets', e);
      }
    }
  }, []);

  const savePresets = (newPresets) => {
    setPresets(newPresets);
    localStorage.setItem('stedinow_table_presets', JSON.stringify(newPresets));
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const activeFilters = filters.filter(f => f.filter && f.value);
    if (activeFilters.length === 0) return;

    const newPreset = {
      id: Date.now(),
      name: presetName.trim(),
      filters: activeFilters,
      columns: filteredColumns.map(c => ({ field: c.field, hidden: !!c.hidden })),
      sort
    };

    savePresets([...presets, newPreset]);
    setPresetName('');
  };

  const handleApplyPreset = (p) => {
    setFilters(p.filters.length > 0 ? p.filters : [{ id: 1, filter: '', value: '' }]);
    if (p.columns) {
      setFilteredColumns(prev => prev.map(col => {
        const savedCol = p.columns.find(sc => sc.field === col.field);
        return savedCol ? { ...col, hidden: savedCol.hidden } : col;
      }));
    }
    if (p.sort !== undefined) setSort(p.sort);
    setTriggerClose(!triggerClose);
  };

  const handleDeletePreset = (id) => {
    savePresets(presets.filter(p => p.id !== id));
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(paginatedData.map(r => r._id || r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickCheckBox = ({ target: { checked, name } }) => {
    setFilteredColumns((prev) =>
      prev.map((entry) => {
        if (entry.field === name) {
          return {
            ...entry,
            hidden: !checked,
          };
        }
        return entry;
      })
    );
  };

  const handleAddFilterRow = () => {
    const randomNumber = Math.floor(Math.random() * 1000);
    const newFilter = {
      id: randomNumber,
      filter: '',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const handleRemoveFilter = (id) => {
    if (filters.length === 1) {
      setFilters([{ id: 1, filter: '', value: '' }]);
      return setTriggerClose(!triggerClose);
    }
    setFilters((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleRemoveAllFilterRow = () => {
    setFilters([{ id: 1, filter: '', value: '' }]);
  };

  const handleChangeFilterStatus = ({ target: { value } }, id) => {
    setFilters((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            filter: value,
          };
        }
        return entry;
      })
    );
  };

  const handleChangeFilterValue = ({ target: { value, label } }, id) => {
    setFilters((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            value,
            label,
          };
        }
        return entry;
      })
    );
  };

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    filters.forEach((filter) => {
      if (filter.filter && filter.value) {
        filtered = filtered.filter((row) => {
          const fieldValue = filter.filter.includes('.')
            ? filter.filter.split('.').reduce((obj, key) => obj?.[key], row)
            : row[filter.filter];

          if (fieldValue === null || fieldValue === undefined) return false;

          return String(fieldValue).toLowerCase().includes(String(filter.value || '').toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, filters]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = sort.includes('.')
        ? sort.split('.').reduce((obj, key) => obj?.[key], a)
        : a[sort];
      const bValue = sort.includes('.')
        ? sort.split('.').reduce((obj, key) => obj?.[key], b)
        : b[sort];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    });
  }, [filteredData, sort]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Filter columns based on search
  const searchedColumns = useMemo(() => {
    if (!columnSearch) return filteredColumns;
    return filteredColumns.filter((col) =>
      col.headerName.toLowerCase().includes(columnSearch.toLowerCase())
    );
  }, [filteredColumns, columnSearch]);

  // Column visibility content
  const columnContent = (
    <>
      <Box px={3} py={1.5}>
        <CustomInput
          placeholder={'Search columns'}
          value={columnSearch}
          onChange={(e) => setColumnSearch(e.target.value)}
          startIcon={<SearchIcon />}
          iconSx={{ left: '12px', top: '8px' }}
        />
      </Box>
      <Stack px={3} pb={1.5} maxHeight={'300px'} overflow={'auto'}>
        {searchedColumns?.map((entry, idx) => (
          <Item key={idx}>
            <Checkbox
              {...label}
              defaultChecked={!entry.hidden}
              sx={{ p: 1, m: 0 }}
              onChange={handleClickCheckBox}
              name={entry.field}
            />
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {entry.headerName}
            </Typography>
          </Item>
        ))}
      </Stack>
    </>
  );

  // Filter content
  const FilterContent = (
    <>
      {filters?.map((entry) => (
        <Stack
          key={entry.id}
          p={1}
          direction={'row'}
          alignItems={'center'}
          gap={1}
        >
          <MenuButton onClick={() => handleRemoveFilter(entry.id)}>
            <ClearIcon />
          </MenuButton>

          <Box sx={{ flexGrow: 1 }}>
            <CustomComboBox
              name={'combobox'}
              placeholder={'Select Filter'}
              data={filterOptions?.map((value) => ({
                label: typeof value === 'string' ? value : value.label,
                value: typeof value === 'string' ? value : value.value,
              }))}
              defaultValue={
                entry?.filter ? { label: entry.filter, value: entry.value } : ''
              }
              onChange={(e) => handleChangeFilterStatus(e, entry.id)}
            />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <CustomInput
              placeholder={'Filter Value'}
              name={'filterValue'}
              value={entry.value}
              onChange={(e) => handleChangeFilterValue(e, entry.id)}
            />
          </Box>
        </Stack>
      ))}

      <Box borderTop={`1px solid ${theme.palette.divider}`} p={1}>
        <Stack direction={'row'} spacing={2}>
          <Button
            variant="text"
            startIcon={<AddIcon />}
            sx={{ height: '2.25rem' }}
            onClick={() => handleAddFilterRow()}
          >
            Add Filter
          </Button>
          <Button
            variant="text"
            startIcon={<DeleteIcon />}
            sx={{ height: '2.25rem' }}
            onClick={() => handleRemoveAllFilterRow()}
          >
            Remove All
          </Button>
          <Button
            variant="text"
            startIcon={<FilterAltIcon />}
            sx={{ height: '2.25rem' }}
          >
            Apply Filter
          </Button>
        </Stack>
      </Box>
    </>
  );

  // Export options
  const exportContent = [
    {
      label: 'Download as CSV',
      onClick: () => {
        if (onExportCSV) {
          onExportCSV(sortedData);
        }
      },
    },
    {
      label: 'Print',
      onClick: () => {
        window.print();
      },
    },
  ];

  // Sort content
  const sortContent = sortOptions.map((option) => ({
    label: option.label,
    onClick: () => setSort(option.value),
  }));

  // Presets content
  const presetContent = (
    <Box sx={{ minWidth: 280 }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'text.secondary' }}>
          Save Current Filter as Preset
        </Typography>
        <Stack direction="row" spacing={1}>
          <CustomInput 
            placeholder="Preset Name" 
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button 
            variant="contained" 
            size="small" 
            onClick={handleSavePreset}
            disabled={!presetName.trim() || filters.every(f => !f.value)}
            sx={{ minWidth: 40, p: 0 }}
          >
            <AddIcon />
          </Button>
        </Stack>
      </Box>
      <Stack sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
        {presets.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}>
            No saved presets
          </Typography>
        ) : (
          presets.map(p => (
            <Box 
              key={p.id} 
              sx={{ 
                p: 1, borderRadius: '8px', 
                display: 'flex', alignItems: 'center', 
                '&:hover': { bgcolor: alpha(theme.palette.divider, 0.05) } 
              }}
            >
              <Typography 
                variant="body2" 
                onClick={() => handleApplyPreset(p)}
                sx={{ flex: 1, cursor: 'pointer', fontWeight: 600, color: 'text.primary' }}
              >
                {p.name}
              </Typography>
              <IconButton size="small" color="error" onClick={() => handleDeletePreset(p.id)} sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );

  return (
    <TableContainer
      component={Box}
      sx={{
        bgcolor: 'transparent',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          py: 2,
          px: 3,
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: (theme.vars || theme).palette.mode === 'dark'
            ? alpha('#121214', 0.5)
            : alpha(theme.palette.background.paper, 0.2)
        }}
      >
        <CustomDropdown
          buttonText={'Columns'}
          sx={{ padding: '8px 12px', height: '2.25rem', fontSize: '13px' }}
          startIcon={<ViewColumnIcon sx={{ fontSize: '18px !important' }} />}
          menuSx={{
            top: '60px !important',
            minWidth: '300px',
            maxHeight: '450px',
          }}
          content={columnContent}
        />
        <CustomDropdown
          buttonText={'Filters'}
          sx={{ padding: '8px 12px', height: '2.25rem', fontSize: '13px' }}
          startIcon={
            <Badge
              badgeContent={
                filters.filter((entry) => entry.value !== '').length
              }
              color="primary"
            >
              <FilterListIcon />
            </Badge>
          }
          menuSx={{
            top: '60px !important',
            minWidth: '395px',
          }}
          content={FilterContent}
          triggerClose={triggerClose}
        />
        {onExportCSV && (
          <BasicMenu
            buttonText={'Export'}
            sx={{ padding: '8px 12px', height: '2.25rem', fontSize: '13px' }}
            startIcon={<SaveAltIcon sx={{ fontSize: '18px !important' }} />}
            menuSx={{ top: '146px !important' }}
            data={exportContent}
          />
        )}
        {sortOptions.length > 0 && (
          <BasicMenu
            buttonText={'Sort'}
            sx={{ padding: '8px 12px', height: '2.25rem', fontSize: '13px' }}
            startIcon={<SwapVertIcon sx={{ fontSize: '18px !important' }} />}
            menuSx={{ top: '146px !important' }}
            data={sortContent}
          />
        )}
        <CustomDropdown
          buttonText={'Presets'}
          sx={{ padding: '8px 12px', height: '2.25rem', fontSize: '13px' }}
          startIcon={<BookmarkIcon sx={{ fontSize: '18px !important' }} />}
          menuSx={{
            top: '60px !important',
            minWidth: '280px',
          }}
          content={presetContent}
          triggerClose={triggerClose}
        />
      </Box>

      {/* Bulk action toolbar */}
      <Collapse in={selectedIds.size > 0}>
        <Box sx={{ px: 3, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.06), borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', flex: 1 }}>
            {selectedIds.size} selected
          </Typography>
          {bulkActions.map((action, i) => (
            <Button
              key={i}
              size="small"
              variant="outlined"
              startIcon={action.icon}
              onClick={() => { action.onClick(Array.from(selectedIds)); clearSelection(); }}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem' }}
            >
              {action.label}
            </Button>
          ))}
          <Button size="small" onClick={clearSelection} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary' }}>
            Clear
          </Button>
        </Box>
      </Collapse>

      <StyledTable aria-label="advanced data table">
        <TableHead>
          <StyledTableHeadRow>
            {bulkActions.length > 0 && (
              <TableCell padding="checkbox" sx={{ width: 48 }}>
                <Checkbox
                  size="small"
                  indeterminate={selectedIds.size > 0 && selectedIds.size < paginatedData.length}
                  checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
            )}
            {filteredColumns.map(
              (column) =>
                !column.hidden && (
                  <TableCell
                    key={column.headerName}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px',
                    }}
                  >
                    {column.headerName}
                  </TableCell>
                )
            )}
          </StyledTableHeadRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                {bulkActions.length > 0 && <TableCell padding="checkbox"><Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: '4px', mx: 'auto' }} /></TableCell>}
                {filteredColumns.filter(c => !c.hidden).map((col) => (
                  <StyledTableCell key={col.field}>
                    <Skeleton variant="text" width={`${60 + Math.random() * 30}%`} height={20} />
                  </StyledTableCell>
                ))}
              </TableRow>
            ))
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={filteredColumns.length + (bulkActions.length > 0 ? 1 : 0)} align="center" sx={{ py: 5 }}>
                <Typography variant="body2" color="text.secondary">
                  No data available.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, rowIndex) => {
              const rowId = row._id || row.id || rowIndex;
              const isSelected = selectedIds.has(rowId);
              return (
                <StyledTableRow
                  key={rowId}
                  selected={isSelected}
                  sx={isSelected ? { bgcolor: alpha(theme.palette.primary.main, 0.04) } : {}}
                >
                  {bulkActions.length > 0 && (
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={isSelected} onChange={() => handleSelectRow(rowId)} />
                    </TableCell>
                  )}
                  {filteredColumns.map(
                    (column) =>
                      !column.hidden && (
                        <StyledTableCell key={column.field}>
                          <Tooltip
                            title={column.render ? '' : row[column.field] || ''}
                            disableInteractive
                            slots={{ transition: Zoom }}
                          >
                            <StyledTypography component="span" noWrap>
                              {column.render
                                ? column.render(row[column.field], row)
                                : row[column.field]}
                            </StyledTypography>
                          </Tooltip>
                        </StyledTableCell>
                      )
                  )}
                </StyledTableRow>
              );
            })
          )}
        </TableBody>
      </StyledTable>

      <StyledPagination
        rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
}

export default AdvancedDataTable;
