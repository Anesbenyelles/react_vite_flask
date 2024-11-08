import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      setColumns(response.data.columns);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {columns.length > 0 && (
        <div>
          <h3>Colonnes :</h3>
          <ul>
            {columns.map((col, index) => (
              <li key={index}>{col}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
