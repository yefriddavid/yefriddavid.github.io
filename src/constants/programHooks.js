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

// tenantId and currentUserName are always resolvable (see resolveArgs in
// src/utils/programRunner.js) regardless of which hook fired — they're the
// active tenant and the logged-in admin, not part of the entity a hook acted
// on — so they're always listed as available on top of whatever vars that
// hook's own entity context adds (id, plate, name, username, etc.).
const ALWAYS_AVAILABLE_VARS = ['tenantId', 'currentUserName']

export const getHookVars = (selectedKeys = []) => {
  const all = new Set(ALWAYS_AVAILABLE_VARS)
  PROGRAM_HOOKS.filter((h) => selectedKeys.includes(h.key)).forEach((h) =>
    h.vars.forEach((v) => all.add(v)),
  )
  return [...all]
}

// Plain-language meaning of each {{var}} — shown in the "¿Qué significa cada
// variable?" help modal on the Programs screen.
export const PROGRAM_VAR_DESCRIPTIONS = {
  tenantId: 'ID del tenant activo (la cuenta/empresa seleccionada al ejecutar la acción).',
  currentUserName: 'Usuario que inició sesión y disparó la acción — no el registro afectado.',
  username: 'Nombre de usuario del registro afectado (creado, editado o eliminado).',
  id: 'ID del registro afectado (conductor, vehículo, liquidación, gasto, socio, pago o transacción).',
  name: 'Nombre del registro afectado (conductor o socio).',
  plate: 'Placa del vehículo afectado.',
  driver: 'Nombre del conductor asociado a la liquidación.',
  category: 'Categoría del gasto afectado.',
}
