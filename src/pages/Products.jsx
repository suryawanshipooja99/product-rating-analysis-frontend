import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, Typography, TextField, MenuItem, Select,
  FormControl, InputLabel, Grid, Chip, CircularProgress, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell, TablePagination,
  TableSortLabel, IconButton, Tooltip, Rating, LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from '@mui/icons-material/FilterList';
import { fetchProducts, fetchCategories, setFilters, setPage } from '../store/slices/productsSlice';
import ProductDetailModal from '../components/ProductDetailModal';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = React.useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
};

export default function Products() {
  const dispatch = useDispatch();
  const { items, pagination, filters, loading, categories } = useSelector((s) => s.products);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page: pagination.page, limit: pagination.limit }));
  }, [filters, pagination.page, dispatch]);

  const handleFilterChange = useCallback((key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPage(1));
  }, [dispatch]);

  const handleSort = (col) => {
    const dir = filters.sort_by === col && filters.sort_dir === 'asc' ? 'desc' : 'asc';
    dispatch(setFilters({ sort_by: col, sort_dir: dir }));
  };

  // Unique top-level categories for filter
  const topCategories = [...new Set(categories.filter(c => c.level === 0).map(c => c.name))];

  const formatCurrency = (v) => v != null ? `₹${Number(v).toLocaleString()}` : '—';
  const formatPct = (v) => v != null ? `${Math.round(v * 100)}%` : '—';

  return (
    <Box>
      <Typography variant="h4" mb={3}>🛍️ Products</Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth size="small" label="Search Products"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={filters.category} label="Category"
                  onChange={(e) => handleFilterChange('category', e.target.value)}>
                  <MenuItem value="">All Categories</MenuItem>
                  {topCategories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2} md={2}>
              <TextField fullWidth size="small" label="Min Rating" type="number"
                inputProps={{ min: 0, max: 5, step: 0.5 }} value={filters.min_rating}
                onChange={(e) => handleFilterChange('min_rating', e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={2} md={2}>
              <TextField fullWidth size="small" label="Max Rating" type="number"
                inputProps={{ min: 0, max: 5, step: 0.5 }} value={filters.max_rating}
                onChange={(e) => handleFilterChange('max_rating', e.target.value)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel active={filters.sort_by === 'product_name'}
                      direction={filters.sort_dir} onClick={() => handleSort('product_name')}>
                      Product Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Categories</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel active={filters.sort_by === 'discounted_price'}
                      direction={filters.sort_dir} onClick={() => handleSort('discounted_price')}>
                      Price
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel active={filters.sort_by === 'discount_percentage'}
                      direction={filters.sort_dir} onClick={() => handleSort('discount_percentage')}>
                      Discount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel active={filters.sort_by === 'rating'}
                      direction={filters.sort_dir} onClick={() => handleSort('rating')}>
                      Rating
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <TableSortLabel active={filters.sort_by === 'rating_count'}
                      direction={filters.sort_dir} onClick={() => handleSort('rating_count')}>
                      Reviews
                    </TableSortLabel>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && items.length === 0 ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}><Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1 }} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : items.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No products found</Typography>
                  </TableCell></TableRow>
                ) : items.map((row) => (
                  <TableRow key={row.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedProductId(row.id)}>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" fontWeight={500} noWrap title={row.product_name}>
                        {row.product_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap" maxWidth={200}>
                        {(row.categories || []).filter(c => c.is_primary).slice(0,2).map((c) => (
                          <Chip key={c.id} label={c.name} size="small" sx={{ fontSize: 10, maxWidth: 120 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{formatCurrency(row.discounted_price)}</Typography>
                      {row.actual_price && <Typography variant="caption" color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}>{formatCurrency(row.actual_price)}</Typography>}
                    </TableCell>
                    <TableCell>
                      {row.discount_percentage != null && (
                        <Chip label={formatPct(row.discount_percentage)} size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Rating value={parseFloat(row.rating) || 0} precision={0.1} readOnly size="small" />
                        <Typography variant="caption">{row.rating}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{Number(row.rating_count || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedProductId(row.id); }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1}
            rowsPerPage={pagination.limit}
            onPageChange={(_, p) => dispatch(setPage(p + 1))}
            rowsPerPageOptions={[10, 20, 50]}
            onRowsPerPageChange={(e) => {
              dispatch(setFilters({ limit: parseInt(e.target.value) }));
              dispatch(setPage(1));
            }}
          />
        </CardContent>
      </Card>

      <ProductDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />
    </Box>
  );
}
