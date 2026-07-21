export const PROGRAM_HOOKS = [
  { key: 'user.create', label: 'Usuario — crear', vars: ['username'] },
  { key: 'user.update', label: 'Usuario — actualizar', vars: ['username'] },
  { key: 'user.delete', label: 'Usuario — eliminar', vars: ['username'] },
  { key: 'driver.create', label: 'Conductor — crear', vars: ['id', 'name'] },
  { key: 'driver.update', label: 'Conductor — actualizar', vars: ['id', 'name'] },
  { key: 'driver.delete', label: 'Conductor — eliminar', vars: ['id'] },
  { key: 'vehicle.create', label: 'Vehículo — crear', vars: ['id', 'plate'] },
  { key: 'vehicle.update', label: 'Vehículo — actualizar', vars: ['id', 'plate'] },
  { key: 'vehicle.delete', label: 'Vehículo — eliminar', vars: ['id'] },
  { key: 'settlement.create', label: 'Liquidación — crear', vars: ['id', 'driver', 'plate'] },
  { key: 'settlement.update', label: 'Liquidación — actualizar', vars: ['id'] },
  { key: 'settlement.delete', label: 'Liquidación — eliminar', vars: ['id'] },
  { key: 'expense.create', label: 'Gasto — crear', vars: ['id', 'category'] },
  { key: 'expense.update', label: 'Gasto — actualizar', vars: ['id'] },
  { key: 'expense.delete', label: 'Gasto — eliminar', vars: ['id'] },
  { key: 'partner.create', label: 'Socio — crear', vars: ['id', 'name'] },
  { key: 'partner.update', label: 'Socio — actualizar', vars: ['id', 'name'] },
  { key: 'partner.delete', label: 'Socio — eliminar', vars: ['id'] },
  { key: 'payment.create', label: 'Pago — crear', vars: ['id'] },
  { key: 'payment.update', label: 'Pago — actualizar', vars: ['id'] },
  { key: 'payment.delete', label: 'Pago — eliminar', vars: ['id'] },
  { key: 'transaction.create', label: 'Transacción — crear', vars: ['id'] },
  { key: 'transaction.update', label: 'Transacción — actualizar', vars: ['id'] },
  { key: 'transaction.delete', label: 'Transacción — eliminar', vars: ['id'] },
  { key: 'cryptoPurchase.sync', label: 'Crypto Purchases — sincronizar', vars: [] },
]

export const getHookVars = (selectedKeys = []) => {
  const all = new Set()
  PROGRAM_HOOKS.filter((h) => selectedKeys.includes(h.key)).forEach((h) =>
    h.vars.forEach((v) => all.add(v)),
  )
  return [...all]
}
