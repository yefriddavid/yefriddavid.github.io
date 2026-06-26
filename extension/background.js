chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  const port = chrome.runtime.connectNative('com.myadmin.localrunner')

  port.onMessage.addListener((response) => {
    sendResponse(response)
    port.disconnect()
  })

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      sendResponse({ error: chrome.runtime.lastError.message })
    }
  })

  port.postMessage(message)
  return true
})
