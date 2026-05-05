import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/client';

export const uploadFile = createAsyncThunk(
  'import/uploadFile',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchImportLogs = createAsyncThunk(
  'import/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/import/logs');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const importSlice = createSlice({
  name: 'import',
  initialState: { logs: [], loading: false, error: null, lastResult: null },
  reducers: { clearResult(s) { s.lastResult = null; s.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (s) => { s.loading = true; s.error = null; s.lastResult = null; })
      .addCase(uploadFile.fulfilled, (s, a) => { s.loading = false; s.lastResult = a.payload; })
      .addCase(uploadFile.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchImportLogs.fulfilled, (s, a) => { s.logs = a.payload; });
  },
});

export const { clearResult } = importSlice.actions;
export default importSlice.reducer;
