import React from 'react'
import { useTradeVisualGrid } from './useTradeVisualGrid'
import GridTopControls from './GridTopControls'
import GridSummaryBar from './GridSummaryBar'
import GridActionButtons from './GridActionButtons'
import GridSvg from './GridSvg'
import GridFilterModal from './GridFilterModal'
import TradeDetailModal from './TradeDetailModal'

export default function TradeVisualGrid({ transactions = [], loanRate = 3.5, onLoanRateChange }) {
  const hook = useTradeVisualGrid({ transactions, loanRate })

  return (
    <div ref={hook.outerRef} style={{ width: '100%', padding: '0 10px' }}>
      <GridTopControls
        currentPrice={hook.currentPrice}
        setCurrentPrice={hook.setCurrentPrice}
        loanRate={loanRate}
        onLoanRateChange={onLoanRateChange}
        gridStep={hook.gridStep}
        setGridStep={hook.setGridStep}
      />
      <GridSummaryBar totals={hook.totals} />
      <div style={{ position: 'relative' }}>
        <GridActionButtons
          textScale={hook.textScale}
          setTextScale={hook.setTextScale}
          visibleLevels={hook.visibleLevels}
          setVisibleLevels={hook.setVisibleLevels}
          priceFilter={hook.priceFilter}
          setPriceFilter={hook.setPriceFilter}
          setFilterInput={hook.setFilterInput}
          openFilterDialog={hook.openFilterDialog}
          isFullscreen={hook.isFullscreen}
          toggleFullscreen={hook.toggleFullscreen}
          hiddenTrades={hook.hiddenTrades}
          toggleHideAll={hook.toggleHideAll}
          showHiddenOnly={hook.showHiddenOnly}
          setShowHiddenOnly={hook.setShowHiddenOnly}
          snakeLayout={hook.snakeLayout}
          setSnakeLayout={hook.setSnakeLayout}
          panEnabled={hook.panEnabled}
          setPanEnabled={hook.setPanEnabled}
          centerView={hook.centerView}
          fmt={hook.fmt}
        />
        <GridSvg
          containerRef={hook.containerRef}
          panEnabled={hook.panEnabled}
          onPointerDown={hook.onPointerDown}
          onPointerMove={hook.onPointerMove}
          stopDrag={hook.stopDrag}
          H={hook.H}
          levels={hook.levels}
          toY={hook.toY}
          selectedPrice={hook.selectedPrice}
          setSelectedPrice={hook.setSelectedPrice}
          visibleTransactions={hook.visibleTransactions}
          currentPriceY={hook.currentPriceY}
          showCurrentPrice={hook.showCurrentPrice}
          currentPrice={hook.currentPrice}
          sortedTransactions={hook.sortedTransactions}
          frontPrice={hook.frontPrice}
          setFrontPrice={hook.setFrontPrice}
          snakeLayout={hook.snakeLayout}
          snakeColMap={hook.snakeColMap}
          SNAKE_X={hook.SNAKE_X}
          hiddenTrades={hook.hiddenTrades}
          toggleHide={hook.toggleHide}
          setDetailModal={hook.setDetailModal}
          setEditForm={hook.setEditForm}
          loanRate={loanRate}
          fs={hook.fs}
          fmt={hook.fmt}
          fmtVal={hook.fmtVal}
        />
      </div>
      <GridFilterModal
        filterOpen={hook.filterOpen}
        setFilterOpen={hook.setFilterOpen}
        filterInput={hook.filterInput}
        setFilterInput={hook.setFilterInput}
        priceFilter={hook.priceFilter}
        setPriceFilter={hook.setPriceFilter}
        fmt={hook.fmt}
      />
      <TradeDetailModal
        detailModal={hook.detailModal}
        editForm={hook.editForm}
        setEditForm={hook.setEditForm}
        onClose={hook.closeDetailModal}
        onSave={hook.saveDetailModal}
      />
    </div>
  )
}
