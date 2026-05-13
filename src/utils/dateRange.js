const pad = (n) => String(n).padStart(2, '0')

export const monthToRange = ({ month, year }) => ({
  from: `${year}-${pad(month)}-01`,
  to: `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`,
})
