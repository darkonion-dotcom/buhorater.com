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
  const [filtroDepto, setFiltroDepto] = useState("todos");
  const [filtroOrden, setFiltroOrden] = useState("nombre");
  const [busqueda, setBusqueda] = useState("");

  const fileInputRef = useRef(null);
  const tamanoPagina = 48;
  const BUHO = 'https://ui-avatars.com/api/?name=Buho&background=eff6ff&color=004689&size=128';

  useEffect(() => {
    const visto = localStorage.getItem('visto_bloqueo_unison');
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
      const res = await fetch('/api/contador');
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
        setProfesores(prev => [...prev, ...lista]);
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

  return (
    <div className="main-wrapper">
      <nav className="main-navbar">
        <button className="hamburger-btn" onClick={() => setMenuActive(!menuActive)}>☰</button>
        <a href="/" className="nav-brand">
          <img src="https://res.cloudinary.com/dyqoqobg2/image/upload/v1767981066/Geometric_owl_logo_with_modern_tech_twist_wcvitd.png" alt="Logo Búho Rater" className="logo-img" />
        </a>
        <div className={`nav-items ${menuActive ? 'active' : ''}`} id="navMenu">
          <a href="/dictionary" className="nav-link">Directorio</a>
          <a href="/politicas" className="nav-link">Políticas</a>
          <a href="mailto:juanfernandoincognito@gmail.com" className="nav-link">Contacto</a>
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
                <img src={p.foto_url || BUHO} onError={(e) => e.target.src = BUHO} loading="lazy" alt={p.nombre} />
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
          <button id="btnCargarMas" onClick={() => cargarDatos(paginaActual, true)}>
            {loading ? "Cargando..." : "Cargar más resultados"}
          </button>
        )}
      </div>

      <footer className="main-footer">
        <div className="footer-links">
          <a href="/politicas" className="footer-link">Políticas</a>
          <a href="https://forms.gle/zycskRMqps41jPSM9" className="footer-link">Reportar Error</a>
          <a href="mailto:juanfernandoincognito@gmail.com" className="footer-link">Contacto</a>
        </div>
        <div className="copyright">
          © 2026 Búho Rater. No afiliado a la Universidad de Sonora.
        </div>
      </footer>

      {showCoffee && (
        <div id="coffee-popup" className="coffee-popup" style={{ display: 'flex' }}>
          <div className="coffee-content">
            <button onClick={() => { setShowCoffee(false); localStorage.setItem('visto_bloqueo_unison', 'true'); }} style={{ position: 'absolute', right: '15px', top: '15px', border: 'none', background: 'none', fontSize: '1.2rem', color: '#999', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚠️</div>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 500 }}>
              Dejaré la página sin posibilidad de nuevas reseñas algunos días para tomarme el tiempo de hacer cambios en la seguridad. Muchas gracias a todos.
            </p>
            <div style={{ marginTop: '15px' }}>
              <span onClick={() => { setShowCoffee(false); localStorage.setItem('visto_bloqueo_unison', 'true'); }} style={{ color: '#999', textDecoration: 'underline', fontSize: '0.8rem', cursor: 'pointer' }}>Entendido</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}