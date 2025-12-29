import axios from 'axios'
import BASE_URL from '../../api'

const API_URL = `${BASE_URL}/shops/`

// Create new shop
const createShop = async (shopData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL, shopData, config)

    return response.data
}

// Get all shops
const getShops = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL, config)

    return response.data
}

// Get shop by ID
const getShop = async (shopId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL + shopId, config)

    return response.data
}

// Import shops from CSV
const importShops = async (formData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
    }

    const response = await axios.post(API_URL + 'import', formData, config)

    return response.data
}

// Update shop
const updateShop = async (shopIds, shopData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.put(API_URL + shopIds, shopData, config)

    return response.data
}

// Delete shop
const deleteShop = async (shopId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.delete(API_URL + shopId, config)

    return response.data
}

const shopService = {
    createShop,
    getShops,
    getShop,
    updateShop,
    deleteShop,
    importShops,
}

export default shopService
