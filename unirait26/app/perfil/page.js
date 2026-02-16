"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PerfilContent() {
  const searchParams = useSearchParams();
  const maestroId = searchParams.get('id');

  const [profe, setProfe] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(""); 
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [visitorId, setVisitorId] = useState(null);

  const [calidad, setCalidad] = useState("5");
  const [dificultad, setDificultad] = useState("3");
  const [texto, setTexto] = useState("");
  const getAvatarDefault = (nombre) => {
    return `/logo.png`;
  };

  useEffect(() => {
    if (!maestroId) return;
    const cargarHuella = async () => {
      try {
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setVisitorId(result.visitorId);
      } catch (e) { setVisitorId("unknown"); }
    };
    cargarHuella();
    cargarDatos();
  }, [maestroId]);

  useEffect(() => {
    if (!loading && profe) {
      const timer = setTimeout(() => {
        const container = document.getElementById('captcha-box');
        if (window.turnstile && container && container.innerHTML === "") {
          try {
            window.turnstile.render('#captcha-box', {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, 
              theme: 'light',
            });
          } catch (e) {}
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, profe]);

  const cargarDatos = async () => {
    try {
      const [resProfe, resResenas] = await Promise.all([
        fetch(`/api/profesor?id=${maestroId}`),
        fetch(`/api/resenas?maestro_id=${maestroId}`)
      ]);
      const profeData = await resProfe.json();
      const resenasData = await resResenas.json();
      setProfe(profeData);
      setResenas(Array.isArray(resenasData) ? resenasData : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const enviarResena = async () => {
    if (texto.trim().length < 15) { alert("Reseña muy corta."); return; }
    let captchaResponse = null;
    try { captchaResponse = window.turnstile.getResponse(); } catch (e) {}
    if (!captchaResponse) { alert("Verifica el captcha."); return; }

    setSubmitting(true);
    setStatusMsg(" Analizando por BuhoAI..."); 

    try {
      const respuesta = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maestro_id: maestroId,
          texto,
          calidad: parseInt(calidad),
          dificultad: parseInt(dificultad),
          device_id: visitorId,
          captchaToken: captchaResponse
        })
      });

      if (respuesta.ok) {
        alert("¡Recibido! Tu reseña fue publicada correctamente.");
        setTexto("");
        cargarDatos();
      } else {
        const resJson = await respuesta.json();
        throw new Error(resJson.error || "Error al publicar.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
      setStatusMsg("");
      try { window.turnstile.reset(); } catch(e) {}
    }
  };

  if (loading) return <div className="container1"><p>Cargando perfil...</p></div>;
  if (!profe) return <div className="container1"><p>No encontrado.</p></div>;

  return (
    <div className="profile-page">
      <nav className="navbar1">
        <a href="/" className="btn-back1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Inicio
        </a>
      </nav>

      <div className="container1">
        <div className="profile-card1">
          <img 
            src={getAvatarDefault(profe.nombre)} 
            className="profile-img1" 
            alt="profe" 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = getAvatarDefault(profe.nombre);
            }}
          />
          <h1 className="h1-1">{profe.nombre}</h1>
          <div className="dept-text1">{profe.departamentos?.nombre || 'General'}</div>
          
          <div className="stats-trigger1" onClick={() => setShowBreakdown(!showBreakdown)} style={{ cursor: 'pointer' }}>
            <div className="stats-grid1">
              <div className="stat-item1"><span className="stat-val1">{profe.promedio_calidad?.toFixed(1) || '-'}</span><span className="stat-label1">Calidad</span></div>
              <div className="stat-item1"><span className="stat-val1">{profe.promedio_dificultad?.toFixed(1) || '-'}</span><span className="stat-label1">Dificultad</span></div>
              <div className="stat-item1"><span className="stat-val1">{profe.total_resenas || 0}</span><span className="stat-label1">Reseñas</span></div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--primary)', marginTop: '10px' }}>
              {showBreakdown ? '▲ Ocultar desglose' : '▼ Ver desglose'}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#999', margin: '5px 0 0 0' }}>
               Los promedios se actualizan cada 12 horas por seguridad.
            </p>
          </div>

          {showBreakdown && (
            <div className="breakdown-wrapper1 open" style={{ maxHeight: '500px', marginTop: '15px' }}>
              <div className="breakdown-content1">
                {[5, 4, 3, 2, 1].map(estrellas => {
                  const count = resenas.filter(r => Number(r.calidad) === estrellas).length;
                  const total = resenas.length;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const colorClass = estrellas >= 4 ? 'fill-green1' : estrellas === 3 ? 'fill-yellow1' : 'fill-red1';
                  return (
                    <div key={estrellas} className="bar-row1">
                      <span className="bar-label1">{estrellas} ★</span>
                      <div className="bar-track1"><div className={`bar-fill1 ${colorClass}`} style={{ width: `${percentage}%` }}></div></div>
                      <span className="bar-count1">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="form-card1">
          <div className="form-header1"> Escribir Reseña Anónima</div>
          <div className="input-row1">
            <div className="input-group1">
              <label className="label1">Calidad</label>
              <select value={calidad} onChange={(e) => setCalidad(e.target.value)}>
                <option value="5">5 - Excelente</option>
                <option value="4">4 - Buena</option>
                <option value="3">3 - Regular</option>
                <option value="2">2 - Mala</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div className="input-group1">
              <label className="label1">Dificultad</label>
              <select value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
                <option value="1">1 - Muy Fácil</option>
                <option value="2">2 - Fácil</option>
                <option value="3">3 - Normal</option>
                <option value="4">4 - Difícil</option>
                <option value="5">5 - Muy Difícil</option>
              </select>
            </div>
          </div>
          <div className="input-group1">
            <label className="label1">Comentario</label>
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Sé específico: habla sobre la carga de tareas, la claridad al explicar y el material de apoyo. Las reseñas útiles ayudan a la comunidad; los ataques personales no se publican." />
          </div>
          
          <div id="captcha-box"></div>
          
          <button onClick={enviarResena} className="btn-submit1" disabled={submitting || !visitorId}>
            {submitting ? "Procesando..." : "Publicar Reseña"}
          </button>
          
          {submitting && (
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>
              {statusMsg}
            </p>
          )}
        </div>

        <div id="lista-resenas">
          {resenas.map((r, i) => (
            <div key={i} className="review-card1">
              <div className="review-header1">
                <div className="tags1">
                  <span className={`tag1 ${r.calidad >= 4 ? 'good' : r.calidad <= 2 ? 'bad' : ''}`}>{r.calidad} Calidad</span>
                  <span className={`tag1 ${r.dificultad >= 4 ? 'bad' : r.dificultad <= 2 ? 'good' : ''}`}>{r.dificultad} Dificultad</span>
                </div>
                <span className="review-date1">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="review-text1" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {r.texto}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Perfil() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PerfilContent />
    </Suspense>
  );
}