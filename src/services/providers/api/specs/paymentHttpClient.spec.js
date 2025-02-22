
import { describe, it, expect, test } from 'vitest'
import * as httpClient from '../payment'

describe('paymentVauchersHttClient', () => {

  const mockData = {
    accountId: 15,
    month: 1,
    year: 2025,
    value: 12000,
    vaucher: "abc-1234",
    comment: "comment test",
    deviceId: "vitest",
    username: "react",
    paymentMethod: "Cash",
    date:"01-02-2025"
  };
  //const ID = "4443364"

  describe('crud', () => {

    //test.sequential('should create data successfully', async () => {

    //  const response = await httpClient.createPayment(mockData)
    //  expect(response).toHaveProperty('data');

    //})

    //test.sequential('should fetch data successfully', async () => {

    //  const response = await httpClient.fetchVaucherPayment({ id: mockData.paymentId, ...mockData })
    //  expect(response).toHaveProperty('data');

    //})

    //test.sequential('should edit data successfully', async () => {

    //  const response = await httpClient.editVaucherPayment({ ID, ...mockData })
    //  //console.log(response);
    //  expect(response).toHaveProperty('data');

    //})

    test.sequential('should delete data successfully', async () => {

      const response = await httpClient.deletePayment({ paymentId: 2 })
      expect(response).toHaveProperty('status')
      expect(response.status).not.toEqual('error');

    })

  })

})

