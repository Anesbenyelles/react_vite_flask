import React, { useState } from 'react';
import axios from 'axios';

function EncodeColumn() {
  const [columnName, setColumnName] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/encode-column', {
        column: columnName,
      });
      setResult(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Encoder Colonne</h2>
      <input
        type="text"
        placeholder="Nom de la colonne"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
      />
      <button onClick={handleSubmit}>Encoder</button>
      {result && <div>Résultat : {JSON.stringify(result)}</div>}
    </div>
  );
}

export default EncodeColumn;
