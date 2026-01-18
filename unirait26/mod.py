import os
import requests

def obtener_pais_ip(ip_usuario):
    
    if ip_usuario in ["127.0.0.1", "localhost"] or ip_usuario.startswith("192.168"):
        return "MX" 

    try:
        url = f"http://ip-api.com/json/{ip_usuario}"
        response = requests.get(url, timeout=3)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                return data.get("countryCode") 
        return None
    except Exception as e:
        print(f"❌ Error al geolocalizar IP: {e}")
        return None

def verificar_contenido_toxico(texto):
    """
    Envía el texto al motor de moderación de OpenAI.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("⚠️ Advertencia: OPENAI_API_KEY no encontrada.")
        return False, ["Error de configuración"]

    url = "https://api.openai.com/v1/moderations"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        response = requests.post(url, headers=headers, json={"input": texto}, timeout=5)
        response.raise_for_status()
        
        result = response.json()["results"][0]

        if result["flagged"]:
            razones = [cat for cat, val in result["categories"].items() if val]
            return True, razones
        
        return False, []
    except Exception as e:
        print(f"❌ Error en OpenAI Moderation: {e}")
        return False, [str(e)]