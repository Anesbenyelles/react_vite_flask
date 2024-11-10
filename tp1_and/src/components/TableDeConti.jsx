import React, { useState } from 'react';
import axios from 'axios';

function TableDeConti() {
  const [values, setValues] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/clc_table_de_conti', {
        values: values.split(';').map((row) => row.split(',').map(Number)),
      });
      setResult(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Calculer Table de Contingence</h2>
      <textarea
        placeholder="Entrez des lignes de valeurs séparées par des points-virgules et des colonnes par des virgules"
        value={values}
        onChange={(e) => setValues(e.target.value)}
      />
      <button onClick={handleSubmit}>Calculer</button>
      {result && <div>Résultat : {JSON.stringify(result)}</div>}
    </div>
  );
}

export default TableDeConti;
