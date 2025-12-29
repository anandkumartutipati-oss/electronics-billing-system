import axios from 'axios'
import BASE_URL from '../../api'

const API_URL = `${BASE_URL}/suppliers/`

// Create new supplier
const createSupplier = async (supplierData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL, supplierData, config)

    return response.data
}

// Get all suppliers
const getSuppliers = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL, config)

    return response.data
}

// Delete supplier
const deleteSupplier = async (id, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.delete(API_URL + id, config)

    return response.data
}

const supplierService = {
    createSupplier,
    getSuppliers,
    deleteSupplier,
}

export default supplierService
