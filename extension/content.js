// Isolated world shares sessionStorage with the page — use it as a persistent bridge
// so the page can read the ID even if it mounts after this script runs.
sessionStorage.setItem('__localrunner_ext_id__', chrome.runtime.id)
