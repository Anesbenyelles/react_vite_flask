from flask import Flask, request, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow CORS for React frontend

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        # Read the file as a pandas DataFrame
        df = pd.read_excel(file)
        # Convert the dataframe to a dictionary and send it as JSON
        return jsonify(df.to_dict(orient='records'))
    return jsonify({"error": "No file uploaded"}), 400

if __name__ == '__main__':
    app.run(debug=True)
