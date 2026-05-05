import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import {
  Box, Card, CardContent, Typography, Button, LinearProgress,
  Alert, Table, TableHead, TableBody, TableRow, TableCell,
  Chip, List, ListItem, ListItemText,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { uploadFile, fetchImportLogs, clearResult } from '../store/slices/importSlice';
import { fetchSummary, fetchCategoryStats, fetchTopReviewed, fetchDiscountDistribution, fetchProductsPerCategory } from '../store/slices/analyticsSlice';

const STATUS_COLORS = { completed: 'success', failed: 'error', processing: 'warning', pending: 'default' };

export default function ImportPage() {
  const dispatch = useDispatch();
  const { loading, error, lastResult, logs } = useSelector((s) => s.import);
  const [file, setFile] = useState(null);

  useEffect(() => { dispatch(fetchImportLogs()); }, [dispatch]);

  const onDrop = useCallback((accepted) => {
    if (accepted.length) { setFile(accepted[0]); dispatch(clearResult()); }
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
               'application/vnd.ms-excel': ['.xls'],
               'text/csv': ['.csv'] },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    await dispatch(uploadFile(file));
    setFile(null);
    dispatch(fetchImportLogs());
    // Refresh analytics after import
    dispatch(fetchSummary());
    dispatch(fetchCategoryStats());
    dispatch(fetchTopReviewed(10));
    dispatch(fetchDiscountDistribution());
    dispatch(fetchProductsPerCategory());
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>📥 Import Data</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>Upload Excel / CSV File</Typography>

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.50' : 'grey.50',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">
              {isDragActive ? 'Drop the file here…' : 'Drag & drop or click to upload'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports .xlsx, .xls, .csv — max 50 MB
            </Typography>
          </Box>

          {file && (
            <Alert severity="info" sx={{ mt: 2 }} icon={<CheckCircleIcon />}>
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </Alert>
          )}

          {loading && <LinearProgress sx={{ mt: 2 }} />}

          {error && <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>{error}</Alert>}

          {lastResult && (
            <Alert severity={lastResult.success ? 'success' : 'warning'} sx={{ mt: 2 }}>
              <Typography fontWeight={600}>{lastResult.message}</Typography>
              <Typography variant="body2">
                Total: {lastResult.data?.total} | Imported: {lastResult.data?.imported} | Failed: {lastResult.data?.failed}
              </Typography>
              {lastResult.data?.errors?.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption" fontWeight={600}>Errors (first 5):</Typography>
                  <List dense>
                    {lastResult.data.errors.slice(0,5).map((e, i) => (
                      <ListItem key={i} sx={{ py: 0 }}>
                        <ListItemText primary={`Row ${e.row}: ${e.reason}`} primaryTypographyProps={{ variant: 'caption' }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Alert>
          )}

          <Box mt={2} display="flex" gap={2}>
            <Button variant="contained" disabled={!file || loading} onClick={handleUpload}>
              {loading ? 'Importing…' : 'Import Now'}
            </Button>
            {file && <Button variant="outlined" onClick={() => setFile(null)}>Clear</Button>}
          </Box>
        </CardContent>
      </Card>

      {/* Import History */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Import History</Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 700 }}>Filename</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Imported</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Failed</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No imports yet</TableCell></TableRow>
              ) : logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.filename}</TableCell>
                  <TableCell>{log.total_rows ?? '—'}</TableCell>
                  <TableCell>{log.imported_rows ?? '—'}</TableCell>
                  <TableCell>{log.failed_rows ?? '—'}</TableCell>
                  <TableCell><Chip label={log.status} size="small" color={STATUS_COLORS[log.status] || 'default'} /></TableCell>
                  <TableCell>{new Date(log.started_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
