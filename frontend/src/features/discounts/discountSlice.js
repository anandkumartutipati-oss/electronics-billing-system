import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import BASE_URL from '../../api';

const API_URL = `${BASE_URL}/discounts`;

// Get all discounts
export const getDiscounts = createAsyncThunk(
    'discounts/getAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.get(API_URL, config);
            return response.data;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create new discount
export const createDiscount = createAsyncThunk(
    'discounts/create',
    async (discountData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.post(API_URL, discountData, config);
            return response.data;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update discount
export const updateDiscount = createAsyncThunk(
    'discounts/update',
    async ({ id, discountData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const response = await axios.put(`${API_URL}/${id}`, discountData, config);
            return response.data;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const discountSlice = createSlice({
    name: 'discounts',
    initialState: {
        discounts: [],
        isLoading: false,
        isSuccess: false,
        isError: false,
        message: '',
    },
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDiscounts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDiscounts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.discounts = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(getDiscounts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createDiscount.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createDiscount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                if (Array.isArray(state.discounts)) {
                    state.discounts.push(action.payload);
                } else {
                    state.discounts = [action.payload];
                }
                state.message = 'Discount created successfully!';
            })
            .addCase(createDiscount.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateDiscount.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateDiscount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                if (Array.isArray(state.discounts)) {
                    state.discounts = state.discounts.map((discount) =>
                        discount._id === action.payload._id ? action.payload : discount
                    );
                } else {
                    state.discounts = [action.payload];
                }
                state.message = 'Discount updated successfully!';
            })
            .addCase(updateDiscount.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = discountSlice.actions;
export default discountSlice.reducer;
