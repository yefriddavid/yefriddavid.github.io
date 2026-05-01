import { ref, onValue } from 'firebase/database'
import { eventChannel } from 'redux-saga'
import { rtdb } from '../settings'

export const createSolarBatteryChannel = () =>
  eventChannel((emit) => {
    const batteryRef = ref(rtdb, 'solar/battery')
    const unsubscribe = onValue(
      batteryRef,
      (snapshot) => emit({ data: snapshot.val() }),
      (error) => emit({ error: error.message }),
    )
    return unsubscribe
  })
