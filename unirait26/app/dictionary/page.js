"use client";
import { useState, useEffect } from 'react';

export default function Directorio() {
  const [maestros, setMaestros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDirectorio() {
      try {
        const respuesta = await fetch('/api/directorio');
        const datos = await respuesta.json();
        if (respuesta.ok) {
          setMaestros(datos);
        }
      } catch (err) {
        console.error("Error cargando directorio:", err);
      } finally {
        setCargando(false);
      }
    }
    cargarDirectorio();
  }, []);

  return (
    <div className="directorio-wrapper">
      {/* CSS Inyectado de forma segura para evitar errores de compilación */}
      <style dangerouslySetInnerHTML={{ __html: `
        .directorio-wrapper { font-family: sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background-color: #f3f4f6; min-height: 100vh; }
        .h1-dir { color: #333; text-align: center; }
        .link-profe { text-decoration: none; color: #004689; font-size: 1rem; margin-bottom: 8px; display: block; transition: 0.2s; }
        .link-profe:hover { text-decoration: underline; color: #F1C40F; }
        .stats { font-size: 0.9rem; color: #4b5563; text-align: center; margin-bottom: 20px; font-weight: 600; }
        .grid-directorio { background: white; padding: 30px; border-radius: 12px; border: 1px solid #789be0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .main-navbar { width: 100%; height: 80px; background-color: white; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; margin-bottom: 30px; box-sizing: border-box; border-radius: 8px; }
        .logo-img { height: 50px; width: auto; }
        .btn-volver { color: #004689; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
      `}} />

      <nav className="main-navbar">
        <a href="/">
          <img src="https://res.cloudinary.com/dyqoqobg2/image/upload/v1767981066/Geometric_owl_logo_with_modern_tech_twist_wcvitd.png" className="logo-img" alt="Logo Búho Rater" />
        </a>
        <div style={{ fontWeight: 700, color: '#004689' }}>DIRECTORIO OFICIAL</div>
      </nav>

      <h1 className="h1-dir">Directorio</h1>
      
      <p style={{ textAlign: 'center', marginBottom: '10px' }}>
        <a href="/" className="btn-volver">← Volver al buscador</a>
      </p>

      <div className="stats">
        {cargando ? 'Contando...' : `${maestros.length} profesores`}
      </div>

      <div className="grid-directorio">
        {cargando ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Cargando lista oficial...</p>
        ) : maestros.length > 0 ? (
          maestros.map((m) => (
            <a key={m.id} href={`/perfil?id=${m.id}`} className="link-profe">
              {m.nombre}
            </a>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666' }}>No hay profesores disponibles.</p>
        )}
      </div>

      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem', paddingBottom: '40px' }}>
        © 2026 Búho Rater - Mapa del sitio para rastreadores de búsqueda.
      </footer>
    </div>
  );
}