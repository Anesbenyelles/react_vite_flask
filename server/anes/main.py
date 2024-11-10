from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from Codage import (afficher_colonnes, recuperer_colonne, calculer_distance_dissemblance,
                    coder_valeurs, appliquer_codage_en_matrice, trier_selon_ordre_automatique,
                    tablec_ordinal, coder_ordinal, calculer_burts)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'xls', 'xlsx', 'csv'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier reçu"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Aucun fichier sélectionné"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        try:
            columns = afficher_colonnes(file_path)
            return jsonify({"columns": columns, "file_path": file_path})
        except Exception as e:
            return jsonify({"error": f"Erreur lors du traitement du fichier : {str(e)}"}), 500
    return jsonify({"error": "Format de fichier non valide"}), 400
@app.route('/process_columns', methods=['POST'])
def process_columns():
    data = request.get_json()
    file_path = data.get('file_path')
    column_types = data.get('column_types')

    if not file_path or not column_types:
        return jsonify({"error": "Invalid data"}), 400
        


    try:
        df = pd.read_excel(file_path) if file_path.endswith(('.xls', '.xlsx')) else pd.read_csv(file_path)

        results = {}
        
        for column, col_type in column_types.items():
            

            print(f"Processing column: {column} with type: {col_type}")  # Add logging for each column
            valeurs = df[column].dropna().tolist()
            
            try:
                if col_type == '1':  # Ordinal
                    valeurs_triees = trier_selon_ordre_automatique(set(valeurs))
                    codage = coder_ordinal(valeurs_triees)
                    matrice_codage = tablec_ordinal(codage, valeurs, valeurs_triees)
                elif col_type == '0':  # Nominal
                    codage = coder_valeurs(set(valeurs))
                    matrice_codage = appliquer_codage_en_matrice(valeurs, codage)
                else:
                    return jsonify({"error": f"Type de colonne non valide pour {column}"}), 400

                results[column] = matrice_codage.tolist()
            except Exception as col_error:
                print(f"Error processing column {column}: {col_error}")  # Log column errors
                return jsonify({"error": f"Erreur dans la colonne '{column}': {str(col_error)}"}), 500

        # Additional operations like calculating distance and Burt matrix
        try:
            matrix_values = np.concatenate(list(results.values()), axis=1)
            distance_matrix = calculer_distance_dissemblance(matrix_values)
            results['distance_matrix'] = distance_matrix.tolist()
        except Exception as dist_error:
            print(f"Error calculating distance matrix: {dist_error}")  # Log matrix errors
            return jsonify({"error": f"Erreur lors du calcul de la matrice de distance : {str(dist_error)}"}), 500

        try:
            burt_matrix = calculer_burts(matrix_values)
            results['burt_matrix'] = burt_matrix.tolist()
        except Exception as burt_error:
            print(f"Error calculating Burt matrix: {burt_error}")  # Log Burt matrix errors
            return jsonify({"error": f"Erreur lors du calcul de la matrice de Burt : {str(burt_error)}"}), 500

        return jsonify({"message": "Traitement terminé", "results": results})

    except Exception as e:
        print(f"General error: {str(e)}")  # Log general error
        return jsonify({"error": f"Erreur générale : {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
