import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateInvoicePDF = (invoice, shop, action = 'download') => {
    const doc = new jsPDF()

    // Shop Details
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(shop?.shopName || 'Electronics Shop', 105, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(shop?.address || '', 105, 26, { align: 'center' })
    doc.text(`GST: ${shop?.gstNumber || 'N/A'} | Phone: ${shop?.contactNumber || ''}`, 105, 31, { align: 'center' })

    doc.line(10, 35, 200, 35)

    // Invoice Meta
    doc.setFontSize(11)
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, 45)
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 51)

    // Customer Details
    doc.text(`Customer Name: ${invoice.customerDetails?.name || 'Walk-in'}`, 130, 45)
    doc.text(`Mobile: ${invoice.customerDetails?.mobile || 'N/A'}`, 130, 51)
    if (invoice.customerDetails?.address) {
        doc.text(`Address: ${invoice.customerDetails?.address}`, 130, 57)
    }

    // Items Table
    const tableColumn = ["#", "Item", "HSN", "Qty", "Price", "GST%", "Total"]
    const tableRows = []

    invoice.items.forEach((item, index) => {
        const itemData = [
            index + 1,
            item.productName,
            item.hsnCode || '-',
            `${item.quantity} ${item.unit}`,
            item.price.toFixed(2),
            item.gstPercent + '%',
            item.total.toFixed(2)
        ]
        tableRows.push(itemData)
    })

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 9 }
    })

    // Footer Totals
    const finalY = (doc.lastAutoTable?.finalY || 150) + 10

    doc.setFontSize(10)
    doc.text(`Sub Total:`, 140, finalY)
    doc.text(`${invoice.subTotal.toFixed(2)}`, 190, finalY, { align: 'right' })

    doc.text(`GST Total:`, 140, finalY + 6)
    doc.text(`${invoice.totalGST.toFixed(2)}`, 190, finalY + 6, { align: 'right' })

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Grand Total:`, 140, finalY + 14)
    doc.text(`${invoice.grandTotal.toFixed(2)}`, 190, finalY + 14, { align: 'right' })

    // Payment Info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Payment Mode: ${invoice.paymentType}`, 14, finalY + 14)

    doc.setFontSize(8)
    doc.text('Thank you for your business!', 105, 280, { align: 'center' })

    // Action Handling
    if (action === 'print') {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        doc.save(`${invoice.invoiceNumber}.pdf`)
    }
}
