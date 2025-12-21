import os  # <--- IMPORTANTE: Importamos librería del sistema operativo
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import re

app = Flask(__name__)
CORS(app)

def extraer_maestros(pdf_path):
    maestros_encontrados = set()
    
    # Patrón: NOMBRE + ESPACIO + AULA (Ej: MAZON MENDEZ MAYRA 8B-A201)
    patron_linea = re.compile(r"([A-ZÑ\s]{10,})\s+(\d+[A-Z]-[A-Z0-9]+)")

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                
                coincidencias = patron_linea.findall(text)
                
                for match in coincidencias:
                    nombre_crudo = match[0]
                    nombre = nombre_crudo.strip().replace('\n', ' ')
                    
                    if "SIN ASIGNAR" in nombre: continue
                    if "HORARIO" in nombre: continue
                    
                    nombre = " ".join(nombre.split())
                    maestros_encontrados.add(nombre)
                    
    except Exception as e:
        print(f"Error leyendo PDF: {e}")
        # No retornamos error aquí para permitir que el 'finally' del main borre el archivo

    return sorted(list(maestros_encontrados))

@app.route('/analizar-horario', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    file = request.files['file']
    temp_path = "temp_horario.pdf" # Nombre temporal
    
    try:
        # 1. Guardamos el archivo
        file.save(temp_path)
        
        # 2. Lo procesamos
        maestros = extraer_maestros(temp_path)
        
        return jsonify({"maestros": maestros})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # 3. LIMPIEZA DE SEGURIDAD (Esto se ejecuta SIEMPRE, haya error o no)
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print("Archivo temporal eliminado correctamente.")

if __name__ == '__main__':
    app.run(debug=True, port=5000)