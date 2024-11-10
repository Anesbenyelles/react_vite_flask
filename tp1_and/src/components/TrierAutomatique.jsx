import React, { useState } from 'react';
import axios from 'axios';

function TrierAutomatique() {
  const [values, setValues] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/trier_selon_ordre_automatique', {
        values: values.split(','),
      });
      setResult(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Trier Automatiquement</h2>
      <input
        type="text"
        placeholder="Entrez des valeurs séparées par des virgules"
        value={values}
        onChange={(e) => setValues(e.target.value)}
      />
      <button onClick={handleSubmit}>Trier</button>
      {result && <div>Résultat : {JSON.stringify(result)}</div>}
    </div>
  );
}

export default TrierAutomatique;
