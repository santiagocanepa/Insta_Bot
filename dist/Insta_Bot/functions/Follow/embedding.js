import fetch from 'node-fetch';
const API_URL = 'http://127.0.0.1:8081/predict_gender'; // Actualiza la ruta según sea necesario
export async function embedding(description) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario: description }) // Actualiza el cuerpo de la solicitud según sea necesario
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parsea la respuesta como EmbeddingResponse
        const data = await response.json();
        return data.genero; // Cambia esto según el tipo de respuesta que esperas
    }
    catch (error) {
        console.error('Error fetching embedding:', error);
        throw error;
    }
}
