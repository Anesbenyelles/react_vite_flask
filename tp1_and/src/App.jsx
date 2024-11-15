import { ChevronDown, FileText, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function Component() {
  const [file, setFile] = useState(null)
  const [columns, setColumns] = useState([])
  const [columnTypes, setColumnTypes] = useState({})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleColumnTypeChange = (column, value) => {
    setColumnTypes({
      ...columnTypes,
      [column]: value,
    })
  }

  const handleSubmit = async () => {
    if (!file) {
      alert('Veuillez sélectionner un fichier.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setColumns(data.columns)
      await processColumns(data.file_path)
    } catch (err) {
      setError('Erreur lors de l\'upload du fichier')
      setLoading(false)
    }
  }

  const processColumns = async (filePath) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/process_columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath, column_types: columnTypes }),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setLoading(false)
        return
      }

      setResults(data)
      setLoading(false)
    } catch (err) {
      setError('Erreur lors du traitement des colonnes')
      setLoading(false)
    }
  }

  const renderMatrix = (matrix, title) => {
    const getHeaderColor = () => {
      switch (title) {
        case 'Matrice de dissemblance':
          return 'bg-blue-500'
        case 'Matrice de Burt':
          return 'bg-green-500'
        default:
          return 'bg-purple-100'
      }
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${getHeaderColor()} text-white`}>
            <tr>
              {matrix[0].map((_, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Col {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderHistogram = (data, title) => {
    const chartData = data.flat().map((value, index) => ({ value, index: `${index}` }))

    return (
      <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title} - Histogram</h3>
        <p className="text-sm text-gray-600 mb-4">Distribution of values in the matrix</p>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderCombobar = (data, title) => {
    const chartData = data.map((row, rowIndex) => {
      const rowData = { name: `Row ${rowIndex + 1}` }
      row.forEach((value, colIndex) => {
        rowData[`Col ${colIndex + 1}`] = value
      })
      return rowData
    })

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

    return (
      <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title} - Combobar</h3>
        <p className="text-sm text-gray-600 mb-4">Comparison of values across rows and columns</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {data[0].map((_, colIndex) => (
                <Bar
                  key={`Col ${colIndex + 1}`}
                  dataKey={`Col ${colIndex + 1}`}
                  fill={colors[colIndex % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderPieChart = (data, title) => {
    const chartData = data.flat().reduce((acc, value, index) => {
      acc.push({ name: `Item ${index + 1}`, value })
      return acc
    }, [])

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

    return (
      <div className="w-full mt-6 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">{title} - Camembert</h3>
        <p className="text-sm text-gray-600 mb-4">Répartition des valeurs dans la matrice</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-0 w-screen">
      <div className="relative py-3 sm:max-w-full sm:mx-auto w-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 w-full">
          <div className="max-w-90 mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Application de traitement de fichier</h1>

            <div className="mb-6">
              <label htmlFor="file-upload" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                <Upload className="mr-2 h-5 w-5 text-gray-400" />
                <span>{file ? file.name : 'Sélectionner un fichier'}</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>

            <button onClick={handleSubmit} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400" disabled={loading}>
              {loading ? 'Chargement...' : 'Télécharger et traiter le fichier'}
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {columns.length > 0 && (
              <div className="mt-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Colonnes du fichier</h2>
                  <ul className="list-disc pl-5">
                    {columns.map((column, index) => (
                      <li key={index} className="mb-2">
                        <label htmlFor={`column-${column}`} className="text-sm">{column}</label>
                        <select
                          id={`column-${column}`}
                          value={columnTypes[column] || ''}
                          onChange={(e) => handleColumnTypeChange(column, e.target.value)}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded-md"
                        >
                          <option value="">Choisir un type</option>
                          <option value="0">nominal</option>
                          <option value="1">ordinal</option>
                        </select>
                      </li>
                    ))}
                  </ul>
                </div>

                <button onClick={handleSubmit} className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400" disabled={loading}>
                  {loading ? 'Traitement...' : 'Traiter les données'}
                </button>
              </div>
            )}

            {results && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-4">Résultats du traitement</h2>
                {results.matrice_dissemblance && renderMatrix(results.matrice_dissemblance, 'Matrice de dissemblance')}
                {results.matrice_burt && renderMatrix(results.matrice_burt, 'Matrice de Burt')}
                {results.histogram && renderHistogram(results.histogram, 'Histogramme')}
                {results.combobar && renderCombobar(results.combobar, 'Combobar')}
                {results.pie && renderPieChart(results.pie, 'Camembert')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
