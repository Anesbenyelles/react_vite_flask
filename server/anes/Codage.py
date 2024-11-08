import os
import numpy as np
import pandas as pd
import openpyxl
from openpyxl.utils import get_column_letter
from openpyxl.styles import Alignment

# Fonction pour afficher les colonnes du fichier Excel
def afficher_colonnes(fichier_excel):
    try:
        df = pd.read_excel(fichier_excel)
        colonnes = df.columns.tolist()
        print(f"Les colonnes du fichier sont : {colonnes}")
        return colonnes
    except FileNotFoundError:
        print(f"Le fichier '{fichier_excel}' n'a pas été trouvé.")
    except Exception as e:
        print(f"Erreur lors du chargement du fichier : {str(e)}")

# Fonction pour obtenir les valeurs d'une colonne sous forme de liste
def recuperer_colonne(fichier_excel, nom_colonne):
    try:
        df = pd.read_excel(fichier_excel)
        if nom_colonne in df.columns:
            return df[nom_colonne].tolist()
        else:
            print(f"La colonne '{nom_colonne}' n'existe pas dans le fichier.")
    except Exception as e:
        print(f"Erreur lors du chargement du fichier : {str(e)}")

# Fonction pour obtenir les valeurs uniques d'une colonne et les encoder
def coder_valeurs(valeurs_uniques):
    codage = {valeur: f'{bin(2**i)[2:]:0>{len(valeurs_uniques)}}' for i, valeur in enumerate(valeurs_uniques)}
    print(f"Codage binaire des valeurs uniques : {codage}")
    return codage

# Fonction pour appliquer le codage binaire sous forme de matrice de bits
def appliquer_codage_en_matrice(valeurs, codage):
    matrice_bits = []
    for val in valeurs:
        if val in codage:
            bits = [int(bit) for bit in codage[val]]
            matrice_bits.append(bits)
    matrice = np.array(matrice_bits)
    print("Matrice de codage binaire :")
    print(matrice)
    return matrice

# Fonction pour calculer la matrice de dissemblance entre les lignes
def calculer_distance_dissemblance(matrice_bits, nom_fichier):
    # Convert matrice_bits to a NumPy array if it isn't already
    matrice_bits = np.array(matrice_bits)

    # Remove the first row and the first column
    matrice_bits = matrice_bits[1:, 1:]  # Remove row 0 and column 0
    
    # Handle NaN values by replacing them with a specific value or dropping rows/columns as needed
    matrice_bits = np.nan_to_num(matrice_bits, nan=-1)  # Example: replacing NaN with -1
    
    n = matrice_bits.shape[0]  # Number of rows after removal
    matrice_distance = np.zeros((n, n))  # Initialize an n x n matrix for distances
    
    # Calculate the dissimilarity for each pair of rows
    for i in range(n):
        for j in range(n):
            dissemblance = np.sum(matrice_bits[i] != matrice_bits[j]) / matrice_bits.shape[1]
            matrice_distance[i, j] = dissemblance

    # Print the dissimilarity matrix
    print("Matrice de dissemblance dans fonction:")
    print(matrice_distance)
    
    # Save the dissimilarity matrix to an Excel file
    df_distance = pd.DataFrame(matrice_distance)
    df_distance.to_excel(nom_fichier, index=False, header=False)  # Save without index and header
    print(f"Matrice de dissemblance sauvegardée dans le fichier: {nom_fichier}")
    
    return matrice_distance


def sauvegarder_matrices_dans_fichier_unique(matrice_codage, nom_colonne, fichier_sortie):
    # Convertir matrice_codage en un tableau NumPy si ce n'est pas déjà le cas
    matrice_codage = np.array(matrice_codage)

    # Handle NaN values by replacing them with a specific value or dropping rows/columns as needed
    matrice_codage = np.nan_to_num(matrice_codage, nan=-1)  # Remplacer NaN avant d'écrire

    # Vérifie si le fichier existe déjà
    try:
        wb = openpyxl.load_workbook(fichier_sortie)
        ws = wb.active
    except FileNotFoundError:
        wb = openpyxl.Workbook()
        ws = wb.active
        # Si le fichier n'existe pas, crée une première ligne vide
        ws.append([])

    # Vérifie si le nom de la colonne principale existe déjà
    if nom_colonne not in [cell.value for cell in ws[1]]:
        start_col = ws.max_column + 1  # Trouve la colonne de départ
        end_col = start_col + matrice_codage.shape[1] - 1
        ws.merge_cells(start_row=1, start_column=start_col, end_row=1, end_column=end_col)
        ws.cell(row=1, column=start_col).value = nom_colonne
        ws.cell(row=1, column=start_col).alignment = Alignment(horizontal='center')

        # Ajoute les sous-colonnes avec un nom unique basé sur nom_colonne
        for i in range(matrice_codage.shape[1]):
            ws.cell(row=2, column=start_col + i, value=f"{nom_colonne}_{i + 1}")

    # Remplit les données de la matrice de codage sous les colonnes correspondantes
    for i, row in enumerate(matrice_codage, start=3):  # Débute à la 3ème ligne pour les données
        for j, val in enumerate(row):
            ws.cell(row=i, column=start_col + j, value=val)

    # Sauvegarde le fichier
    wb.save(fichier_sortie)
    print(f"Les données pour '{nom_colonne}' ont été sauvegardées avec succès dans '{fichier_sortie}'.")

    
def coder_ordinal(liste_ordoner):
    nombre_de_valeurs = len(liste_ordoner)
    matrice = [[0 for _ in range(nombre_de_valeurs)] for _ in range(nombre_de_valeurs)]

    for i in range(nombre_de_valeurs):
        for j in range(i, nombre_de_valeurs):
            matrice[i][j] = 1
    return matrice


def tablec_ordinal(matrice, colonne_liste, liste_ordoner):
    colomn_coder = []
    for element in colonne_liste:
        if element in liste_ordoner:
            index = liste_ordoner.index(element)
            ligne_specifique = matrice[index]
            colomn_coder.append(ligne_specifique)
        else:
            print(f"Warning: '{element}' not found in liste_ordoner.")
    return colomn_coder

def trier_selon_ordre_automatique(valeurs):
    # Afficher les valeurs uniques et demander à l'utilisateur de spécifier l'ordre
    print("Voici les valeurs uniques dans la colonne :")
    print(valeurs)

    ordre_personnalise = {}
    
    # Demander à l'utilisateur d'entrer l'ordre souhaité pour chaque valeur
    for valeur in valeurs:
        position = input(f"Entrez la position pour la valeur '{valeur}' (entier positif) : ")
        ordre_personnalise[valeur] = int(position)
    
    # Trier les valeurs selon les positions données par l'utilisateur
    valeurs_triees = sorted(ordre_personnalise, key=ordre_personnalise.get)
    
    return valeurs_triees
def calculer_burts(matrice_codage, nom_fichier):
    # Initialiser la matrice de Burt avec des zéros
    matrice_codage = np.array(matrice_codage)

    # Remove the first row and the first column
    matrice_codage = matrice_codage[1:, 1:]  # Remove row 0 and column 0
    
    # Handle NaN values by replacing them with a specific value or dropping rows/columns as needed
    matrice_codage = np.nan_to_num(matrice_codage, nan=-1)  # Example: replacing NaN with -1
    
    nb_colon = matrice_codage.shape[1]
    matrice_burt = [[0] * nb_colon for _ in range(nb_colon)]


    # Remplir la matrice de Burt
    for i in range(nb_colon):
        for j in range(nb_colon):
            # Calculer la co-occurrence entre les colonnes i et j
               matrice_burt[i][j] = np.sum(matrice_codage[:, i] * matrice_codage[:, j]) 

    df_distance = pd.DataFrame(matrice_burt)
    df_distance.to_excel(nom_fichier, index=False, header=False)  # Save without index and header
    print(f"Matrice de burt sauvegardée dans le fichier: {nom_fichier}")
    
    return matrice_burt

def clc_table_de_conti(dictionnaire, matriceburt, variable1, variable2, nom_fichier):
    # Convert matriceburt to a NumPy array
    matriceburt = np.array(matriceburt)
    print(f"la taille de matrice burt {matriceburt.shape[0]} x {matriceburt.shape[1]}")
    
    # Retrieve start and end indexes based on variable names in the dictionary
    try:
        col_1 = dictionnaire[variable1]
        col_2 = dictionnaire[variable2]
    except KeyError as e:
        print(f"Erreur: la variable {e} n'existe pas dans le dictionnaire.")
        return
    
    # Retrieve the columns for the selected variables
    variable1_values = matriceburt[:, col_1]
    variable2_values = matriceburt[:, col_2]
    
    # Initializing the contingency table
    contingency_table = np.zeros((2, 2))
    
    for i in range(len(variable1_values)):
        if variable1_values[i] == 1 and variable2_values[i] == 1:
            contingency_table[0][0] += 1
        elif variable1_values[i] == 1 and variable2_values[i] == 0:
            contingency_table[0][1] += 1
        elif variable1_values[i] == 0 and variable2_values[i] == 1:
            contingency_table[1][0] += 1
        else:
            contingency_table[1][1] += 1

    # Save the contingency table to an Excel file
    df_contingency = pd.DataFrame(contingency_table)
    df_contingency.to_excel(nom_fichier, index=False, header=False)
    print(f"Table de contingence sauvegardée dans le fichier: {nom_fichier}")

    return contingency_table

