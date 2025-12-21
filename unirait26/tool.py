import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import re
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)
URL = "https://bpiujyhyejolnthdezxf.supabase.co"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwaXVqeWh5ZWpvbG50aGRlenhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMDI4NzUsImV4cCI6MjA4MTU3ODg3NX0.pPjXHC2saUAZ81T36PSBRgQGbDqQfw6A_Jxf1R4XMrU"
supabase: Client = create_client(URL, KEY)

TABLA_PROFESORES = 'profesores' 

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
                    nombre_crudo = match[0]
                    nombre = nombre_crudo.strip().replace('\n', ' ')
                    
                    if "SIN ASIGNAR" in nombre: continue
                    if "HORARIO" in nombre: continue
                    
                    nombre = " ".join(nombre.split())
                    nombres_encontrados.add(nombre)
                    
    except Exception as e:
        print(f"Error interno leyendo PDF: {e}")

    return sorted(list(nombres_encontrados))

@app.route('/')
def index():
    return jsonify({"status": "Servidor Buhorater funcionando correctamente 🦉"})

@app.route('/analizar-horario', methods=['POST'])
def procesar_horario():
    if 'file' not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    temp_path = "temp_horario.pdf"
    
    try:
        file.save(temp_path)
    
        lista_nombres_pdf = extraer_nombres_del_pdf(temp_path)
    
        maestros_encontrados_bd = []
        maestros_no_encontrados = []

        print(f"Buscando {len(lista_nombres_pdf)} maestros en Supabase...")

        for nombre_busqueda in lista_nombres_pdf:
            response = supabase.table(TABLA_PROFESORES)\
                .select("*")\
                .ilike("nombre", f"%{nombre_busqueda}%")\
                .execute()
            
            if response.data:
                maestros_encontrados_bd.extend(response.data)
            else:
                maestros_no_encontrados.append(nombre_busqueda)

        return jsonify({
            "mensaje": "Búsqueda completada",
            "encontrados": maestros_encontrados_bd,
            "no_encontrados": maestros_no_encontrados,
            "total_procesados": len(lista_nombres_pdf)
        })

    except Exception as e:
        print(f"Error en el servidor: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)