import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import dashboardService from './dashboardService'

const initialState = {
    stats: null,
    salesGraph: [],
    lowStockAlerts: [],
    adminStats: null,
    categorySales: null,
    paymentStats: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// Get Shop Stats
export const getShopStats = createAsyncThunk(
    'dashboard/getStats',
    async (dateRange, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await dashboardService.getShopStats(token, dateRange)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Get Sales Graph
export const getSalesGraph = createAsyncThunk(
    'dashboard/getGraph',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await dashboardService.getSalesGraph(token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Get Low Stock Alerts
export const getLowStockAlerts = createAsyncThunk(
    'dashboard/getAlerts',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await dashboardService.getLowStockAlerts(token)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Get Super Admin Stats
export const getSuperAdminStats = createAsyncThunk(
    'dashboard/getSuperAdminStats',
    async (shopId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await dashboardService.getSuperAdminStats(token, shopId)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Get Category Sales
export const getCategorySales = createAsyncThunk(
    'dashboard/getCategorySales',
    async (dateRange, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await dashboardService.getCategorySales(token, dateRange)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Get Payment Stats
export const getPaymentStats = createAsyncThunk(
    'dashboard/getPaymentStats',
    async (dateRange, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await dashboardService.getPaymentStats(token, dateRange)
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getShopStats.pending, (state) => { state.isLoading = true })
            .addCase(getShopStats.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.stats = action.payload
            })
            .addCase(getShopStats.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getSalesGraph.fulfilled, (state, action) => {
                state.salesGraph = action.payload
            })
            .addCase(getLowStockAlerts.fulfilled, (state, action) => {
                state.lowStockAlerts = action.payload
            })
            .addCase(getSuperAdminStats.fulfilled, (state, action) => {
                state.adminStats = action.payload
            })
            .addCase(getCategorySales.fulfilled, (state, action) => {
                state.categorySales = action.payload
            })
            .addCase(getPaymentStats.fulfilled, (state, action) => {
                state.paymentStats = action.payload
            })
    },
})

export const { reset } = dashboardSlice.actions
export default dashboardSlice.reducer
