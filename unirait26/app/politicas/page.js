"use client";
import { useState } from 'react';

export default function Politicas() {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <div className="body2">
      <nav className="main-navbar2">
        <button className="hamburger-btn2" onClick={toggleMenu}>☰</button>
        <a href="/" className="nav-brand2">
          <img 
            src="https://res.cloudinary.com/dyqoqobg2/image/upload/v1767981066/Geometric_owl_logo_with_modern_tech_twist_wcvitd.png" 
            alt="Logo Búho Rater" 
            className="logo-img2" 
          />
        </a>
        <div className={`nav-items2 ${menuActive ? 'active' : ''}`} id="navMenu2">
          <a href="/dictionary" className="nav-link2">Directorio</a>
          <a href="/politicas" className="nav-link2" style={{ color: '#004689' }}>Políticas</a>
          <a href="mailto:juanfernandoincognito@gmail.com" className="nav-link2">Contacto</a>
          <a href="https://forms.gle/zycskRMqps41jPSM9" className="nav-link2">Reportar</a>
          <a href="https://www.buymeacoffee.com/starcatunison" target="_blank" className="nav-link2">Donar</a>
        </div>
      </nav>

      <div className="doc-container2">
        <div className="header-section2">
          <h1 className="h1-2">Políticas de Búho Rater</h1>
        </div>
        
        <p className="p-2">Bienvenido a <strong>Búho Rater</strong>. Al utilizar nuestro sitio web, aceptas las siguientes políticas y términos de uso.</p>

        <h2 className="h2-2">1. Naturaleza de la Plataforma</h2>
        <p className="p-2">
          Búho Rater es una herramienta independiente y <strong>no tiene afiliación oficial con la Universidad de Sonora (UNISON).</strong> La pagina no la creé con la intencion de afectar a los maestros,al contrario,existen maestros a los que no se les reconoce por su nivel academico,como fue el caso de el profesor que estuvo en huelga de hambre. Les pido a los maestros que tal vez lean esto,que no sean peones de un sistema que esclaviza al honrado,al que merece,y favorece al indigno al que ensucia una labor honrada como es la de ser maestro. Esta pagina no es mas que el resultado de una serie de problemas que no sean tratado. No perpetuen mas el no afrontar la situacion. Si tienen algun problema comuniquense directamente conmigo,yo sabre como solucionarlo.
        </p>

        <h2 className="h2-2">2. Privacidad y Datos</h2>
        <ul className="ul-2">
          <li className="li-2">No solicitamos nombres ni correos para publicar reseñas.</li>
          <li className="li-2">Los datos técnicos se almacenan de forma cifrada.</li>
          <li className="li-2">Los datos no se comparten con terceros ni son comprometidos.</li>
        </ul>

        <h2 className="h2-2">3. Normas de Contenido</h2>
        <ul className="ul-2">
          <li className="li-2">Queda estrictamente prohibido el lenguaje vulgar o ataques personales ajenos al desempeño docente.</li>
          <li className="li-2">Queda estrictamente prohibido publicar datos personales o información sensible de los maestros.</li>
          <li className="li-2">En caso de violar estas políticas, se tomarán medidas apropiadas.</li>
        </ul>

        <div className="footer-meta2">
          © 2026 Búho Rater. Protegiendo la libertad de expresión estudiantil.
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <a href="/" className="btn-back2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver al Inicio
          </a>
        </div>
      </div>

      <footer className="main-footer2"></footer>

      <a href="https://www.buymeacoffee.com/starcatunison" target="_blank" className="bmc-floating-btn2" rel="noreferrer">
        <span style={{ fontSize: '1.2rem' }}>☕</span>
        <span className="bmc-text2">Invítame un café</span>
      </a>
    </div>
  );
}