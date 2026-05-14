import { useEffect, useRef, useState } from 'react'
import { runAuditAnalysis } from '../auditAnalysisRules'

export const useAuditActions = ({ auditDays, periodDrivers }) => {
  const [showInstructions, setShowInstructions] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const openAnalysis = async () => {
    setShowAnalysis(true)
    setAnalysisLoading(true)
    const result = await runAuditAnalysis(auditDays, periodDrivers)
    setAnalysisResult(result)
    setAnalysisLoading(false)
  }

  return {
    showInstructions,
    setShowInstructions,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    analysisLoading,
    isFullscreen,
    containerRef,
    toggleFullscreen,
    openAnalysis,
  }
}
