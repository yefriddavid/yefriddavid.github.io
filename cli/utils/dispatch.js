/**
 * Dispatch an action and wait for the saga to finish.
 * Resolves when isFetching transitions true → false.
 */
export function waitForSaga(store, action, { isFetching, getResult }) {
  return new Promise((resolve, reject) => {
    let started = false
    let unsub

    const timer = setTimeout(() => {
      unsub?.()
      reject(new Error('Saga timed out after 30s'))
    }, 30000)

    unsub = store.subscribe(() => {
      const state = store.getState()
      const fetching = isFetching(state)
      if (fetching) started = true
      if (started && !fetching) {
        clearTimeout(timer)
        unsub()
        resolve(getResult(state))
      }
    })

    store.dispatch(action)
  })
}
