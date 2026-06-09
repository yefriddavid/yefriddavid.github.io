export function formatCOP(raw) {
  const num = String(raw).replace(/\D/g, '')
  return num ? num.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''
}

export function parseCOP(display) {
  return String(display).replace(/\./g, '')
}

export const emptyForm = {
  tenant_full_name: '',
  tenant_identification_number: '',
  tenant_identification_city: '',
  guarantor_full_name: '',
  guarantor_identification_number: '',
  guarantor_identification_city: '',
  owner_full_name: '',
  owner_identification_number: '',
  owner_identification_city: '',
  property_full_address: '',
  property_address: '',
  property_apartment_number: '',
  property_city: '',
  property_state: '',
  property_urbanization: '',
  rental_value: '',
  rental_duration: '',
  rental_start_date: '',
  rental_payment_day: '',
  contract_city: '',
  contract_date: '',
  account_bank_name: '',
  account_type: '',
  account_number: '',
  account_name: '',
}

export function buildPayload(form) {
  return {
    tenant: {
      full_name: form.tenant_full_name,
      identification: {
        number: form.tenant_identification_number,
        city: form.tenant_identification_city,
      },
    },
    guarantor: {
      full_name: form.guarantor_full_name,
      identification: {
        number: form.guarantor_identification_number,
        city: form.guarantor_identification_city,
      },
    },
    owner: {
      full_name: form.owner_full_name,
      identification: {
        number: form.owner_identification_number,
        city: form.owner_identification_city,
      },
    },
    property: {
      full_address: form.property_full_address,
      address: form.property_address || form.property_full_address,
      appartment_number: form.property_apartment_number,
      city: form.property_city,
      state: form.property_state,
      urbanization_name: form.property_urbanization,
    },
    rental: {
      value: parseCOP(form.rental_value),
      duration: form.rental_duration,
      start_date: form.rental_start_date,
      payment_day: form.rental_payment_day ? Number(form.rental_payment_day) : null,
    },
    contract: { city: form.contract_city, date: form.contract_date },
    account: {
      bank_name: form.account_bank_name,
      type: form.account_type,
      number: form.account_number,
      name: form.account_name || form.owner_full_name,
    },
  }
}

export function fillFormFromDoc(c) {
  return {
    tenant_full_name: c.tenant?.full_name ?? '',
    tenant_identification_number: c.tenant?.identification?.number ?? '',
    tenant_identification_city: c.tenant?.identification?.city ?? '',
    guarantor_full_name: c.guarantor?.full_name ?? '',
    guarantor_identification_number: c.guarantor?.identification?.number ?? '',
    guarantor_identification_city: c.guarantor?.identification?.city ?? '',
    owner_full_name: c.owner?.full_name ?? '',
    owner_identification_number: c.owner?.identification?.number ?? '',
    owner_identification_city: c.owner?.identification?.city ?? '',
    property_full_address: c.property?.full_address ?? '',
    property_address: c.property?.address ?? '',
    property_apartment_number: c.property?.appartment_number ?? '',
    property_city: c.property?.city ?? '',
    property_state: c.property?.state ?? '',
    property_urbanization: c.property?.urbanization_name ?? '',
    rental_value: c.rental?.value ? formatCOP(c.rental.value) : '',
    rental_duration: c.rental?.duration ?? '',
    rental_start_date: c.rental?.start_date ?? '',
    rental_payment_day: c.rental?.payment_day != null ? String(c.rental.payment_day) : '',
    contract_city: c.contract?.city ?? '',
    contract_date: c.contract?.date ?? '',
    account_bank_name: c.account?.bank_name ?? '',
    account_type: c.account?.type ?? '',
    account_number: c.account?.number ?? '',
    account_name: c.account?.name ?? '',
  }
}
