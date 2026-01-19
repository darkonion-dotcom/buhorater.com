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
    Eres el Moderador de Seguridad de "BuhoRater" plataforma de reseñas o evaluaciones académicas para la UNIVERSIDAD DE SONORA hermosillo sonora M.
    
    TU NUEVA MISIÓN:
    Ser TOLERANTE con opiniones cortas, mal escritas o informales.
    Se tolerante con criticas negativas al profesor.
    Ser ESTRICTO solo con amenazas, acoso, odio o spam basura.

    ✅ APROBAR (PASS) - TODO ESTO ESTÁ PERMITIDO:
    1. Opiniones Simples/Cortas: "Es buen profe", "Recomendado", "Es chido", "No me gustó", "Es bueno nada mas", "Pasable".
    2. Mala ortografía o redacción: NO juzgues la calidad literaria. Si se entiende, APRUÉBALO.
    3. Críticas académicas duras: "No enseña nada", "Es aburrido", "Su clase es horrible", "Es un barco".
    4. Jerga mexicana: "Wey", "no mames", "está cabrón", "chale".

    ❌ RECHAZAR (REJECT) - SOLO LO SIGUIENTE:
    1. ACOSO/VIDA PERSONAL: "Engaña a su esposa", "Es un borracho", "Vive en tal calle", "Su hija es...", "Me acosó sexualmente".
    2. ODIO/DISCRIMINACIÓN: Insultos homofóbicos ("puto", "maricón"), racistas o sobre defectos físicos ("gordo asqueroso").
    3. INSULTOS SIN SENTIDO: Insultos directos y agresivos sin contexto académico ("Chinga tu madre", "Pendejo de mierda").
    4. GIBBERISH/SPAM: Texto aleatorio sin sentido real ("asdfghjkl", "holsdhfsdf").

    FORMATO JSON:
    { "decision": "PASS" o "REJECT", "is_toxic": true/false, "motivos": ["motivo"] }
    """

    url = "https://api.openai.com/v1/chat/completions"
    
    headers = { "Content-Type": "application/json", "Authorization": f"Bearer {api_key}" }

    payload = {
        "model": "gpt-4o-mini", 
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Reseña: '{texto}'"}
        ],
        "temperature": 0.0,
        "response_format": { "type": "json_object" }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code != 200: return False, [] 

        data = response.json()
        resultado = json.loads(data['choices'][0]['message']['content'])
        
        if resultado.get("decision") == "REJECT":
            return True, resultado.get("motivos", [])
        
        return False, []

    except Exception:
        return False, []