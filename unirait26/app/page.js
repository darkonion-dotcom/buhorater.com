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
  
  // ESTADO: Control del Modo Oscuro
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fileInputRef = useRef(null);
  const tamanoPagina = 48;

  useEffect(() => {
    const visto = localStorage.getItem('visto_aviso_legal_const_v1');
    if (!visto) setShowCoffee(true);
    
    // MEMORIA: Revisar si el usuario ya tenía el modo oscuro activo antes
    const temaGuardado = localStorage.getItem('tema_buhorater');
    if (temaGuardado === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-theme');
    }
    
    actualizarContador();
    resetearYBuscar();
  }, []);

  // FUNCIÓN TOGGLE: El interruptor de la luz
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      if (newMode) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('tema_buhorater', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('tema_buhorater', 'light');
      }
      return newMode;
    });
  };

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
        url = `/api/maestros?depto=${encodeURIComponent(filtroDepto)}&orden=${filtroOrden}&desde=${desde}&hasta=${desde + tamanoPagina - 1}`;
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

        {/* BOTÓN TOGGLE: Ubicado al centro */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button 
            onClick={toggleTheme} 
            style={{
              background: isDarkMode ? '#222' : '#fff',
              color: isDarkMode ? '#fff' : '#333',
              border: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
              cursor: 'pointer',
              fontSize: '0.95rem',
              padding: '10px 20px',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            {isDarkMode ? '☀️ Cambiar a Modo Claro' : '🌙 Cambiar a Modo Oscuro'}
          </button>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar profesor..." 
          />
        </div>

        {/* SISTEMA DE FILTROS: Values Exactos basados en tu lista */}
        <div className="filtros-container">
          <select value={filtroDepto} onChange={(e) => setFiltroDepto(e.target.value)}>
            <option value="todos">🏛️ Todos los Departamentos</option>
            <option value="Sindicato (STAUS)">Sindicato (STAUS)</option>

            <optgroup label="📐 Ciencias Exactas y Naturales">
              <option value="Dirección de División Ciencias Exactas y Naturales">División Ciencias Exactas y Naturales</option>
              <option value="Departamento de Física">Física</option>
              <option value="Departamento de Geología">Geología</option>
              <option value="Departamento de Matemáticas">Matemáticas</option>
              <option value="Departamento de Investigación en Física">Investigación en Física</option>
              <option value="Departamento de Física, Matemáticas e Ingeniería">Física, Matemáticas e Ingeniería</option>
            </optgroup>

            <optgroup label="🩺 Ciencias Biológicas y de la Salud">
              <option value="Dirección de División de Ciencias Biológicas y de la Salud">División Ciencias Biológicas y de la Salud</option>
              <option value="Departamento de Agricultura y Ganadería">Agricultura y Ganadería</option>
              <option value="Departamento de Ciencias Químico-Biológicas">Ciencias Químico-Biológicas</option>
              <option value="Departamento de Enfermería">Enfermería</option>
              <option value="Departamento de Investigaciones Científicas y Tecnológicas">Investigaciones Científicas (DICTUS)</option>
              <option value="Departamento de Investigación y Posgrado en Alimentos">Investigación y Posgrado en Alimentos</option>
              <option value="Departamento de Medicina y Ciencias de la Salud">Medicina y Ciencias de la Salud</option>
              <option value="Departamento de Ciencias del Deporte y la Actividad Física">Ciencias del Deporte</option>
              <option value="Departamento de Ciencias de la Salud">Ciencias de la Salud</option>
              <option value="Campo Experimental Agropecuario">Campo Experimental Agropecuario</option>
              <option value="Departamento de Ciencias Químico-Biológicas y Agropecuarias">Ciencias Químico-Biológicas y Agropecuarias</option>
            </optgroup>

            <optgroup label="⚙️ Ingeniería">
              <option value="Dirección de División de Ingeniería">División de Ingeniería</option>
              <option value="Departamento de Ingeniería Civil y Minas">Ingeniería Civil y Minas</option>
              <option value="Departamento de Ingeniería Industrial">Ingeniería Industrial</option>
              <option value="Departamento de Ingeniería Química y Metalurgia">Ingeniería Química y Metalurgia</option>
              <option value="Departamento de Investigación en Polímeros y Materiales">Investigación en Polímeros</option>
            </optgroup>

            <optgroup label="💰 Económicas y Administrativas">
              <option value="Dirección de División Ciencias Económicas y Administrativas">División Cs. Económicas y Administrativas</option>
              <option value="Departamento de Administración">Administración</option>
              <option value="Departamento de Contabilidad">Contabilidad</option>
              <option value="Departamento de Economía">Economía</option>
              <option value="Departamento de Ciencias Económico-Administrativas">Ciencias Económico-Administrativas</option>
              <option value="Departamento de Ciencias Administrativas y Agropecuarias">Ciencias Administrativas y Agropecuarias</option>
            </optgroup>

            <optgroup label="⚖️ Ciencias Sociales">
              <option value="Dirección de División de Ciencias Sociales">División de Ciencias Sociales</option>
              <option value="Departamento de Historia y Antropología">Historia y Antropología</option>
              <option value="Departamento de Derecho">Derecho</option>
              <option value="Departamento de Psicología y Ciencias de la Comunicación">Psicología y Comunicación</option>
              <option value="Departamento de Sociología y Administración Pública">Sociología y Administración Pública</option>
              <option value="Departamento de Trabajo Social">Trabajo Social</option>
              <option value="Departamento de Ciencias Sociales">Ciencias Sociales</option>
            </optgroup>

            <optgroup label="🎭 Humanidades y Bellas Artes">
              <option value="Dirección de División de Humanidades y Bellas Artes">División de Humanidades y Bellas Artes</option>
              <option value="Departamento de Bellas Artes">Bellas Artes</option>
              <option value="Departamento de Lenguas Extranjeras">Lenguas Extranjeras</option>
              <option value="Departamento de Letras y Lingüística">Letras y Lingüística</option>
              <option value="Departamento de Arquitectura y Diseño">Arquitectura y Diseño</option>
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