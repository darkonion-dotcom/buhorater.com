import os
import geocoder # No olvides: pip install geocoder
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import re
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)


URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(URL, KEY)

TABLA_PROFESORES = 'maestros'
TABLA_RESENAS = 'resenas'
def es_mexicano():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0]
    g = geocoder.ip(ip)
    return g.country == 'MX'

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
                    if any(x in nombre for x in ["SIN ASIGNAR", "HORARIO"]): continue
                    nombre = " ".join(nombre.split())
                    nombres_encontrados.add(nombre)
    except Exception as e:
        print(f"Error PDF: {e}")
    return sorted(list(nombres_encontrados))

@app.route('/')
def index():
    return jsonify({"status": "Servidor Buhorater funcionando correctamente 🦉"})

@app.route('/analizar-horario', methods=['POST'])
def procesar_horario():
    if not es_mexicano():
        return jsonify({"error": "Solo México"}), 403
    
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['file']
    temp_path = "temp_horario.pdf"
    try:
        file.save(temp_path)
        lista_nombres_pdf = extraer_nombres_del_pdf(temp_path)
        return jsonify({"mensaje": "Completado", "maestros": lista_nombres_pdf})
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)
@app.route('/publicar-resena', methods=['POST'])
def publicar_resena():
    if not es_mexicano():
        return jsonify({"error": "Solo México"}), 403
    
    datos = request.json
    try:
        response = supabase.table(TABLA_RESENAS).insert(datos).execute()
        return jsonify({"status": "éxito"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)