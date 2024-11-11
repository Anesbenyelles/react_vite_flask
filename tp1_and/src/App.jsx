import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleColumnTypeChange = (column, value) => {
    setColumnTypes({
      ...columnTypes,
      [column]: value,
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setColumns(data.columns);
      await processColumns(data.file_path);
    } catch (err) {
      setError('Erreur lors de l\'upload du fichier');
      setLoading(false);
    }
  };

  const processColumns = async (filePath) => {
    const columnData = Object.keys(columnTypes).map((column) => ({
      column,
      type: columnTypes[column],
    }));

    try {
      const response = await fetch('http://127.0.0.1:5000/process_columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath, column_types: columnTypes }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setResults(data);
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du traitement des colonnes');
      setLoading(false);
    }
  };

  const renderMatrix = (matrix) => {
    return (
      <table border="1">
        <thead>
          <tr>
            {matrix[0].map((_, index) => (
              <th key={index}>Col {index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <h1>Application de traitement de fichier</h1>
      
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Chargement...' : 'Télécharger et traiter'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {columns.length > 0 && (
        <div>
          <h2>Colonnes disponibles :</h2>
          <ul>
            {columns.map((col, index) => (
              <li key={index}>
                {col}
                <select
                  onChange={(e) => handleColumnTypeChange(col, e.target.value)}
                  value={columnTypes[col] || ''}
                >
                  <option value="">Sélectionner le type</option>
                  <option value="0">Nominal</option>
                  <option value="1">Ordinal</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results && (
        <div>
          <h2>Résultats</h2>
          <div>
            <h3>Matrice de dissemblance</h3>
            {results.distance_matrix && renderMatrix(results.distance_matrix)}
          </div>
          <div>
            <h3>Matrice de Burt</h3>
            {results.burt_matrix && renderMatrix(results.burt_matrix)}
          </div>
          <div>
            <h3>Tables de contingence</h3>
            {Object.keys(results.contingency_tables || {}).map((tableKey) => (
              <div key={tableKey}>
                <h4>{tableKey}</h4>
                {renderMatrix(results.contingency_tables[tableKey])}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
