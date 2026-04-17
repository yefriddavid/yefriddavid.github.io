import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmt } from '../Components/utils'

export function buildAuditExporters({
  auditDays,
  dayNames,
  period,
  auditMonthStr,
  isAllResolved,
  getNote,
  getResolved,
  drivers,
  periodDrivers,
}) {
  const exportAuditToExcel = () => {
    const statusLabel = {
      none: 'Sin actividad',
      partial: 'Parcial',
      full: 'Completo',
      future: 'Futuro',
    }
    const monthName = new Date(period.year, period.month - 1, 1).toLocaleDateString('es-CO', {
      month: 'long',
      year: 'numeric',
    })
    const title = `Auditoría ${monthName}`
    const headers = [
      'Día',
      'Fecha',
      'Semana',
      'Estado',
      'Liq.',
      'Total (COP)',
      'Liquidaron',
      'Sin liquidar',
    ]
    const rows = auditDays.map((day) => [
      String(day.d).padStart(2, '0'),
      day.dateStr,
      dayNames[day.dow],
      statusLabel[day.status] ?? day.status,
      day.isFuture ? '' : day.dayRecords.length,
      day.isFuture ? '' : day.total,
      day.settled.join(', '),
      day.missing.join(', '),
    ])
    const pastDays = auditDays.filter((d) => !d.isFuture)
    const totalsRow = [
      '',
      '',
      '',
      'TOTAL',
      pastDays.reduce((s, d) => s + d.dayRecords.length, 0),
      pastDays.reduce((s, d) => s + d.total, 0),
      '',
      '',
    ]
    const aoa = [[title], [], headers, ...rows, [], totalsRow]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 8 },
      { wch: 14 },
      { wch: 6 },
      { wch: 16 },
      { wch: 40 },
      { wch: 40 },
    ]
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría')
    XLSX.writeFile(wb, `auditoria_${auditMonthStr}.xlsx`)
  }

  const exportAuditToPdf = () => {
    const monthName = new Date(period.year, period.month - 1, 1).toLocaleDateString('es-CO', {
      month: 'long',
      year: 'numeric',
    })
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()

    doc.setFillColor(30, 58, 95)
    doc.rect(0, 0, pageW, 18, 'F')
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(
      `Auditoria de Liquidaciones - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`,
      14,
      12,
    )
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 215, 240)
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, pageW - 14, 12, { align: 'right' })
    doc.setTextColor(0)

    const pastDays = auditDays.filter((d) => !d.isFuture)
    const summaryItems = [
      {
        label: 'Sin actividad',
        value: String(auditDays.filter((d) => d.status === 'none').length),
        fill: [224, 49, 49],
        bg: [255, 245, 245],
      },
      {
        label: 'Parcial',
        value: String(auditDays.filter((d) => d.status === 'partial').length),
        fill: [230, 119, 0],
        bg: [255, 251, 235],
      },
      {
        label: 'Completo',
        value: String(auditDays.filter((d) => d.status === 'full').length),
        fill: [47, 158, 68],
        bg: [240, 253, 244],
      },
      {
        label: 'Dias futuros',
        value: String(auditDays.filter((d) => d.status === 'future').length),
        fill: [134, 142, 150],
        bg: [248, 250, 252],
      },
      {
        label: 'Total recaudado',
        value: fmt(pastDays.reduce((s, d) => s + d.total, 0)),
        fill: [30, 58, 95],
        bg: [238, 244, 255],
        wide: true,
      },
    ]
    let sx = 14
    const boxH = 14
    const topY = 22
    summaryItems.forEach((item) => {
      const bw = item.wide ? 52 : 42
      doc.setFillColor(...item.bg)
      doc.setDrawColor(...item.fill)
      doc.roundedRect(sx, topY, bw, boxH, 2, 2, 'FD')
      doc.setFontSize(item.wide ? 9 : 13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...item.fill)
      doc.text(item.value, sx + bw / 2, topY + 7, { align: 'center' })
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.text(item.label, sx + bw / 2, topY + 11.5, { align: 'center' })
      sx += bw + 4
    })
    doc.setTextColor(0)

    const statusLabel = {
      none: 'Sin activ.',
      partial: 'Parcial',
      full: 'Completo',
      future: 'Futuro',
    }
    const tableRows = auditDays.map((day) => {
      const resolvedLabel = isAllResolved(day)
        ? 'Completo'
        : (statusLabel[day.status] ?? day.status)
      const settledStr = day.settled
        .map((dr) => {
          const plate = drivers.find((d) => d.name === dr)?.defaultVehicle
          const underpaid = plate ? day.underpaidVehicles.includes(plate) : false
          const driverRecs = day.dayRecords.filter((r) => r.driver === dr)
          return driverRecs
            .map(
              (rec) =>
                `${underpaid ? '~ ' : ''}${dr.split(' ')[0]}${driverRecs.length > 1 ? ` $${(rec.amount / 1000).toFixed(0)}k` : ''}`,
            )
            .join(', ')
        })
        .join(', ')
      const issueParts = []
      if (!day.isFuture) {
        day.missing.forEach((dr) => {
          const note = getNote(day.dateStr, dr)
          const resolved = getResolved(day.dateStr, dr)
          issueParts.push(`${resolved ? '[OK] ' : ''}${dr}${note ? ` — ${note}` : ''}`)
        })
        day.underpaidVehicles.forEach((pl) => {
          const driver = periodDrivers.find((d) => {
            if (d.defaultVehicle !== pl) return false
            if (d.startDate && d.startDate > day.dateStr) return false
            if (d.endDate && d.endDate < day.dateStr) return false
            return true
          })
          if (!driver) return
          const expected = day.isSunday
            ? driver.defaultAmountSunday || driver.defaultAmount || 0
            : driver.defaultAmount || 0
          const paid = day.dayRecords
            .filter((r) => r.plate === pl)
            .reduce((s, r) => s + (r.amount || 0), 0)
          const note = getNote(day.dateStr, driver.name)
          const resolved = getResolved(day.dateStr, driver.name)
          issueParts.push(
            `[~] ${resolved ? '[OK] ' : ''}${driver.name.split(' ')[0]} ${fmt(paid)}/${fmt(expected)}${note ? ` — ${note}` : ''}`,
          )
        })
        day.picoPlacaDrivers.forEach((dr) => {
          const driverObj = periodDrivers.find((d) => d.name === dr)
          issueParts.push(
            `[P&P] ${dr.split(' ')[0]}${driverObj?.defaultVehicle ? ` ${driverObj.defaultVehicle}` : ''}`,
          )
        })
      }
      const dayLabel = [
        String(day.d).padStart(2, '0'),
        day.isHoliday ? '(F)' : '',
        day.hasPicoPlaca && day.status !== 'none' ? '(P&P)' : '',
      ]
        .filter(Boolean)
        .join(' ')
      return [
        {
          content: dayLabel,
          styles: {
            fontStyle: day.isToday ? 'bold' : 'normal',
            textColor: day.isFuture ? [173, 181, 189] : [30, 58, 95],
          },
        },
        {
          content: dayNames[day.dow],
          styles: {
            textColor:
              day.isSunday || day.isHoliday
                ? [124, 94, 0]
                : day.isFuture
                  ? [173, 181, 189]
                  : [100, 116, 139],
            fontStyle: day.isSunday || day.isHoliday ? 'bold' : 'normal',
          },
        },
        { content: resolvedLabel },
        {
          content: day.isFuture ? '' : String(day.dayRecords.length),
          styles: { halign: 'center' },
        },
        {
          content: day.isFuture ? '' : day.total > 0 ? fmt(day.total) : '—',
          styles: { halign: 'right', fontStyle: 'bold' },
        },
        { content: settledStr },
        { content: issueParts.join('\n') },
      ]
    })

    const totalCount = pastDays.reduce((s, d) => s + d.dayRecords.length, 0)
    const totalAmt = pastDays.reduce((s, d) => s + d.total, 0)

    autoTable(doc, {
      startY: topY + boxH + 6,
      head: [['Dia', 'Sem.', 'Estado', 'Liq.', 'Total', 'Liquidaron', 'Sin liquidar / Notas']],
      body: tableRows,
      foot: [
        [
          { content: '', colSpan: 2 },
          { content: 'TOTAL', styles: { fontStyle: 'bold', halign: 'center' } },
          { content: String(totalCount), styles: { halign: 'center', fontStyle: 'bold' } },
          { content: fmt(totalAmt), styles: { halign: 'right', fontStyle: 'bold' } },
          { content: '' },
          { content: '' },
        ],
      ],
      styles: {
        fontSize: 7.5,
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      footStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 11, halign: 'center' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 28 },
        5: { cellWidth: 'auto' },
        6: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section !== 'body') return
        if (data.column.index === 2) {
          const day = auditDays[data.row.index]
          if (!day) return
          const resolved = isAllResolved(day)
          if (resolved || day.status === 'full') {
            data.cell.styles.textColor = [47, 158, 68]
            data.cell.styles.fillColor = [240, 253, 244]
          } else if (day.status === 'none') {
            data.cell.styles.textColor = [180, 30, 30]
            data.cell.styles.fillColor = [255, 245, 245]
          } else if (day.status === 'partial') {
            data.cell.styles.textColor = [166, 93, 0]
            data.cell.styles.fillColor = [255, 251, 235]
          } else if (day.status === 'future') {
            data.cell.styles.textColor = [173, 181, 189]
            data.cell.styles.fillColor = [248, 250, 252]
          }
        }
        if (data.column.index === 6 && data.cell.raw?.content)
          data.cell.styles.textColor = [180, 30, 30]
      },
      alternateRowStyles: { fillColor: [250, 251, 252] },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(7)
        doc.setTextColor(160)
        doc.text(
          `Pagina ${data.pageNumber} de ${pageCount}`,
          pageW - 14,
          doc.internal.pageSize.getHeight() - 5,
          { align: 'right' },
        )
        doc.setTextColor(0)
      },
      margin: { left: 14, right: 14 },
      showFoot: 'lastPage',
    })
    doc.save(`auditoria_${auditMonthStr}.pdf`)
  }

  return { exportAuditToExcel, exportAuditToPdf }
}
