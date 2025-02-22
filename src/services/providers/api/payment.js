import { axios } from './utilApi'
import { of } from 'rxjs'
import { map } from 'rxjs/operators'

const token = '123-456-789'
const tablsPrefix = import.meta.env.VITE_APP_TABLES_PREFIX
const t = map( year => `${tablsPrefix}Payments${year?'-'+year:''}` )

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

  const { year } = params

  const tableName = await of(null).pipe(t).toPromise()
  const bodyFormData = new FormData()
  bodyFormData.append('token', token)
    // bodyFormData.append('action', 'getAccounts')
  bodyFormData.append('action', 'addAccountPayment')
  bodyFormData.append('tableName', tableName)

  const keys = Object.keys(params)
  for(let key of keys){
    bodyFormData.append(key, params[key])
  }

  const response = await axios({
    'method': 'post',
    'data': bodyFormData
  })

  return response

}

export const deletePayment = async p => {

  const tableName = await of(null).pipe(t).toPromise()
  const bodyFormData = convertObjectToForm(p)
  bodyFormData.append('token', token)
  bodyFormData.append('action', 'deletePayment')
  bodyFormData.append('tableName', tableName)

  const response = await axios({
    'method': 'post',
    'data': bodyFormData
  })
  console.log(response.data.data)

  return response.data
}

const convertObjectToForm = (p) => {

  const bodyFormData = new FormData()
  const keys = Object.keys(p)
  for(let key of keys){
    bodyFormData.append(key, p[key])
  }

  return bodyFormData
}
