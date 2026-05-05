import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Box,
  Chip, Rating, Divider, Grid, Skeleton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { fetchProductById, clearSelectedProduct } from '../store/slices/productsSlice';

export default function ProductDetailModal({ productId, onClose }) {
  const dispatch = useDispatch();
  const { selectedProduct } = useSelector((s) => s.products);

  useEffect(() => {
    if (productId) dispatch(fetchProductById(productId));
    else dispatch(clearSelectedProduct());
  }, [productId, dispatch]);

  const p = selectedProduct;
  const formatCurrency = (v) => v != null ? `₹${Number(v).toLocaleString()}` : '—';
  const formatPct = (v) => v != null ? `${Math.round(v * 100)}%` : '—';

  return (
    <Dialog open={!!productId} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" sx={{ pr: 4 }}>
            {p ? p.product_name : <Skeleton width={300} />}
          </Typography>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {!p ? (
          <Box><Skeleton height={40} /><Skeleton height={100} /><Skeleton height={60} /></Box>
        ) : (
          <Box>
            {/* Price & Rating */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Price</Typography>
                <Typography variant="h6" color="primary.main" fontWeight={700}>{formatCurrency(p.discounted_price)}</Typography>
                {p.actual_price && (
                  <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                    {formatCurrency(p.actual_price)}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Discount</Typography>
                <Box mt={0.5}><Chip label={formatPct(p.discount_percentage)} color="success" /></Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Rating</Typography>
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <Rating value={parseFloat(p.rating) || 0} precision={0.1} readOnly size="small" />
                  <Typography variant="body2">{p.rating}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">Reviews</Typography>
                <Typography variant="h6">{Number(p.rating_count || 0).toLocaleString()}</Typography>
              </Grid>
            </Grid>

            {/* Categories */}
            <Typography variant="subtitle2" color="text.secondary" mb={1}>Categories</Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
              {(p.categories || []).map((c) => (
                <Chip key={c.id} label={c.name} size="small"
                  color={c.is_primary ? 'primary' : 'default'} variant={c.is_primary ? 'filled' : 'outlined'} />
              ))}
            </Box>

            {/* About */}
            {p.about_product && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1}>About this Product</Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {p.about_product.split('|').map((line, i) => (
                    <Typography component="li" key={i} variant="body2" mb={0.5}>{line.trim()}</Typography>
                  ))}
                </Box>
              </>
            )}

            {/* Reviews */}
            {p.reviews?.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Customer Reviews ({p.reviews.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {p.reviews.slice(0, 8).map((r, i) => (
                    <Box key={r.id || i} mb={1.5} sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>{r.user_name}</Typography>
                      {r.review_title && (
                        <Typography variant="body2" color="primary.main">{r.review_title}</Typography>
                      )}
                      {r.review_content && !r.review_content.startsWith('http') && (
                        <Typography variant="body2" color="text.secondary">{r.review_content}</Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
