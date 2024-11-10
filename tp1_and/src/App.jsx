import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [results, setResults] = useState(null);
  const [filePath, setFilePath] = useState(''); // Déclaration de l'état pour le chemin du fichier

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setColumns(response.data.columns);
      setFilePath(response.data.file_path); // Assurez-vous de capturer le chemin du fichier
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error.response ? error.response.data : error.message);
    }
  };

  const handleColumnTypeChange = (col, type) => {
    if (!col || !type) return; // Vérifiez que les valeurs ne sont pas nulles
    setColumnTypes((prev) => ({ ...prev, [col]: type }));
  };
  const [distanceMatrix, setDistanceMatrix] = useState([]);
 
const handleProcessColumns = async () => {
  console.log("rani f handleProcessColumns")
  console.log(filePath)  // Use the correct variable name here
  console.log(columnTypes)  // And here too

  try {
    const response = await axios.post('http://localhost:5000/process_columns', {
      file_path: filePath,  // Use filePath in the request payload
      column_types: columnTypes,  // Use columnTypes here as well
    });

    setResults(response.data.results);  // Store the results

    // If distance_matrix is part of the results, store it
    if (response.data.results.distance_matrix) {
      setDistanceMatrix(response.data.results.distance_matrix);
    }
  } catch (error) {
    console.error('Erreur lors du traitement des colonnes:', error);
  }
};


const renderDistanceMatrix = () => {
  if (distanceMatrix.length === 0) {
    return <p>No distance matrix to display.</p>;
  }

  return (
    <table border="1">
      <thead>
        <tr>
          {distanceMatrix[0].map((_, index) => (
            <th key={index}>Column {index + 1}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {distanceMatrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) => (
              <td key={colIndex}>{cell.toFixed(2)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

  return (
    <div>
      <h2>Upload File and Process Columns</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      
      {columns.length > 0 && (
        <>
          <h3>Choisir le type de colonnes</h3>
          <ul>
            {columns.map((col, index) => (
              <li key={index}>
                {col}:
                <select
                  onChange={(e) => handleColumnTypeChange(col, e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="1">Ordinal</option>
                  <option value="0" defaultValue>Nominal</option>
                </select>
              </li>
            ))}
          </ul>
          <button onClick={handleProcessColumns}>Process Columns</button>
        </>
      )}

      {results && (
        <div>
          <h3>Résultats</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
      {renderDistanceMatrix()}
    </div>
  );
}

export default App;