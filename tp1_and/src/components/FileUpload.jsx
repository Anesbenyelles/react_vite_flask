import { useDropzone } from 'react-dropzone';
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onDrop }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="border p-6 border-dashed rounded-md bg-gray-100">
      <input {...getInputProps()} />
      <p className="text-center text-gray-700">
        Drag & drop an Excel file here, or click to select one
      </p>
    </div>
  );
};

const App = () => {
  const [data, setData] = useState(null);

  const onDrop = (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    axios.post('http://localhost:5000/upload', formData)
      .then(response => {
        setData(response.data);
      })
      .catch(error => console.error('Error uploading file:', error));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Upload and View Excel File</h1>
      <FileUpload onDrop={onDrop} />

      {data && (
        <div className="mt-6">
          <table className="table-auto w-full">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border px-4 py-2">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx} className="border px-4 py-2">{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => window.print()}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md"
          >
            Print
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
