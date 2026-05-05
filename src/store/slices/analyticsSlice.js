import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const fetchSummary = createAsyncThunk('analytics/summary', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/analytics/summary'); return data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchCategoryStats = createAsyncThunk('analytics/categoryStats', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/analytics/category-stats'); return data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchTopReviewed = createAsyncThunk('analytics/topReviewed', async (limit = 10, { rejectWithValue }) => {
  try { const { data } = await api.get('/analytics/top-reviewed', { params: { limit } }); return data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchDiscountDistribution = createAsyncThunk('analytics/discountDist', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/analytics/discount-distribution'); return data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchProductsPerCategory = createAsyncThunk('analytics/productsPerCategory', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/analytics/products-per-category'); return data.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    summary: null,
    categoryStats: [],
    topReviewed: [],
    discountDistribution: [],
    productsPerCategory: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending = (s) => { s.loading = true; s.error = null; };
    const rejected = (s, a) => { s.loading = false; s.error = a.payload; };
    builder
      .addCase(fetchSummary.pending, pending)
      .addCase(fetchSummary.fulfilled, (s, a) => { s.loading = false; s.summary = a.payload; })
      .addCase(fetchSummary.rejected, rejected)
      .addCase(fetchCategoryStats.fulfilled, (s, a) => { s.categoryStats = a.payload; })
      .addCase(fetchTopReviewed.fulfilled, (s, a) => { s.topReviewed = a.payload; })
      .addCase(fetchDiscountDistribution.fulfilled, (s, a) => { s.discountDistribution = a.payload; })
      .addCase(fetchProductsPerCategory.fulfilled, (s, a) => { s.productsPerCategory = a.payload; });
  },
});

export default analyticsSlice.reducer;
