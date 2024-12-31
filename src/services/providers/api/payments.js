import { axios } from './utilApi'

const token = '123-456-789'

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
