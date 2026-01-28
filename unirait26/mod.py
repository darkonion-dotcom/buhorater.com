import os
import requests
import json

def obtener_pais_ip(request_headers):
    
    pais = (
        request_headers.get('Cf-Ipcountry') or 
        request_headers.get('cf-ipcountry') or 
        request_headers.get('X-Vercel-Ip-Country') or 
        request_headers.get('x-vercel-ip-country')
    )
    
    if pais:
        return pais.upper()
        
    return "MX"

def verificar_contenido_toxico(texto):
    api_key = os.environ.get("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ ERROR MODERACIÓN: No se encontró la variable OPENAI_API_KEY.")
        return False, []

    system_prompt = """
Eres el OFICIAL DE CUMPLIMIENTO LEGAL y Moderador de "BuhoRater" (UNISON).
TU MISIÓN CRÍTICA: Proteger la plataforma de demandas por "Daño Moral" o "Difamación".

DIFERENCIA CLAVE:
- OPINIÓN (Permitido): "Su clase es mala", "No sabe explicar", "Es muy estricto", "Es un barco".
- DIFAMACIÓN/DELITO (Prohibido): "Vende calificaciones", "Acosa alumnas", "Es corrupto", "Llega borracho".

✅ APROBAR (PASS) - CRÍTICA ACADÉMICA Y SUBJETIVA:
1. Desempeño Laboral: "Es aburrido", "No prepara clase", "Llega tarde", "Es injusto calificando".
2. Dificultad/Facilidad: "Es un barco", "Regala calificación", "Imposible pasar", "Muy perro".
3. Sentimientos del Alumno: "Me cae mal", "La odio", "Es insoportable" (Son opiniones subjetivas, no hechos).
4. Lenguaje Coloquial: "Wey", "Chale", "No mames", "Está cabrón", "Hueva".

❌ RECHAZAR (REJECT) - RIESGO LEGAL O PERSONAL (TOLERANCIA CERO):
1. IMPUTACIÓN DE DELITOS (Sin pruebas): "Pide dinero", "Vende plazas", "Acosador", "Ratero", "Corrupto", "Drogadicto".
2. VIDA PRIVADA: "Tiene un amante", "Se está divorciando", "Vive en...", "Su hijo es...".
3. ATAQUES FÍSICOS/DISCRIMINACIÓN: "Gordo asqueroso", "Vieja loca", "Maricón", "Indio", "Retrasado".
4. INCITACIÓN AL ODIO/VIOLENCIA: "Vamos a golpearlo", "Ojalá se muera", "Hay que funarlo en su casa".
5. SPAM/SIN SENTIDO: "asdfghjkl", "puto puto puto", publicidad externa.

Responde estrictamente en JSON: { "decision": "PASS" o "REJECT", "motivos": ["Explica brevemente por qué"] }
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
        "max_tokens": 150,
        "response_format": { "type": "json_object" }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        
        if response.status_code != 200: 
            print(f"ERROR AI ({response.status_code}): {response.text}")
            return False, [] 

        data = response.json()
        resultado = json.loads(data['choices'][0]['message']['content'])
        
        print(f"Moderación: {resultado.get('decision')} | Texto: {texto[:30]}...")
        
        if resultado.get("decision") == "REJECT":
            return True, resultado.get("motivos", [])
        
        return False, []

    except Exception as e:
        print(f"ERROR CRÍTICO EN MODERACIÓN: {str(e)}")
        return False, []