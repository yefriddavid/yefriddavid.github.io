let allowlistPromise

// Only binaries listed here can be executed, regardless of what the page sends —
// closes the RCE path where a compromised/XSS'd page runs arbitrary local binaries.
function loadAllowlist() {
  if (!allowlistPromise) {
    allowlistPromise = fetch(chrome.runtime.getURL('allowlist.json'))
      .then((r) => r.json())
      .catch(() => [])
  }
  return allowlistPromise
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  loadAllowlist().then((allowed) => {
    if (!allowed.includes(message.binary)) {
      sendResponse({ error: `Binario no autorizado: ${message.binary}` })
      return
    }

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
  })
  return true
})
