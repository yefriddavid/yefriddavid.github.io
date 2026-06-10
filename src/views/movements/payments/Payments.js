import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Column } from 'devextreme-react/data-grid'
import StandardGrid from 'src/components/shared/StandardGrid/Index'
import { SelectControl } from './Controls'
import ModalPaymentComponent from './ModalPaymentComponent'
import * as accountActions from '../../../actions/cashflow/accountActions'
import { Notification } from './Alert'
import './Payments.scss'
import moment from 'src/utils/moment'
import { CButton } from '@coreui/react'
import Spinner from 'src/components/shared/Spinner'

const INITIAL_FILTERS = {
  year: moment().format('Y'),
  month: moment().format('MMMM'),
  monthNumber: moment().format('M'),
  noEmptyAccounts: 'true',
  type: 'Outcoming',
}

const getCacheKey = (year, monthNumber) => `payments_cache_${year}_${monthNumber}`

const onContentReady = (e) => {
  if (!e.component.getSelectedRowKeys().length) {
    e.component.selectRowsByIndexes([0])
  }
}

const Payments = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const {
    data: accountsSlice,
    selectedAccount,
    isError: fetchIsError,
    error: fetchErrorMessage,
  } = useSelector((s) => s.account)

  const gridRef = useRef(null)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [expandedRowKey, setExpandedRowKey] = useState(null)
  const [cachedData, setCachedData] = useState(null)
  const [isFetching, setIsFetching] = useState(false)

  const { year, month, monthNumber } = filters
  const reduxItems = accountsSlice?.data?.data?.items

  const loadCache = useCallback(() => {
    try {
      const raw = localStorage.getItem(getCacheKey(year, monthNumber))
      if (raw) setCachedData(JSON.parse(raw))
    } catch {}
  }, [year, monthNumber])

  const saveCache = useCallback(
    (items) => {
      try {
        localStorage.setItem(getCacheKey(year, monthNumber), JSON.stringify(items))
      } catch {}
    },
    [year, monthNumber],
  )

  const refreshData = useCallback(() => {
    setIsFetching(true)
    dispatch(accountActions.fetchData({ ...filters, month: monthNumber }))
  }, [dispatch, filters, monthNumber])

  useEffect(() => {
    loadCache()
    refreshData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (reduxItems) {
      saveCache(reduxItems)
      setIsFetching(false)
    }
  }, [reduxItems, saveCache])

  useEffect(() => {
    loadCache()
  }, [loadCache])

  const selectAccount = (account) => {
    dispatch(accountActions.selectAccount(account))
  }

  const loadVauchers = (item) => {
    if (!reduxItems) return
    const account = reduxItems.find((e) => e.accountId === item.key)
    dispatch(accountActions.loadVauchersToAccountPayment(account))
  }

  const onChangeAnyState = (v, name) => {
    setFilters((prev) =>
      name === 'month'
        ? { ...prev, month: v, monthNumber: moment().month(v).format('M') }
        : { ...prev, [name]: v },
    )
  }

  const onRowClick = (e) => {
    if (e.rowType !== 'data') return
    const clickedKey = e.key
    if (expandedRowKey === clickedKey) {
      e.component.collapseAll(-1)
      setExpandedRowKey(null)
    } else {
      e.component.collapseAll(-1)
      e.component.expandRow(clickedKey)
      setExpandedRowKey(clickedKey)
    }
  }

  const openAddPayment = (row) => {
    const instance = gridRef.current?.instance
    if (!instance) return
    instance.collapseAll(-1)
    instance.expandRow(row.accountId)
    setExpandedRowKey(row.accountId)
  }

  const data = reduxItems ?? cachedData
  const months = moment.months()
  const years = [(year - 1).toString(), year.toString(), (parseInt(year) + 1).toString()]

  return (
    <div className="payments-container">
      <Notification message={fetchErrorMessage} visible={fetchIsError} />
      {selectedAccount && (
        <ModalPaymentComponent
          account={selectedAccount}
          visible={typeof selectedAccount !== 'undefined'}
          name="showNewPaymentModal"
          setVisible={selectAccount}
        />
      )}

      <div className="payments-filters">
        <SelectControl
          title={t('payments.filters.month')}
          name="month"
          onChange={onChangeAnyState}
          value={month}
          options={months}
        />
        <SelectControl
          title={t('payments.filters.year')}
          name="year"
          onChange={onChangeAnyState}
          value={year}
          options={years}
        />
        <CButton color="warning" size="sm" onClick={refreshData}>
          {t('common.refresh')}
        </CButton>
        {isFetching && data && (
          <div className="payments-fetching">
            <Spinner size="sm" color="primary" />
            <span>{t('common.updating')}</span>
          </div>
        )}
      </div>

      {!data ? (
        <div className="payments-loading">
          <Spinner color="primary" />
          <span>{t('common.loading')}</span>
        </div>
      ) : (
        <StandardGrid
          ref={gridRef}
          keyExpr="accountId"
          onContentReady={onContentReady}
          onRowClick={onRowClick}
          dataSource={data}
          onRowExpanded={(e) => loadVauchers(e)}
        >
          <Column
            dataField="accountId"
            width={60}
            caption={t('payments.columns.id')}
            hidingPriority={5}
          />
          <Column
            dataField="name"
            minWidth={120}
            caption={t('payments.columns.name')}
            hidingPriority={8}
          />
          <Column
            dataField="maxDate"
            width={110}
            caption={t('payments.columns.dueDate')}
            hidingPriority={4}
          />
          <Column
            dataField="paymentMethod"
            caption={t('payments.columns.paymentMethod')}
            allowEditing={false}
            hidingPriority={2}
          />
          <Column dataField="period" caption={t('payments.columns.period')} hidingPriority={1} />
          <Column
            caption="Fecha"
            width={110}
            allowEditing={false}
            hidingPriority={3}
            cellRender={({ data: row }) => {
              const items = row?.payments?.items
              if (!items?.length) return null
              const last = items.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b))
              return <span>{moment(last.date).format('MMM DD, YYYY')}</span>
            }}
          />
          <Column
            dataField="value"
            caption={t('payments.columns.value')}
            hidingPriority={6}
            cellRender={({ value }) =>
              new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(value)
            }
          />
          <Column
            dataField="Status"
            width={120}
            alignment="center"
            caption={t('payments.columns.status')}
            allowEditing={false}
            hidingPriority={7}
            cellRender={({ data: row }) => {
              const paid = row.payments && row.payments.total >= row.value
              return (
                <span className={`payment-status payment-status--${paid ? 'paid' : 'pending'}`}>
                  {paid ? t('payments.status.paid') : t('payments.status.pending')}
                </span>
              )
            }}
          />
          <Column
            caption={t('payments.columns.actions')}
            width={100}
            allowSorting={false}
            cellRender={({ data: row }) => (
              <CButton
                size="sm"
                color="primary"
                variant="outline"
                onClick={() => openAddPayment(row)}
              >
                + Pago
              </CButton>
            )}
          />
        </StandardGrid>
      )}
    </div>
  )
}

export default Payments
