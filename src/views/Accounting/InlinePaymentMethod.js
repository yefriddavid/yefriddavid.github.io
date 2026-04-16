import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import * as accountsMasterActions from 'src/actions/cashflow/accountsMasterActions'
import { PAYMENT_METHODS } from 'src/constants/cashFlow'

const InlinePaymentMethod = ({ account }) => {
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(false)

  const handleChange = (e) => {
    dispatch(accountsMasterActions.updateRequest({ ...account, paymentMethod: e.target.value }))
    setEditing(false)
  }

  if (editing) {
    return (
      <select
        autoFocus
        value={account.paymentMethod ?? ''}
        onChange={handleChange}
        onBlur={() => setEditing(false)}
        style={{
          fontSize: 11,
          padding: '1px 4px',
          borderRadius: 4,
          border: '1px solid #cbd5e1',
          outline: 'none',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        {PAYMENT_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    )
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click para cambiar método de pago"
      style={{
        fontSize: 11,
        cursor: 'pointer',
        borderBottom: '2px dotted #94a3b8',
        paddingBottom: 1,
        color: 'inherit',
      }}
    >
      {account.paymentMethod || '—'}
    </span>
  )
}

export default InlinePaymentMethod
