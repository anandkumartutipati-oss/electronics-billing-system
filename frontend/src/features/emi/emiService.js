import axios from 'axios'
import BASE_URL from '../../api'

const API_URL = `${BASE_URL}/emi/`

// Get all EMIs
const getEMIs = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.get(API_URL, config)

    return response.data
}

// Pay EMI
const payEMI = async (emiId, paymentData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await axios.post(API_URL + emiId + '/pay', paymentData, config)

    return response.data
}

const emiService = {
    getEMIs,
    payEMI,
}

export default emiService
