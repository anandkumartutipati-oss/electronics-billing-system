import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import shopReducer from '../features/shops/shopSlice';
import productReducer from '../features/products/productSlice';
import supplierReducer from '../features/suppliers/supplierSlice';
import invoiceReducer from '../features/invoices/invoiceSlice';
import emiReducer from '../features/emi/emiSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        shops: shopReducer,
        products: productReducer,
        suppliers: supplierReducer,
        invoices: invoiceReducer,
        emi: emiReducer,
        dashboard: dashboardReducer,
    },
});
