//import axios from 'axios'
import { axios } from './utilApi'

const token = localStorage.getItem('token')

export const fetchAccounts = async (params) => {

  const bodyFormData = new FormData()
  bodyFormData.append('token', token)
  bodyFormData.append('action', 'getAccounts')

  const keys = Object.keys(params)
  for(let key of keys){
    bodyFormData.append(key, params[key])
  }

  const response = await axios({
    method:'post',
    data: bodyFormData
  })

  return response.data

}

