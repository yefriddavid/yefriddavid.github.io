
import { describe, it, expect, test } from 'vitest'
import * as httpClient from '../paymentVaucher'

describe('paymentVauchersHttClient', () => {

  const mockData = { paymentId: 122, year: 2025, vaucher: "abc-1234" };
  const ID = "4443364"

  describe('crud', () => {

    /*
    test.sequential('should create data successfully', async () => {

      const response = await httpClient.createPaymentVaucher({ ID, ...mockData })
      expect(response).toHaveProperty('status');

    })

    test.sequential('should fetch data successfully', async () => {

      const response = await httpClient.fetchVaucherPayment({ id: mockData.paymentId, ...mockData })
      expect(response).toHaveProperty('data');

    })

    test.sequential('should edit data successfully', async () => {

      const response = await httpClient.editVaucherPayment({ ID, ...mockData })
      //console.log(response);
      expect(response).toHaveProperty('data');

    })*/

    test.sequential('should create data successfully', async () => {

      // const response = await httpClient.createPaymentVaucher({ ID, ...mockData })
      const response = await httpClient.createPaymentVaucher(mockData)
      expect(response).toHaveProperty('status');

    })

      /*test.sequential('should delete data successfully', async () => {

      const response = await httpClient.deleteVaucherPayment({ id: ID, year: "davaid" })
      expect(response).toHaveProperty('status');

    })*/
  })

})

