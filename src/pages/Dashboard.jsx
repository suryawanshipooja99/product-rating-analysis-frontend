import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Card, CardContent, Typography, Box, Skeleton, Chip,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend,
} from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import {
  fetchSummary,
  fetchCategoryStats,
  fetchTopReviewed,
  fetchDiscountDistribution,
  fetchProductsPerCategory,
} from '../store/slices/analyticsSlice';

const COLORS = ['#1976d2','#42a5f5','#9c27b0','#2e7d32','#ed6c02','#0288d1','#d32f2f','#7b1fa2','#1565c0','#558b2f'];

const SummaryCard = ({ icon, label, value, color, sub }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{ bgcolor: `${color}22`, borderRadius: 2, p: 1, display: 'flex' }}>
          {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
        </Box>
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h5" fontWeight={700}>{value ?? <Skeleton width={80} />}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1, p: 1.5, boxShadow: 2 }}>
      <Typography variant="body2" fontWeight={600}>{label}</Typography>
      {payload.map((p, i) => (
        <Typography key={i} variant="body2" color={p.color}>{p.name}: {Number(p.value).toLocaleString()}</Typography>
      ))}
    </Box>
  );
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const { summary, categoryStats, topReviewed, discountDistribution, productsPerCategory } =
    useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchCategoryStats());
    dispatch(fetchTopReviewed(10));
    dispatch(fetchDiscountDistribution());
    dispatch(fetchProductsPerCategory());
  }, [dispatch]);

  const summaryCards = [
    { icon: <InventoryIcon />, label: 'Total Products', value: summary?.total_products?.toLocaleString(), color: '#1976d2' },
    { icon: <CategoryIcon />, label: 'Total Categories', value: summary?.total_categories?.toLocaleString(), color: '#9c27b0' },
    { icon: <RateReviewIcon />, label: 'Total Reviews', value: summary?.total_reviews?.toLocaleString(), color: '#2e7d32' },
    { icon: <StarIcon />, label: 'Avg Rating', value: summary?.avg_rating, color: '#ed6c02' },
    { icon: <LocalOfferIcon />, label: 'Avg Discount', value: summary?.avg_discount ? `${Math.round(summary.avg_discount * 100)}%` : null, color: '#0288d1' },
    { icon: <TrendingUpIcon />, label: 'High Rated (≥4★)', value: summary?.high_rated_products?.toLocaleString(), color: '#d32f2f' },
  ];

  const shortName = (name = '', max = 20) => name.length > max ? name.slice(0, max) + '…' : name;

  return (
    <Box>
      <Typography variant="h4" mb={3}>📊 Analytics Dashboard</Typography>

      {/* Summary KPIs */}
      <Grid container spacing={2} mb={4}>
        {summaryCards.map((c) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={c.label}>
            <SummaryCard {...c} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>

        {/* Products per Category */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Products per Category</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productsPerCategory} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category_name" tick={{ fontSize: 11 }} tickFormatter={(v) => shortName(v, 15)} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="product_count" name="Products" radius={[4,4,0,0]}>
                    {productsPerCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Reviewed Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Top Reviewed Products</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topReviewed} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="product_name" width={120}
                    tick={{ fontSize: 10 }} tickFormatter={(v) => shortName(v, 18)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="rating_count" name="Reviews" fill="#1976d2" radius={[0,4,4,0]}>
                    {topReviewed.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Discount Histogram */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Discount Distribution</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={discountDistribution} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Products" fill="#9c27b0" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Category-wise Average Rating */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Category-wise Average Rating</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryStats.slice(0,10)} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category_name" tick={{ fontSize: 10 }} tickFormatter={(v) => shortName(v, 14)} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg_rating" name="Avg Rating" radius={[4,4,0,0]}>
                    {categoryStats.slice(0,10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}
