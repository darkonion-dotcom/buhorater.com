import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from mod import obtener_pais_ip, verificar_contenido_toxico

app = Flask(__name__)
# Ajusta los origenes si es necesario
CORS(app, resources={r"/*": {"origins": ["https://www.buhorater.com", "http://localhost:3000"]}})

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")

@app.route('/')
def health_check():
    return jsonify({"status": "Obrero activo 🦉", "moderation": "gpt-4o-mini"})

@app.route('/verificar-resena', methods=['POST'])
def verificar_resena():
    # 1. Seguridad API Key
    key = request.headers.get('x-api-key')
    if key != INTERNAL_API_KEY:
        return jsonify({"decision": "REJECT", "error": "Unauthorized"}), 401

    # 2. Verificar IP (Opcional)
    ip = request.headers.get('X-Forwarded-For', request.remote_addr).split(',')[0]
    pais = obtener_pais_ip(ip)
    
    # Si quieres bloquear países que no sean MX, descomenta esto:
    # if pais and pais != "MX":
    #    return jsonify({"decision": "REJECT", "motivos": ["ubicacion_no_permitida"]}), 403

    # 3. Obtener texto
    data = request.json
    texto = data.get("texto", "")
    
    if len(texto) < 5:
         return jsonify({"decision": "REJECT", "motivos": ["muy_corto"]}), 400

    # 4. LLAMAR A LA IA (mod.py)
    es_toxico, motivos = verificar_contenido_toxico(texto)

    if es_toxico:
        # Formato NUEVO que espera tu Frontend
        return jsonify({
            "decision": "REJECT",
            "is_toxic": True,
            "motivos": motivos
        }), 200

    # Si todo bien
    return jsonify({
        "decision": "PASS",
        "is_toxic": False,
        "motivos": []
    }), 200

# Endpoint para PDF (si lo usas)
@app.route('/analizar-horario', methods=['POST'])
def procesar_horario():
    # ... Tu lógica de PDF existente ...
    return jsonify({"status": "error", "message": "Endpoint no configurado en este snippet"}), 501

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)