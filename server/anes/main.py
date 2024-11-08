from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']
    if file and file.filename.endswith('.xlsx'):
        try:
            df = pd.read_excel(file)
            # Convert Excel data to JSON format
            data = df.to_dict(orient='records')
            return jsonify(data)
        except Exception as e:
            return f"Error processing file: {e}", 500
    return 'Invalid file format', 400

if __name__ == '__main__':
    app.run(debug=True)
