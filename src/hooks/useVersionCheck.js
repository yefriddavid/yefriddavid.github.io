import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db, COL_SYSTEM_APP_VERSION } from 'src/services/firebase/settings'

/* eslint-disable no-undef */
const LOCAL_HASH = __COMMIT_HASH__
/* eslint-enable no-undef */

const useVersionCheck = () => {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')

  useEffect(() => {
    if (import.meta.env.DEV) return

    const unsubscribe = onSnapshot(
      doc(db, COL_SYSTEM_APP_VERSION, 'current'),
      (snap) => {
        const data = snap.data()
        if (!data?.hash || data.hash === LOCAL_HASH) return
        setHasUpdate(true)
        setCommitMessage(data.commitMessage ?? '')
      },
      () => {},
    )

    return () => unsubscribe()
  }, [])

  return { hasUpdate, commitMessage }
}

export default useVersionCheck
