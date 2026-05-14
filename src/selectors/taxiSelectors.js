import { createSelector } from '@reduxjs/toolkit'

export const selectSettlements = (s) => s.taxiSettlement.data
export const selectSettlementsFetching = (s) => s.taxiSettlement.fetching
export const selectSettlementsError = (s) => s.taxiSettlement.isError
export const selectDrivers = (s) => s.taxiDriver.data
export const selectVehicles = (s) => s.taxiVehicle.data
export const selectExpenses = (s) => s.taxiExpense.data
export const selectAuditNotes = (s) => s.taxiAuditNote.notes

// Combines all settlement page data into one subscription.
// Component re-renders only when any of these 5 slices actually change.
export const selectTaxiSettlementsPage = createSelector(
  selectSettlements,
  selectSettlementsFetching,
  selectSettlementsError,
  selectDrivers,
  selectVehicles,
  selectExpenses,
  selectAuditNotes,
  (
    settlementsData,
    loadingSettlements,
    settlementError,
    driversData,
    vehiclesData,
    expensesData,
    auditNotes,
  ) => ({
    settlementsData,
    loadingSettlements,
    settlementError,
    driversData,
    vehiclesData,
    expensesData,
    auditNotes,
  }),
)
