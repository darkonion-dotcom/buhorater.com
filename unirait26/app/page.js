"use client";
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [profesores, setProfesores] = useState([]);
  const [paginaActual, setPaginaActual] = useState(0);
  const [contador, setContador] = useState("...");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showCoffee, setShowCoffee] = useState(false);
  const [showInsta, setShowInsta] = useState(true);
  const [filtroDepto, setFiltroDepto] = useState("todos");
  const [filtroOrden, setFiltroOrden] = useState("nombre");
  const [busqueda, setBusqueda] = useState("");

  const fileInputRef = useRef(null);
  const tamanoPagina = 48;

  useEffect(() => {
    const visto = localStorage.getItem('visto_aviso_legal_const_v1');
    if (!visto) setShowCoffee(true);
    
    actualizarContador();
    resetearYBuscar();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda.length >= 3 || busqueda.length === 0) {
        resetearYBuscar();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, filtroDepto, filtroOrden]);

  const actualizarContador = async () => {
    try {
      const res = await fetch(`/api/contador?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.count) setContador(data.count.toLocaleString() + " reseñas");
    } catch (e) {}
  };

  const resetearYBuscar = async () => {
    setPaginaActual(0);
    await cargarDatos(0, false);
  };

  const cargarDatos = async (pagina, append) => {
    setLoading(true);
    try {
      let url = "";
      if (busqueda.length >= 3) {
        url = `/api/maestros?search=${encodeURIComponent(busqueda)}`;
      } else {
        const desde = pagina * tamanoPagina;
        url = `/api/maestros?depto=${filtroDepto}&orden=${filtroOrden}&desde=${desde}&hasta=${desde + tamanoPagina - 1}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      const lista = result.data || result;

      if (append) {
        setProfesores(prev => {
          const idsExistentes = new Set(prev.map(p => p.id));
          const nuevosUnicos = lista.filter(p => !idsExistentes.has(p.id));
          return [...prev, ...nuevosUnicos];
        });
      } else {
        setProfesores(lista);
      }

      setHasMore(result.count > (pagina * tamanoPagina + tamanoPagina) && busqueda.length < 3);
      if (busqueda.length < 3) setPaginaActual(pagina + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Por favor, sube solo archivos PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch("/analizar-horario", { method: 'POST', body: formData });
      const data = await response.json();
      let nombres = [];
      if (data.encontrados) nombres = nombres.concat(data.encontrados.map(p => p.nombre));
      if (data.no_encontrados) nombres = nombres.concat(data.no_encontrados);
      if (nombres.length > 0) {
        const params = encodeURIComponent(nombres.map(n => n.trim()).join(','));
        window.location.href = "/horario?profes=" + params;
      }
    } catch (error) {
      alert("Error de conexión.");
    }
  };

  const aceptarTerminos = () => {
    setShowCoffee(false);
    localStorage.setItem('visto_aviso_legal_const_v1', 'true');
  };

  return (
    <div className="main-wrapper">
      <nav className="main-navbar">
        <button className="hamburger-btn" onClick={() => setMenuActive(!menuActive)}>☰</button>
        <a href="/" className="nav-brand">
          <img 
            src="/logo.png" 
            alt="Logo Búho Rater" 
            className="logo-img" 
            style={{ height: '40px', width: 'auto', display: 'block' }} 
          />
        </a>
        <div className={`nav-items ${menuActive ? 'active' : ''}`} id="navMenu">
          <a href="/dictionary" className="nav-link">Directorio</a>
          <a href="/politicas" className="nav-link">Políticas</a>
          <a href="mailto:hola@buhorater.com" className="nav-link">Contacto</a>
          <a href="https://forms.gle/zycskRMqps41jPSM9" className="nav-link">Reportar</a>
          <a href="https://www.buymeacoffee.com/starcatunison" target="_blank" className="nav-link">Donar</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div className="punto-rojo"></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{contador}</span>
          </div>
        </div>
      </nav>

      <div className="content-wrapper">
        <header>
          <div className="drop-zone" onClick={() => fileInputRef.current.click()}>
            <span className="drop-icon">📄</span>
            <span className="drop-text">Analizar Horario (PDF)</span>
            <span className="drop-subtext">Toca para subir tu horario</span>
            <input type="file" ref={fileInputRef} onChange={handleFile} accept=".pdf" style={{ display: 'none' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <button 
              onClick={() => setShowVideo(!showVideo)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', margin: '0 auto', gap: '6px' }}
            >
              <span>ℹ️</span> ¿Cómo descargar mi horario?
            </button>
            {showVideo && (
              <div id="videoContainer" style={{ display: 'block', marginTop: '10px', background: '#000', borderRadius: '8px', overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', height: 0, width: '100%' }}>
                <iframe src="https://www.youtube.com/embed/eb3FIgHIsMY?autoplay=1" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} allowFullScreen></iframe>
              </div>
            )}
          </div>
        </header>

        <div className="search-container">
          <input 
            type="text" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar profesor..." 
          />
        </div>

        <div className="filtros-container">
          <select value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)}>
            <option value="todos">🏛️ Todos los Departamentos</option>
            <optgroup label="📐 Exactas y Naturales">
              <option value="Matemáticas">Matemáticas</option>
              <option value="Física">Física</option>
              <option value="Geología">Geología</option>
              <option value="Investigaciones Físicas">Investigaciones Físicas</option>
              <option value="Arquitectura y Diseño">Arquitectura y Diseño</option>
            </optgroup>
            <optgroup label="🩺 Salud y Biológicas">
              <option value="Agricultura">Agricultura y Ganadería</option>
              <option value="Ciencias Químico Biológicas">Químico Biológicas</option>
              <option value="Enfermería">Enfermería</option>
              <option value="Medicina">Medicina y Salud</option>
              <option value="Investigaciones Científicas">Dictus (Investigación)</option>
            </optgroup>
            <optgroup label="⚙️ Ingeniería">
              <option value="Ingeniería Civil">Ingeniería Civil</option>
              <option value="Ingeniería Industrial">Ingeniería Industrial</option>
              <option value="Ingeniería Química">Ingeniería Química</option>
              <option value="Investigación en Polímeros">Polímeros</option>
            </optgroup>
            <optgroup label="💰 Económicas y Administrativas">
              <option value="Contabilidad">Contabilidad</option>
              <option value="Economía">Economía</option>
              <option value="314200">Administración</option>
            </optgroup>
            <optgroup label="⚖️ Ciencias Sociales">
              <option value="Derecho">Derecho</option>
              <option value="Psicología">Psicología y Comunicación</option>
              <option value="Sociología">Sociología y Admón Pública</option>
              <option value="Trabajo Social">Trabajo Social</option>
              <option value="Bellas Artes">Bellas Artes</option>
              <option value="Letras y Lingüística">Letras y Lingüística</option>
              <option value="Lenguas Extranjeras">Lenguas Extranjeras</option>
            </optgroup>
          </select>
          <select value={filtroOrden} onChange={(e) => setFiltroOrden(e.target.value)}>
            <option value="nombre">Orden: A-Z</option>
            <option value="mejor">Mejor Calificados</option>
            <option value="peor">Peor Calificados</option>
          </select>
        </div>

        <div id="resultados">
          {profesores.map((p) => {
            const prom = p.promedio_calidad ? parseFloat(p.promedio_calidad).toFixed(1) : '-';
            const promedioNum = parseFloat(p.promedio_calidad || 0);
            const claseColor = !p.promedio_calidad ? 'rating-none' : promedioNum >= 4 ? 'rating-high' : promedioNum >= 3 ? 'rating-mid' : 'rating-low';

            return (
              <div key={p.id} className="card">
                <img 
                  src="/logo2.png" 
                  alt={p.nombre} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="card-info">
                  {p.es_colaborador && <div className="badge-collab">Colaborador</div>}
                  <h3>{p.nombre}</h3>
                  <p className="depto">{p.departamentos?.nombre || 'General'}</p>
                  <div className="meta-row">
                    <div className={`rating-pill ${claseColor}`}>★ {prom}</div>
                  </div>
                </div>
                <a href={`/perfil?id=${p.id}`} className="full-link"></a>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <button id="btnCargarMas" onClick={() => cargarDatos(paginaActual, true)} style={{ display: 'block', width: '100%', padding: '15px', background: '#f5f5f5', border: 'none', color: '#666', fontSize: '1rem', cursor: 'pointer', borderRadius: '12px', marginTop: '20px', fontWeight: 'bold' }}>
            {loading ? "Cargando..." : "Cargar más resultados"}
          </button>
        )}
      </div>

      <footer className="main-footer">
        <div className="footer-links">
          <a href="/politicas" className="footer-link">Políticas</a>
          <a href="https://forms.gle/zycskRMqps41jPSM9" className="footer-link">Reportar Error</a>
          <a href="mailto:hola@buhorater.com" className="footer-link">Contacto</a>
        </div>
        <div className="copyright">
          © 2026 Búho Rater. No afiliado a la Universidad de Sonora.
        </div>
      </footer>

      {showCoffee && (
        <div id="coffee-popup" className="coffee-popup" style={{ display: 'flex', zIndex: 99999 }}>
          <div className="coffee-content" style={{ maxWidth: '450px', width: '90%', padding: '25px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>⚖️</div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 'bold', textAlign: 'center' }}>
              Aviso Legal y Transparencia
            </h3>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#333', lineHeight: '1.6', textAlign: 'justify' }}>
              Esta plataforma ejerce su derecho a la libertad de expresión amparada en los <strong>Artículos 6º y 7º de la Constitución Política de los Estados Unidos Mexicanos</strong>.
            </p>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#333', lineHeight: '1.6', textAlign: 'justify' }}>
              Las reseñas reflejan opiniones de estudiantes sobre el desempeño de <strong>servidores públicos</strong> en el ejercicio de sus funciones, lo cual constituye información de interés público. 
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#333', lineHeight: '1.6', textAlign: 'justify' }}>
              BuhoRater actúa como intermediario neutral y no se hace responsable de las opiniones individuales de los usuarios.
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
              *Los promedios se actualizan cada 12 horas por seguridad del servidor.
            </p>
            <div style={{ marginTop: '15px' }}>
              <button 
                onClick={aceptarTerminos} 
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '14px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              >
                Entendido y Acepto
              </button>
            </div>
          </div>
        </div>
      )}

      {showInsta && (
        <div className="insta-toast">
          <div className="insta-content">
            <span className="insta-icon">📸</span>
            <div className="insta-text">
              <p>Síguenos en Instagram para actualizaciones y noticias.</p>
            </div>
          </div>
          <div className="insta-actions">
            <a href="https://instagram.com/buhoratercom" target="_blank" className="insta-btn">Seguir</a>
            <button onClick={() => setShowInsta(false)} className="insta-close">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}