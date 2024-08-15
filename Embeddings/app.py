import openai
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from utils import predecir_humano_o_genero
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG)

@app.route('/predict_gender', methods=['POST'])
def predict_gender():
    data = request.get_json()
    nombre_usuario = data['nombre_usuario']
    try:
        resultado = predecir_humano_o_genero(nombre_usuario)
        logging.debug(f"Resultado: {resultado}, Tipo: {type(resultado)}")
        return jsonify(genero=int(resultado))  # Asegurarse de que el resultado sea un tipo básico
    except Exception as e:
        logging.exception("Error processing request")
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
