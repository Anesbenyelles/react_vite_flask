import React, { useState } from 'react';
import axios from 'axios';

function CoderOrdinal() {
  const [values, setValues] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/coder_ordinal', {
        values: values.split(','),
      });
      setResult(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Coder Ordinal</h2>
      <input
        type="text"
        placeholder="Entrez des valeurs séparées par des virgules"
        value={values}
        onChange={(e) => setValues(e.target.value)}
      />
      <button onClick={handleSubmit}>Coder</button>
      {result && <div>Résultat : {JSON.stringify(result)}</div>}
    </div>
  );
}

export default CoderOrdinal;
