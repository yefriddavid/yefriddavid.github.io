import { axios } from './utilApi'

const token = localStorage.getItem('token')

export const fetchPayments = async (params) => {
    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    bodyFormData.append('action', 'getAccountPayments')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    const response = await axios({
      'method': 'post',
      'data': bodyFormData
    })

    return response.data
}

export const fetchAccounts = async (params) => {

    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    bodyFormData.append('action', 'getAccounts')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    const response = await axios({
      'method': 'post',
      'data': bodyFormData
    })

    return response.data
}
export const createPayment = async (params) => {

    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    // bodyFormData.append('action', 'getAccounts')
    bodyFormData.append('action', 'addAccountPayment')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    const response = await axios({
      'method': 'post',
      'data': bodyFormData
    })

    return response.data
}

export const deletePayment = async ({ paymentId }) => {
    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    bodyFormData.append('action', 'deletePayment')
    bodyFormData.append('paymentId', paymentId)

    const response = await axios({
      'method': 'post',
      'data': bodyFormData
    })

    return response.data
}
