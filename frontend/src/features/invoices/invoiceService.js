import axios from 'axios'
import BASE_URL from '../../api'

const API_URL = `${BASE_URL}/invoices/`

// Create new invoice
const createInvoice = async (invoiceData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL, invoiceData, config)

    return response.data
}

// Get all invoices
const getInvoices = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL, config)

    return response.data
}

const invoiceService = {
    createInvoice,
    getInvoices,
}

export default invoiceService
