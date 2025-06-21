import React from 'react';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {saveAs} from 'file-saver';

const DownloadMenu=({tableRef,tableName='TableCraftData', columns=[], rows=[], theme='light'})=>{
    const fileSafeName=`${tableName}_${new Date().toISOString().slice(0,10)}`;
    const getDataForExport=()=>{
        return rows.map(row=>{
            const result={};
            columns.forEach(col=>{
                result[col.label]=row[col.label];
            });
            return result;
        });
    };
    const exportCSV=()=>{
        const csv=Papa.unparse(getDataForExport());
        const blob=new Blob([csv],{type: 'text/csv;charset=utf-8'});
        saveAs(blob, `${fileSafeName}.csv`);

    };
    const exportExcel=()=>{
        const ws=XLSX.utils.json_to_sheet(getDataForExport());
        const wb=XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        const wbout=XLSX.write(wb,{bookType:'xlsx', type:'array'});
        saveAs(new Blob([wbout],{type:'application/octet-stream'}),`${fileSafeName}.xlsx`);
    };
    const exportJSON = () => {
        const blob=new Blob([JSON.stringify(getDataForExport(), null, 2)],{
            type:'application/json',
        });
        saveAs(blob,  `${fileSafeName}.json`);
    };
    const exportPDF = async () => {
        if (!tableRef?.current) {
            alert('Table container not found!');
            return;
        }
        const canvas = await html2canvas(tableRef.current, {
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const width = pdf.internal.pageSize.getWidth();
        const height = (canvas.height * width) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${fileSafeName}.pdf`);
    };
    return(
        <div className='relative inline-block text-left m-2'>
            
                <div className="absolute z-10 mt-2 w-40 bg-white border rounded-md shadow-lg text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-100">
                <button onClick={exportCSV} className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">Export as CSV</button>
                <button onClick={exportExcel} className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">Export as Excel</button>
                <button onClick={exportJSON} className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">Export as JSON</button>
                <button onClick={exportPDF} className="w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">Export as PDF</button>
            </div>
           
        </div>
    );
};
export default DownloadMenu;
