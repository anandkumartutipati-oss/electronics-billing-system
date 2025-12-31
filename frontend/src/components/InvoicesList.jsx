import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getInvoices, reset } from '../features/invoices/invoiceSlice';
import { FileText, Download, Printer, Eye, Search, Filter } from 'lucide-react';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { getShop } from '../features/shops/shopSlice';
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const InvoicesList = ({ searchTerm = '' }) => {
    const dispatch = useDispatch();
    const { invoices, isLoading, isError, message } = useSelector((state) => state.invoices);
    const { user } = useSelector((state) => state.auth);
    const { currentShop } = useSelector((state) => state.shops);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invoices History');

        // Styles
        const titleStyle = { font: { name: 'Arial', family: 4, size: 18, underline: 'single', bold: true, color: { argb: 'FF006100' } }, alignment: { vertical: 'middle', horizontal: 'center' } };
        const subTitleStyle = { font: { name: 'Arial', family: 4, size: 12, bold: true, color: { argb: 'FF1F497D' } }, alignment: { vertical: 'middle', horizontal: 'center' } };
        const headerStyle = { font: { name: 'Arial', family: 4, size: 10, bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }, alignment: { vertical: 'middle', horizontal: 'center' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const dataStyle = { font: { name: 'Arial', family: 4, size: 10 }, alignment: { vertical: 'middle', horizontal: 'left' }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
        const centerDataStyle = { ...dataStyle, alignment: { vertical: 'middle', horizontal: 'center' } };

        // 1. Title Row
        worksheet.mergeCells('A1:F1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'SALES INVOICES REPORT';
        titleCell.style = titleStyle;
        worksheet.getRow(1).height = 30;

        // 2. Subtitle Row
        worksheet.mergeCells('A2:F2');
        const subTitleCell = worksheet.getCell('A2');
        subTitleCell.value = currentShop?.shopName || 'Billing System';
        subTitleCell.style = subTitleStyle;
        worksheet.getRow(2).height = 20;

        // 3. Date Row
        worksheet.mergeCells('A3:D3');
        const dateCell = worksheet.getCell('A3');
        dateCell.value = `Report Period: ${startDate || 'Start'} to ${endDate || 'Now'} | Generated: ${new Date().toLocaleString()}`;
        dateCell.font = { italic: true, size: 10 };
        worksheet.getRow(3).height = 20;

        // 4. Header Row
        const headerRow = worksheet.getRow(6);
        const headers = ['INVOICE NO', 'DATE', 'CUSTOMER NAME', 'MOBILE', 'AMOUNT (₹)', 'PAYMENT MODE'];
        headerRow.values = headers;
        headerRow.height = 25;
        headerRow.eachCell((cell) => {
            cell.style = headerStyle;
        });

        // 5. Data Rows
        let totalRevenue = 0;

        filteredInvoices.forEach((inv) => {
            totalRevenue += inv.grandTotal;

            const row = worksheet.addRow([
                inv.invoiceNumber,
                new Date(inv.createdAt).toLocaleDateString(),
                inv.customerDetails?.name || 'Walk-in',
                inv.customerDetails?.mobile || '-',
                Math.round(inv.grandTotal),
                inv.paymentType
            ]);

            row.eachCell((cell, colNumber) => {
                if (colNumber === 2 || colNumber === 5) { // Date, Payment Mode Center
                    cell.style = centerDataStyle;
                } else {
                    cell.style = dataStyle;
                }
            });
        });

        // 6. Summary
        const lastRowIdx = worksheet.lastRow.number + 2;
        const summaryRow = worksheet.getRow(lastRowIdx);
        summaryRow.getCell(4).value = 'TOTAL REVENUE:';
        summaryRow.getCell(4).style = { font: { bold: true }, alignment: { horizontal: 'right' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } } };
        summaryRow.getCell(5).value = Math.round(totalRevenue);
        summaryRow.getCell(5).style = { font: { bold: true }, alignment: { horizontal: 'left' }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } } };

        worksheet.columns = [
            { width: 20 },
            { width: 15 },
            { width: 25 },
            { width: 15 },
            { width: 15 },
            { width: 20 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Invoices_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    };

    useEffect(() => {
        dispatch(getInvoices());

        // Ensure we have shop details for PDF header
        if (user && user.shopId && !currentShop) {
            dispatch(getShop(user.shopId));
        }

    }, [dispatch, user, currentShop]);

    const handleDownload = (invoice) => {
        // Pass currentShop to generator
        generateInvoicePDF(invoice, currentShop);
    };

    const handlePrint = (invoice) => {
        // Generate PDF and open in new tab to print
        const pdf = generateInvoicePDF(invoice, currentShop, true); // We might need to adjust PDF generator to return blob url or handle print
        // For now, download is the standard "Save", let's make Print trigger download too or open a simple print view
        // A simple way is to re-use generateInvoicePDF but open it. 
        // Since generateInvoicePDF currently saves, we might just assume User prints the PDF.
        // Or we can implement a browser print window.print() on a simplified view. 
        // For now, let's treat Print as "Download & Print"
        generateInvoicePDF(invoice, currentShop);
    };

    const filteredInvoices = invoices.filter((inv) => {
        const matchSearch =
            inv.customerDetails?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customerDetails?.mobile?.includes(searchTerm);

        const matchDate = (() => {
            if (!startDate && !endDate) return true;
            const invDate = new Date(inv.createdAt);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            // Normalize time to start of day for comparison
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);
            const current = new Date(invDate);

            if (start && end) return current >= start && current <= end;
            if (start) return current >= start;
            if (end) return current <= end;
            return true;
        })();

        return matchSearch && matchDate;
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading Invoices...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full backdrop-blur-sm transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 transition-colors">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText className="text-blue-600 dark:text-blue-400" /> Invoices History
                </h2>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
                    <div className='flex gap-2 items-center'>
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Start Date</label>
                            <input
                                type="date"
                                className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] uppercase font-bold text-gray-400">End Date</label>
                            <input
                                type="date"
                                className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm h-[38px] mb-[1px]"
                    >
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 theme-table">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10 transition-colors">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice No</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                            <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {inv.invoiceNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(inv.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    <div className="font-medium text-gray-900 dark:text-white">{inv.customerDetails?.name || 'Walk-in'}</div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500">{inv.customerDetails?.mobile}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                    ₹{Math.round(inv.grandTotal)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${inv.paymentType === 'Cash' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800' :
                                        inv.paymentType === 'EMI' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-800' :
                                            inv.paymentType === 'Mixed' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800' :
                                                'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                                        }`}>
                                        {inv.paymentType === 'Mixed' ? (
                                            <>
                                                Mixed ({
                                                    [
                                                        inv.paymentBreakdown?.cash > 0 ? 'Cash' : null,
                                                        inv.paymentBreakdown?.upi > 0 ? 'UPI' : null,
                                                        inv.paymentBreakdown?.card > 0 ? 'Card' : null,
                                                        inv.paymentBreakdown?.emi > 0 ? 'EMI' : null
                                                    ].filter(Boolean).join(', ')
                                                })
                                            </>
                                        ) : inv.paymentType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleDownload(inv)}
                                            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 p-2 rounded-lg transition-colors flex items-center gap-1"
                                            title="Download PDF"
                                        >
                                            <Download size={16} /> <span className="text-xs">PDF</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
                                    No invoices found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicesList;
