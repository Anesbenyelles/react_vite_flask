import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelTable = () => {
  const [data, setData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        setData(sheetData);
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <table border="1">
        <thead>
          <tr>
            {data[0]?.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelTable;
