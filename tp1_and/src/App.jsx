import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

function App() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle file drop or selection
  const { getRootProps, getInputProps } = useDropzone({
    accept: '.xls,.xlsx',
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles[0]),
  });

  // Handle file upload to Flask server
  const handleFileUpload = async (file) => {
    setLoading(true); // Set loading state while processing the file
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data); // Log the response data
      setTableData(response.data); // Store the data in state for table rendering
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false); // Turn off loading state
    }
  };

  // Render table with the data received from Flask
  const renderTable = () => {
    if (tableData.length === 0) return null; // If no data, don't render table

    const headers = Object.keys(tableData[0]); // Get headers from the first row of data

    return (
      <table border="1" cellPadding="10" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th> // Render table headers
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td> // Render each row's data
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <h1>Upload and Display Excel Data</h1>
      <div {...getRootProps()} style={dropzoneStyles}>
        <input {...getInputProps()} />
        <p>Drag & drop an Excel file here, or click to select one</p>
      </div>

      {loading && <p>Loading...</p>} {/* Show loading message while processing the file */}

      {renderTable()} {/* Render the table once data is available */}
    </div>
  );
}

// Basic styling for the dropzone
const dropzoneStyles = {
  border: '2px dashed #cccccc',
  padding: '20px',
  textAlign: 'center',
  marginBottom: '20px',
};

export default App;
