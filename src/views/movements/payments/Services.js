import axios from 'axios'
import { CreatePaymentVaucher } from './Database'

const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'
const token = '123-456-789'

const fetchAccounts = async (params) => {

  try {
    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    bodyFormData.append('action', 'getAccounts')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    const response = await axios.post(url, bodyFormData)

    return response.data
  } catch (error) {
    console.error('Error loading jQuery:', error)
  }
}
const fetchAccountPayments = async (params) => {

  try {
    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    bodyFormData.append('action', 'getAccountPayments')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    const response = await axios.post(url, bodyFormData)

    return response.data
  } catch (error) {
    console.error('Error loading jQuery:', error)
  }
}
const addAccountPayment = async (params) => {

  try {
    var bodyFormData = new FormData()
    bodyFormData.append('token', token)
    bodyFormData.append('action', 'addAccountPayment')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    const response = await axios.post(url, bodyFormData)
    const { data } = response
    const { paymentId } = data.data
    const t = await savePaymentVaucher({ paymentId, vaucher: params.vaucher })
    console.log("t response")
    console.log(t)

    return data

  } catch (error) {
    console.error('Error loading jQuery:', error)
  }
}

const savePaymentVaucher = async (data) => {

  return await CreatePaymentVaucher(data)
  

}

export { fetchAccounts, fetchAccountPayments, addAccountPayment }
