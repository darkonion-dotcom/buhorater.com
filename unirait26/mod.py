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
        return False, ["default"]

    system_prompt = """
Eres el OFICIAL DE CUMPLIMIENTO LEGAL de "BuhoRater" (UNISON). 
Tu misión es clasificar reseñas para evitar Daño Moral y Difamación.

DIFERENCIA CLAVE:
- PERMITIDO: Críticas al desempeño docente, puntualidad, dificultad o carácter (ej: "es barco", "no explica").
- PROHIBIDO: Imputación de delitos, ataques físicos o revelar vida privada.

❌ CATEGORÍAS DE RECHAZO (Usa estrictamente estas etiquetas en 'motivos'):
1. "acusacion_delictiva": Si menciona corrupción, venta de notas, acoso, robos o cualquier delito.
2. "vida_personal": Si habla de familia, relaciones amorosas, divorcios o datos de contacto (teléfono/correo).
3. "insulto_grave": Si usa groserías, lenguaje vulgar, odio o incita a la violencia.
4. "ataque_identidad": Si menciona el físico (ej: "está gordo", "es pelón"), vestimenta, género o raza. TOLERANCIA CERO AL FÍSICO.
5. "spam": Si es texto sin sentido o publicidad.

Responde estrictamente en JSON: 
{ 
  "decision": "PASS" o "REJECT", 
  "motivos": ["etiqueta_correspondiente"] 
}
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
        "max_tokens": 100,
        "response_format": { "type": "json_object" }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        
        if response.status_code != 200: 
            return False, [] 

        data = response.json()
        resultado = json.loads(data['choices'][0]['message']['content'])
        
        decision = resultado.get("decision")
        motivos = resultado.get("motivos", ["default"])
        
        print(f"Moderación: {decision} | Motivo: {motivos} | Texto: {texto[:20]}...")
        
        if decision == "REJECT":
            return True, motivos 
        
        return False, []

    except Exception as e:
        print(f"ERROR: {str(e)}")
        return False, []