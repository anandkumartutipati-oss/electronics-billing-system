import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import emiService from './emiService'

const initialState = {
    emis: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// Get all EMIs
export const getEMIs = createAsyncThunk(
    'emi/getAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await emiService.getEMIs(token)
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

// Pay EMI
export const payEMI = createAsyncThunk(
    'emi/pay',
    async ({ emiId, paymentData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await emiService.payEMI(emiId, paymentData, token)
        } catch (error) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString()
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const emiSlice = createSlice({
    name: 'emi',
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getEMIs.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getEMIs.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.emis = action.payload
            })
            .addCase(getEMIs.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(payEMI.pending, (state) => {
                state.isLoading = true
            })
            .addCase(payEMI.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.message = 'Payment Recorded'
                // Ideally update the specific EMI in state
            })
            .addCase(payEMI.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = emiSlice.actions
export default emiSlice.reducer
