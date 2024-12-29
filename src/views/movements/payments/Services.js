import axios from 'axios'

const url = 'https://script.google.com/macros/s/AKfycbwOS916agIRqJAsraUBueji2cWmrKCceoVkaSpxhoKvvkc0jewAeQ5ZMNA7Ks_syf7BNQ/exec'

const fetchAccounts = async (params) => {

  try {
    var bodyFormData = new FormData()
    bodyFormData.append('token', '123-456-789')
    bodyFormData.append('action', 'getAccounts')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    //bodyFormData.append('type', 'Outcoming')
    //bodyFormData.append('year', year)
    //bodyFormData.append('month', month)
    //
    //bodyFormData.append('noEmptyAccounts', 'true')

    const response = await axios.post(url, bodyFormData)

    return response.data
  } catch (error) {
    console.error('Error loading jQuery:', error)
  }
}
const fetchAccountPayments = async (params) => {

  try {
    var bodyFormData = new FormData()
    bodyFormData.append('token', '123-456-789')
    bodyFormData.append('action', 'getAccountPayments')

    const keys = Object.keys(params)
    for(let key of keys){
      bodyFormData.append(key, params[key])
    }

    //bodyFormData.append('type', 'Outcoming')
    //bodyFormData.append('year', year)
    //bodyFormData.append('month', month)
    //
    //bodyFormData.append('noEmptyAccounts', 'true')

    const response = await axios.post(url, bodyFormData)

    return response.data
  } catch (error) {
    console.error('Error loading jQuery:', error)
  }
}

export { fetchAccounts, fetchAccountPayments }
