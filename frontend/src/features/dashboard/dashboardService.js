import axios from 'axios'
import BASE_URL from '../../api'

const API_URL = `${BASE_URL}/dashboard/`

const getShopStats = async (token, dateRange = {}) => {
    const { startDate, endDate } = dateRange;
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
    }
    const response = await axios.get(API_URL + 'stats', config)
    return response.data
}

const getSalesGraph = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.get(API_URL + 'graph', config)
    return response.data
}

const getLowStockAlerts = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
    const response = await axios.get(API_URL + 'alerts', config)
    return response.data
}

const getSuperAdminStats = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await axios.get(API_URL + 'admin/stats', config)
    return response.data
}

const getCategorySales = async (token, dateRange = {}) => {
    const { startDate, endDate } = dateRange;
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
    }
    const response = await axios.get(API_URL + 'category-sales', config)
    return response.data
}

const getPaymentStats = async (token, dateRange = {}) => {
    const { startDate, endDate } = dateRange;
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
    }
    const response = await axios.get(API_URL + 'payment-stats', config)
    return response.data
}

const dashboardService = {
    getShopStats,
    getSalesGraph,
    getLowStockAlerts,
    getSuperAdminStats,
    getCategorySales,
    getPaymentStats
}

export default dashboardService
