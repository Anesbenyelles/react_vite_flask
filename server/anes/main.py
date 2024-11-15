import json
from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from Codage import (
    afficher_colonnes,
    trier_selon_ordre_automatique,
    coder_ordinal,
    tablec_ordinal,
    coder_valeurs,
    appliquer_codage_en_matrice,
    calculer_distance_dissemblance,
    calculer_burts,
    clc_table_de_conti,
    calc_frequencies,
    calc_profitligne,
    calculer_nuage_points,
    calculer_centre_gravite,
    calculer_inertie
)
import itertools

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
        return jsonify({"error": "Chemin du fichier ou types des colonnes manquants"}), 400

    try:
        if file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            df = pd.read_csv(file_path)

        results = {}
        dictionnaire_indices = {}
        current_index = 0

        for column, col_type in column_types.items():
            valeurs = df[column].dropna().tolist()
            valeurs_uniques = set(valeurs)
            debut = current_index
            fin = current_index + len(valeurs_uniques) - 1
            dictionnaire_indices[column] = (debut, fin)
            current_index = fin + 1

            if col_type == '1':
                valeurs_triees = trier_selon_ordre_automatique(valeurs_uniques)
                codage = coder_ordinal(valeurs_triees)
                matrice_codage = tablec_ordinal(codage, valeurs, valeurs_triees)
            elif col_type == '0':
                codage = coder_valeurs(valeurs_uniques)
                matrice_codage = appliquer_codage_en_matrice(valeurs, codage)
            else:
                return jsonify({"error": f"Type de colonne non valide pour {column}"}), 400

            results[column] = matrice_codage.tolist()  # Ensure it's serializable

        matrix_values = np.concatenate(list(results.values()), axis=1)
        distance_matrix = calculer_distance_dissemblance(matrix_values)
        results['distance_matrix'] = distance_matrix.tolist()  # Convert to list

        burt_matrix = calculer_burts(matrix_values)
        results['burt_matrix'] = burt_matrix.tolist()  # Convert to list

        contingency_tables = {}
        freq_tables = {}
        proftlignes = {}
        nuage_points = {}
        center_gravitys = {}
        inertie_values = {}

        for col1, col2 in itertools.combinations(column_types.keys(), 2):
            contingency_table = clc_table_de_conti(dictionnaire_indices, burt_matrix, col1, col2)
            contingency_tables[f"{col1}_{col2}"] = contingency_table.tolist()  # Convert to list

            freq_table = calc_frequencies(contingency_table)
            freq_tables[f"{col1}_{col2}"] = freq_table.tolist()  # Convert to list

            proftligne = calc_profitligne(freq_table)
            proftlignes[f"{col1}_{col2}"] = proftligne.tolist()  # Convert to list

            nuage_point = calculer_nuage_points(proftligne, freq_table)
            nuage_points[f"{col1}_{col2}"] = nuage_point.tolist() if isinstance(nuage_point, np.ndarray) else nuage_point

            center_gravity = calculer_centre_gravite(nuage_point)
            center_gravitys[f"{col1}_{col2}"] = center_gravity.tolist() if isinstance(center_gravity, np.ndarray) else center_gravity

            inertie = calculer_inertie(nuage_point, center_gravity)
            inertie_values[f"{col1}_{col2}"] = inertie

        results.update({
            'contingency_tables': contingency_tables,
            'freq_tables': freq_tables,
            'profit_lines': proftlignes,
            'point_clouds': nuage_points,
            'center_gravitys': center_gravitys,
            'inertia_values': inertie_values
        })

    except Exception as e:
        return jsonify({"error": f"Erreur générale dans le traitement des colonnes : {str(e)}"}), 500

    print("***********************************************************************")
    print(f"results before the last return: {results}")
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
