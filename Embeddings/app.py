import openai
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from utils1 import predecir_genero
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG)

@app.route('/predict_gender', methods=['POST'])
def handle_predict_gender():
    data = request.get_json()
    nombre_usuario = data['nombre_usuario']
    try:
        genero_predicho = predecir_genero(nombre_usuario)
        logging.debug(f"Genero predicho: {genero_predicho}, Tipo: {type(genero_predicho)}")
        return jsonify(genero=int(genero_predicho))  # Asegurarse de que el resultado sea un tipo básico
    except Exception as e:
        logging.exception("Error processing request")
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
