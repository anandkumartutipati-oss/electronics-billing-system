import axios from 'axios'
import BASE_URL from '../../api'

const API_URL = `${BASE_URL}/products/`

// Create new product
const createProduct = async (productData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL, productData, config)

    return response.data
}

// Get all products (optional shopId for filtering)
const getProducts = async (token, shopId = '') => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    let url = API_URL
    if (shopId) {
        url += `?shopId=${shopId}`
    }

    const response = await axios.get(url, config)

    return response.data
}


// Import products from CSV
const importProducts = async (formData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    }

    const response = await axios.post(API_URL + 'import', formData, config)

    return response.data
}
// Delete product
const deleteProduct = async (productId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.delete(API_URL + productId, config)

    return response.data
}

// Update product
const updateProduct = async (productId, productData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.put(API_URL + productId, productData, config)

    return response.data
}

const productService = {
    createProduct,
    getProducts,
    importProducts,
    deleteProduct,
    updateProduct,
}

export default productService
