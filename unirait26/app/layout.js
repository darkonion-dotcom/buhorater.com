import Script from 'next/script';
import './global.css';

export const metadata = {
  title: 'BuhoRater - Califica a tus maestros de la UNISON',
  description: 'La plataforma oficial para ver reseñas, promedios y opiniones reales de profesores de la Universidad de Sonora. ¡Arma tu horario sin sorpresas!',
  keywords: ['UNISON', 'BuhoRater', 'Profesores Unison', 'Maestros', 'Hermosillo', 'Calificaciones', 'Reseñas', 'Sonora'],
  openGraph: {
    title: 'BuhoRater - La verdad sobre tus clases',
    description: 'Opiniones 100% anónimas de estudiantes.',
    url: 'https://www.buhorater.com',
    siteName: 'BuhoRater',
    images: [
      {
        url: 'https://res.cloudinary.com/dyqoqobg2/image/upload/v1767981066/Geometric_owl_logo_with_modern_tech_twist_wcvitd.png',
        width: 800,
        height: 600,
        alt: 'Logo BuhoRater',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦉</text></svg>" />
      </head>
      {/* EL PASE VIP DE HIDRATACIÓN ESTÁ AQUÍ ABAJO */}
      <body suppressHydrationWarning>
        
        {/* INICIO DEL SCRIPT GUARDIÁN DEL MODO OSCURO */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var tema = localStorage.getItem('tema_buhorater');
                  if (tema === 'dark') {
                    document.body.classList.add('dark-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* FIN DEL SCRIPT GUARDIÁN */}

        {children}

        <Script 
          src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}