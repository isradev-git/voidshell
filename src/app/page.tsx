// Author: Israel Zamora - GlitchBane
// Este es el componente de la página principal de la aplicación.
// Es lo primero que ve el usuario cuando visita la URL raíz.

import { MatrixBackground } from "../components/MatrixBackground";
import { Terminal } from "../components/Terminal";

export default function Home() {
  return (
    // El div principal actúa como un contenedor para toda la página.
    // 'relative' es necesario para que los elementos hijos con 'absolute' se posicionen correctamente.
    // 'min-h-screen' asegura que ocupe al menos toda la altura de la pantalla.
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* MatrixBackground es el componente que renderiza el fondo animado. */}
      <MatrixBackground />
      {/* La etiqueta 'main' contiene el contenido principal de la página. */}
      {/* 'relative' y 'z-10' aseguran que la terminal se muestre por encima del fondo. */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Terminal es el componente interactivo principal. */}
        <Terminal />
      </main>
    </div>
  );
}
