import React from 'react'
import { useAuditView } from './useAuditView'
import AuditStatusStrip from './AuditStatusStrip'
import AuditFiltersBar from './AuditFiltersBar'
import AuditTable from './AuditTable'
import AnalysisModal from './AnalysisModal'
import InstructionsModal from './InstructionsModal'

const AuditView = (props) => {
  const {
    auditDays,
    auditDrivers,
    auditVehicles,
    exportAuditToExcel,
    exportAuditToPdf,
    drivers,
    periodDrivers,
    isAllResolved,
    auditRowBg,
    auditLeftBorder,
    getNote,
    getResolved,
    getNotesForDay,
    handleResolvedToggle,
    handleNoteSave,
    handleBookNoteSave,
    handleBookResolvedToggle,
  } = props

  const hook = useAuditView(props)
  const {
    containerRef,
    isFullscreen,
    showInstructions,
    setShowInstructions,
    showAnalysis,
    setShowAnalysis,
    analysisResult,
    analysisLoading,
    auditStatusFilter,
    setAuditStatusFilter,
    t,
  } = hook

  return (
    <div
      ref={containerRef}
      style={{
        padding: 16,
        background: isFullscreen ? '#fff' : undefined,
        ...(isFullscreen && { minHeight: '100vh' }),
      }}
    >
      <InstructionsModal visible={showInstructions} onClose={() => setShowInstructions(false)} />
      <AnalysisModal
        visible={showAnalysis}
        onClose={() => setShowAnalysis(false)}
        loading={analysisLoading}
        result={analysisResult}
      />
      <AuditStatusStrip
        auditDays={auditDays}
        auditDrivers={auditDrivers}
        auditStatusFilter={auditStatusFilter}
        setAuditStatusFilter={setAuditStatusFilter}
        t={t}
      />
      <AuditFiltersBar
        {...hook}
        auditVehicles={auditVehicles}
        auditDrivers={auditDrivers}
        exportAuditToExcel={exportAuditToExcel}
        exportAuditToPdf={exportAuditToPdf}
      />
      <AuditTable
        {...hook}
        drivers={drivers}
        periodDrivers={periodDrivers}
        isAllResolved={isAllResolved}
        auditRowBg={auditRowBg}
        auditLeftBorder={auditLeftBorder}
        getNote={getNote}
        getResolved={getResolved}
        getNotesForDay={getNotesForDay}
        handleResolvedToggle={handleResolvedToggle}
        handleNoteSave={handleNoteSave}
        handleBookNoteSave={handleBookNoteSave}
        handleBookResolvedToggle={handleBookResolvedToggle}
      />
    </div>
  )
}

export default AuditView
