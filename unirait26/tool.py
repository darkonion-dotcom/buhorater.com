import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from mod import obtener_pais_ip, verificar_contenido_toxico

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "https://www.buhorater.com", 
    "http://localhost:3000", 
    "https://buhoratercomcom.vercel.app", 
    "https://unirait26.vercel.app"
]}})

INTERNAL_API_KEY = os.environ.get("INTERNAL_API_KEY")

@app.route('/')
def health_check():
    return jsonify({"status": "Obrero activo ", "moderation": "gpt-4o-mini"})

@app.route('/verificar-resena', methods=['POST'])
def verificar_resena():
    key = request.headers.get('x-api-key')
    if key != INTERNAL_API_KEY:
        return jsonify({"decision": "REJECT", "error": "Unauthorized"}), 401
    pais = obtener_pais_ip(request.headers)
    
    print(f"Acceso desde: {pais}") #
    if pais not in ["MX", "US"]:
       print(f"Bloqueado acceso desde: {pais}")
       return jsonify({
           "decision": "REJECT", 
           "motivos": [f"Ubicación no permitida ({pais}). Solo MX/US."]
       }), 403

    # 3. Obtener texto
    data = request.json
    texto = data.get("texto", "")
    
    if len(texto) < 5:
         return jsonify({"decision": "REJECT", "motivos": ["muy_corto"]}), 400
    es_toxico, motivos = verificar_contenido_toxico(texto)

    if es_toxico:
        return jsonify({
            "decision": "REJECT",
            "is_toxic": True,
            "motivos": motivos
        }), 200
    return jsonify({
        "decision": "PASS",
        "is_toxic": False,
        "motivos": []
    }), 200

@app.route('/analizar-horario', methods=['POST'])
def procesar_horario():
    return jsonify({"status": "error", "message": "Endpoint no configurado en este snippet"}), 501

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)