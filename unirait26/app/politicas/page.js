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
          <a href="mailto:hola" className="nav-link2">Contacto</a>
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
          BuhoRater es una iniciativa 100% independiente y <strong>sin afiliación oficial con la Universidad de Sonora (UNISON)</strong>. Esta plataforma no fue creada para atacar, sino para <strong>transparentar la excelencia académica</strong> y dar el reconocimiento que merecen aquellos docentes que honran su labor, un reconocimiento que muchas veces el sistema institucional olvida. No somos el enemigo, sino el reflejo de una necesidad estudiantil ante problemas que no han sido atendidos. Si usted es docente y tiene alguna inquietud, sepa que estamos abiertos al diálogo para resolver cualquier situación de manera justa; nuestro fin no es el conflicto, sino la mejora educativa.
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