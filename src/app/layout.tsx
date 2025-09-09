// Author: Israel Zamora - GlitchBane
// Este es el archivo de diseño principal (layout) de la aplicación.
// Next.js utiliza este archivo para definir la estructura HTML base que se comparte en todas las páginas.

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '../components/ui/toaster';

// Metadata define la información SEO de la página, como el título y la descripción.
export const metadata: Metadata = {
  title: 'VoidShell',
  description: 'Terminal portfolio for Israel Zamora - GlitchBane.',
};

// RootLayout es el componente principal que envuelve a toda la aplicación.
export default function RootLayout({
  children, // 'children' representa cualquier página que se esté renderizando.
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Se define el HTML base, el idioma y el tema por defecto ('dark' y 'theme-default').
    <html lang="es" className="dark theme-default">
      <head>
        {/* Aquí se cargan las fuentes personalizadas desde Google Fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      {/* El body aplica la fuente principal y el antialiasing para un texto más suave. */}
      <body className="font-code antialiased">
        {/* 'children' se renderiza aquí. En nuestro caso, será el componente de la página principal. */}
        {children}
        {/* El Toaster es un componente para mostrar notificaciones emergentes. */}
        <Toaster />
      </body>
    </html>
  );
}
