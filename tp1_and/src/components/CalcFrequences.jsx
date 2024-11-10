import React, { useState } from 'react';
import axios from 'axios';

function CalcFrequences() {
  const [values, setValues] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/calc_fréquences', {
        values: values.split(',').map(Number),
      });
      setResult(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Calculer Fréquences</h2>
      <input
        type="text"
        placeholder="Entrez des valeurs séparées par des virgules"
        value={values}
        onChange={(e) => setValues(e.target.value)}
      />
      <button onClick={handleSubmit}>Calculer</button>
      {result && <div>Résultat : {JSON.stringify(result)}</div>}
    </div>
  );
}

export default CalcFrequences;
