import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from './productService'

const initialState = {
    products: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

// Create new product
export const createProduct = createAsyncThunk(
    'products/create',
    async (productData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await productService.createProduct(productData, token)
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

// Get all products
export const getProducts = createAsyncThunk(
    'products/getAll',
    async (shopId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await productService.getProducts(token, shopId)
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

// Import products
export const importProducts = createAsyncThunk(
    'products/import',
    async (formData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await productService.importProducts(formData, token)
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

// Delete product
export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await productService.deleteProduct(id, token)
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

// Update product
export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, productData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await productService.updateProduct(id, productData, token)
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

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        },
        clearProducts: (state) => {
            state.products = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createProduct.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.message = 'Product created successfully'
                state.products.push(action.payload)
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getProducts.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.products = action.payload
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(importProducts.pending, (state) => {
                state.isLoading = true
            })
            .addCase(importProducts.fulfilled, (state, action) => {
                state.isLoading = false
                if (action.payload.successCount > 0) {
                    state.isSuccess = true
                    state.message = `Successfully imported ${action.payload.successCount} products.`
                    if (action.payload.errors) {
                        state.message += ` (${action.payload.errors.length} failed)`
                    }
                } else if (action.payload.errors && action.payload.errors.length > 0) {
                    state.isError = true
                    state.isSuccess = false
                    const firstError = action.payload.errors[0];
                    state.message = `Import Failed: ${firstError.error || 'Unknown error'}`
                } else {
                    state.isSuccess = true
                    state.message = 'Import Processed'
                }
            })
            .addCase(importProducts.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(deleteProduct.pending, (state) => {
                state.isLoading = true
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.message = 'Product deleted successfully'
                state.products = state.products.filter(
                    (product) => product._id !== action.meta.arg
                )
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(updateProduct.pending, (state) => {
                state.isLoading = true
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.message = 'Product updated successfully'
                state.products = state.products.map((product) =>
                    product._id === action.payload._id ? action.payload : product
                )
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset, clearProducts } = productSlice.actions
export default productSlice.reducer
