import os
import uuid
import pdfplumber
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from mod import obtener_pais_ip, verificar_contenido_toxico

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://www.buhorater.com", "http://localhost:3000"]}})
app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024 

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")

def verificar_autenticacion():
    """Valida la API Key interna en los headers"""
    key = request.headers.get('x-api-key')
    return key == INTERNAL_API_KEY

def extraer_nombres_del_pdf(pdf_path):
    nombres_encontrados = set()
    patron_linea = re.compile(r"([A-ZÑ\s]{10,})\s+(\d+[A-Z]-[A-Z0-9]+)")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text: continue
                coincidencias = patron_linea.findall(text)
                for match in coincidencias:
                    nombre = match[0].strip().replace('\n', ' ')
                    palabras_ruido = ["SIN ASIGNAR", "HORARIO", "REVISAR", "FECHA", "PAGINA"]
                    if any(x in nombre for x in palabras_ruido): continue
                    nombre = " ".join(nombre.split())
                    if len(nombre) > 5:
                        nombres_encontrados.add(nombre)
    except Exception as e:
        print(f"Error PDF: {e}")
    return sorted(list(nombres_encontrados))

@app.route('/')
def health_check():
    return jsonify({"status": "Obrero activo 🦉", "moderation": "ready"})

@app.route('/verificar-resena', methods=['POST'])
def verificar_resena():
    """Ruta para filtrar reseñas por IP e IA"""
    if not verificar_autenticacion():
        return jsonify({"error": "No autorizado"}), 401

    ip_usuario = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0].strip()

    pais = obtener_pais_ip(ip_usuario)
    if pais != "MX":
        return jsonify({"error": f"Ubicación ({pais}) no permitida para comentar."}), 403

    data = request.json
    texto = data.get("texto", "")
    if not texto or len(texto) < 15:
        return jsonify({"error": "Reseña demasiado corta."}), 400

    es_toxico, razones = verificar_contenido_toxico(texto)
    if es_toxico:
        return jsonify({
            "status": "rejected",
            "error": "El comentario no cumple con las normas de la comunidad.",
            "motivos": razones
        }), 400

    return jsonify({"status": "approved"}), 200

@app.route('/analizar-horario', methods=['POST'])
def procesar_horario():
    if not verificar_autenticacion():
        return jsonify({"error": "No autorizado"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "Archivo no encontrado"}), 400
    
    file = request.files['file']
    id_peticion = str(uuid.uuid4())
    temp_path = f"temp_{id_peticion}.pdf"
    
    try:
        file.save(temp_path)
        lista_nombres = extraer_nombres_del_pdf(temp_path)
        return jsonify({"status": "success", "maestros": lista_nombres})
    except Exception as e:
        return jsonify({"error": "Error al procesar el archivo"}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "Archivo demasiado grande (máximo 2MB)"}), 413

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)