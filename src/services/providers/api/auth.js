import axios from 'axios'

export const apiLogin = () => {
    return new Promise((resolve, reject) => {
        axios.get('http://10.60.0.60/apia/ping')
            .then(function(response){
                resolve(response.data)
            })
            .catch(function(error){
                reject(error)
            })
    })
}