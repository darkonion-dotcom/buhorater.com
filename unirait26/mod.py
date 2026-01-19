import os
import requests
import json

def obtener_pais_ip(ip_usuario):
    if ip_usuario in ["127.0.0.1", "localhost"] or ip_usuario.startswith("192.168"):
        return "MX"
    try:
        url = f"http://ip-api.com/json/{ip_usuario}"
        response = requests.get(url, timeout=3)
        if response.status_code == 200 and response.json().get("status") == "success":
            return response.json().get("countryCode")
        return None
    except:
        return None

def verificar_contenido_toxico(texto):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return False, []

    system_prompt = """
    Eres el Moderador de Seguridad de "BuhoRater", una plataforma para estudiantes universitarios en México.
    
    TU OBJETIVO:
    Aprobar reseñas que ayuden a identificar ESTILOS DE ENSEÑANZA y MÉTODOS DE EVALUACIÓN.
    Rechazar contenido que exponga la VIDA PERSONAL del maestro o genere RIESGOS LEGALES.

    REGLAS DE ORO (MÉXICO):

    ✅ APROBAR (PASS) - CRÍTICA ACADÉMICA Y ESTILO:
    - Comentarios sobre dificultad: "Es un barco", "esta muy dificil", "regala calificación", "es imposible pasar".
    - Comentarios sobre didáctica: "No sabe explicar", "su clase es aburrida", "es un genio", "aprendes mucho", "se la pasa leyendo diapositivas".
    - Quejas de actitud en el aula: "Es prepotente", "es muy estricto", "es buena onda", "le cae mal a todos".
    - Jerga estudiantil mexicana leve: "No mames, está difícil", "está cabrón", "wey".

    ❌ RECHAZAR (REJECT) - RIESGO LEGAL Y VIDA PERSONAL:
    1. ACUSACIONES GRAVES (Inmediato REJECT): Mencionar acoso, tocamientos, miradas lascivas, corrupción, pedir dinero/sobornos, venta de calificaciones. (Esto es material para denuncia legal, no para una reseña pública).
    2. VIDA PRIVADA: Comentarios sobre su esposa/o, familia, divorcios, dónde vive, qué hace los fines de semana, vicios personales (alcoholismo/drogas fuera del aula).
    3. ATAQUES A LA IDENTIDAD: Insultos sobre su físico (gordo, feo), orientación sexual (maricón, puto, gay), o discapacidad.
    4. INSULTOS SIN CONTENIDO: "Es un pendejo", "Chinga tu madre". (Si dice "Es un pendejo explicando", se puede tolerar, pero se estricto, el insulto puro se rechaza).

    FORMATO DE RESPUESTA JSON:
    {
      "decision": "PASS" o "REJECT",
      "is_toxic": true,
      "motivos": ["motivo_corto_1", "motivo_corto_2"]
    }
    Ejemplos de motivos: "acusacion_delictiva", "vida_personal", "insulto_grave", "spam".
    """

    url = "https://api.openai.com/v1/chat/completions"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }

    payload = {
        "model": "gpt-4o-mini", 
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Reseña a moderar: '{texto}'"}
        ],
        "temperature": 0.0,
        "response_format": { "type": "json_object" }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        
        if response.status_code != 200:
            return False, [] 

        data = response.json()
        contenido_ia = data['choices'][0]['message']['content']
        
        resultado = json.loads(contenido_ia)
        
        decision = resultado.get("decision", "PASS")
        motivos = resultado.get("motivos", [])
        
        if decision == "REJECT":
            return True, motivos
        
        return False, []

    except Exception:
        return False, []