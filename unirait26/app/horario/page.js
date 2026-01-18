"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ContenidoHorario3() {
  const searchParams = useSearchParams();
  const [profesores, setProfesores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    const profesParam = searchParams.get('profes');
    if (!profesParam) { setCargando(false); return; }
    try {
      const res = await fetch('/api/maestros/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres: profesParam.split(',') })
      });
      const data = await res.json();
      setProfesores(data);
    } catch (err) { console.error(err); } finally { setCargando(false); }
  };

  useEffect(() => {
    cargarDatos();
    const handlePageshow = (e) => { if (e.persisted) window.location.reload(); };
    window.addEventListener('pageshow', handlePageshow);
    return () => window.removeEventListener('pageshow', handlePageshow);
  }, [searchParams]);

  const copiarLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const obtenerClaseRating = (v) => {
    const n = parseFloat(v);
    if (!v || isNaN(n)) return 'rating-none3';
    return n >= 4 ? 'rating-high3' : n >= 3 ? 'rating-mid3' : 'rating-low3';
  };

  return (
    <div className="flex-container3">
      <nav className="main-navbar3">
        {/* USAMOS <a> PARA FORZAR RECARGA DEL INDEX */}
        <a href="/" className="nav-brand3">
          <img src="https://res.cloudinary.com/dyqoqobg2/image/upload/v1767981066/Geometric_owl_logo_with_modern_tech_twist_wcvitd.png" className="logo-img3" alt="Búho Rater" />
        </a>
        <div className="nav-items3">
          <a href="/" className="nav-link3" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '600', fontSize: '0.95rem' }}>INICIO</a>
          <a href="/dictionary" className="nav-link3" style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '600', fontSize: '0.95rem' }}>DIRECTORIO</a>
        </div>
      </nav>

      <main className="content-wrapper3">
        <header className="header-content3">
          <h1 className="h1-3">Horario Analizado</h1>
        </header>

        <div className="share-container3">
          <input readOnly value={typeof window !== 'undefined' ? window.location.href : ''} className="share-input3" />
          <button onClick={copiarLink} className="btn-share3" style={{ backgroundColor: copiado ? '#4ade80' : '#004689' }}>
            {copiado ? 'Copiado' : 'Copiar Link'}
          </button>
        </div>

        <section id="resultados3">
          {cargando ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>Analizando profesores...</div>
          ) : profesores.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#6b7280' }}>No se encontraron datos en el enlace.</div>
          ) : (
            profesores.map((p) => (
              <div key={p.id} className="card3">
                <img src={p.foto_url && p.foto_url !== 'null' ? p.foto_url : 'https://ui-avatars.com/api/?name=Buho&background=eff6ff&color=004689'} alt={p.nombre} />
                <div className="card-info3">
                  {p.es_colaborador && <div className="badge-collab3">Colaborador</div>}
                  <h3>{p.nombre}</h3>
                  <p className="depto3">{p.departamentos?.nombre || 'General'}</p>
                  <div className={`rating-pill3 ${obtenerClaseRating(p.promedio_calidad)}`}>
                    {p.promedio_calidad ? parseFloat(p.promedio_calidad).toFixed(1) : '-'}
                  </div>
                </div>
                <a href={`/perfil?id=${p.id}`} className="full-link3"></a>
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="main-footer3">
        <div className="footer-links3">
          <a href="/politicas" className="footer-link3">Políticas</a>
          <a href="mailto:contacto@buhorater.com" className="footer-link3">Contacto</a>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '10px' }}>© 2026 Búho Rater. No afiliado a la Universidad de Sonora.</p>
      </footer>
    </div>
  );
}

export default function HorarioPage() {
  return (
    <Suspense fallback={null}>
      <ContenidoHorario3 />
    </Suspense>
  );
}