import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CFormSelect } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'
import useActiveTenantId from 'src/hooks/useActiveTenantId'
import * as actions from 'src/actions/finance/cryptoPurchaseActions'
import { CRYPTO_PURCHASE_SYMBOLS } from 'src/constants/finance'
import {
  isSale,
  isAdjustment,
  symbolLabel,
  platformLabel,
  fmtUSD,
} from 'src/views/tools/crypto-purchases/cryptoPurchaseHelpers'
import './CryptoQuery.scss'

const CryptoQuery = () => {
  const dispatch = useDispatch()
  const activeTenantId = useActiveTenantId()
  const { purchases, loading } = useSelector((s) => s.cryptoPurchase)

  const [symbol, setSymbol] = useState(CRYPTO_PURCHASE_SYMBOLS[0].value)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')

  useEffect(() => {
    dispatch(actions.loadRequest())
  }, [dispatch, activeTenantId])

  const filtered = useMemo(() => {
    const min = priceMin !== '' ? Number(priceMin) : null
    const max = priceMax !== '' ? Number(priceMax) : null
    return purchases
      .filter((p) => p.symbol === symbol && !isAdjustment(p))
      .filter((p) => !dateFrom || (p.purchaseDate || '') >= dateFrom)
      .filter((p) => !dateTo || (p.purchaseDate || '') <= dateTo)
      .filter((p) => min == null || (Number(p.purchasePrice) || 0) >= min)
      .filter((p) => max == null || (Number(p.purchasePrice) || 0) <= max)
      .sort((a, b) => (b.purchaseDate || '').localeCompare(a.purchaseDate || ''))
  }, [purchases, symbol, dateFrom, dateTo, priceMin, priceMax])

  const totals = useMemo(() => {
    const buys = filtered.filter((p) => !isSale(p))
    const sells = filtered.filter((p) => isSale(p))
    const buysQty = buys.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    const sellsQty = sells.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
    const invested = buys.reduce(
      (s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
      0,
    )
    const proceeds = sells.reduce(
      (s, p) => s + (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0),
      0,
    )
    return {
      buysCount: buys.length,
      sellsCount: sells.length,
      buysQty,
      sellsQty,
      invested,
      proceeds,
      net: proceeds - invested,
    }
  }, [filtered])

  return (
    <div className="cq">
      <h1 className="cq__title">Consulta de Compras/Ventas</h1>
      <p className="cq__subtitle">
        Filtra un activo por rango de fechas y de precio para revisar sus operaciones.
      </p>

      <div className="cq__filters">
        <div className="cq__field">
          <label>Activo</label>
          <CFormSelect size="sm" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {CRYPTO_PURCHASE_SYMBOLS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </CFormSelect>
        </div>
        <div className="cq__field">
          <label>Fecha desde</label>
          <input
            type="date"
            className="cq__input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="cq__field">
          <label>Fecha hasta</label>
          <input
            type="date"
            className="cq__input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="cq__field">
          <label>Precio mínimo</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            placeholder="0.00"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
        </div>
        <div className="cq__field">
          <label>Precio máximo</label>
          <input
            type="number"
            step="any"
            className="cq__input"
            placeholder="0.00"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Spinner mode="section" />
      ) : (
        <>
          <div className="cq__kpis">
            <div className="cq__kpi cq__kpi--buy">
              <div className="cq__kpi-label">Compras</div>
              <div className="cq__kpi-value">{totals.buysCount}</div>
              <div className="cq__kpi-sub">{fmtUSD(totals.invested)} invertidos</div>
            </div>
            <div className="cq__kpi cq__kpi--sell">
              <div className="cq__kpi-label">Ventas</div>
              <div className="cq__kpi-value">{totals.sellsCount}</div>
              <div className="cq__kpi-sub">{fmtUSD(totals.proceeds)} recibidos</div>
            </div>
            <div className="cq__kpi">
              <div className="cq__kpi-label">Neto (Ventas − Compras)</div>
              <div
                className={`cq__kpi-value${totals.net >= 0 ? ' cq__kpi-value--positive' : ' cq__kpi-value--negative'}`}
              >
                {totals.net >= 0 ? '+' : ''}
                {fmtUSD(totals.net)}
              </div>
            </div>
          </div>

          <div className="cq__ledger">
            <p className="cq__panel-title">
              {symbolLabel(symbol)} — {filtered.length} operaciones
            </p>
            <div className="cq__scroll">
              <table className="cq__table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th className="num">Cantidad</th>
                    <th className="num">Precio</th>
                    <th className="num">Total</th>
                    <th>Plataforma</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const total = (Number(p.quantity) || 0) * (Number(p.purchasePrice) || 0)
                    return (
                      <tr key={p.id}>
                        <td>{p.purchaseDate}</td>
                        <td>
                          {isSale(p) ? (
                            <span className="cq__pill cq__pill--sell">
                              <span className="cq__dot" />
                              Venta
                            </span>
                          ) : (
                            <span className="cq__pill cq__pill--buy">
                              <span className="cq__dot" />
                              Compra
                            </span>
                          )}
                        </td>
                        <td className="num">{p.quantity}</td>
                        <td className="num">{fmtUSD(p.purchasePrice)}</td>
                        <td className="num">{fmtUSD(total)}</td>
                        <td>{platformLabel(p.platform)}</td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="cq__empty">
                        Sin operaciones para los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="cq__total-row">
                    <td colSpan={2}>Total compras ({totals.buysCount})</td>
                    <td className="num">{totals.buysQty.toFixed(8)}</td>
                    <td className="num">—</td>
                    <td className="num">{fmtUSD(totals.invested)}</td>
                    <td />
                  </tr>
                  <tr className="cq__total-row">
                    <td colSpan={2}>Total ventas ({totals.sellsCount})</td>
                    <td className="num">{totals.sellsQty.toFixed(8)}</td>
                    <td className="num">—</td>
                    <td className="num">{fmtUSD(totals.proceeds)}</td>
                    <td />
                  </tr>
                  <tr className="cq__total-row cq__total-row--net">
                    <td colSpan={4}>Neto (Ventas − Compras)</td>
                    <td className="num" colSpan={2}>
                      <span
                        className={`cq__amount${totals.net >= 0 ? ' cq__amount--positive' : ' cq__amount--negative'}`}
                      >
                        {totals.net >= 0 ? '+' : ''}
                        {fmtUSD(totals.net)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CryptoQuery
