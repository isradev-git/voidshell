
# VoidShell - Terminal Portfolio

VoidShell es un portafolio interactivo con estética de terminal de hacker, construido con Next.js y React. No es solo una web estática, sino una simulación de un sistema operativo en la que los usuarios pueden ejecutar comandos, explorar un sistema de archivos virtual, e interactuar con el contenido de una forma única y temática.

## Características Principales

- **Terminal Interactiva:** Simulación de una shell de Linux con autocompletado, historial de comandos y respuesta a entradas del usuario.
- **Sistema de Archivos Virtual:** Navegación por directorios (`cd`), listado de archivos (`ls`), y visualización de estructura en árbol (`tree`).
- **Comandos Simulados:** Incluye comandos clásicos como `neofetch`, `htop`, `scan`, `decrypt`, `wget`, `man` y más para una experiencia inmersiva.
- **Diseño Personalizable:** Múltiples temas de color inspirados en videojuegos (`switch`) y soporte multi-idioma (`lang`).
- **Fondo Animado:** Un efecto "Matrix" con letras cayendo, personalizable y optimizado para no distraer.
- **Responsive:** Adaptado para una buena experiencia tanto en escritorio como en dispositivos móviles.

---

## Estructura del Proyecto

Aquí tienes una guía de la estructura de archivos del proyecto para entender dónde se encuentra cada pieza de lógica.

### 1. `src/app/` - Rutas y Archivos Globales

El núcleo de la aplicación Next.js.

- **`layout.tsx`**: Es la plantilla principal de la aplicación. Carga las fuentes, aplica los estilos globales y define la estructura HTML base (`<html>`, `<body>`).
- **`page.tsx`**: Es la página de inicio. Renderiza los componentes principales como el fondo animado (`MatrixBackground`) y la propia terminal (`Terminal`).
- **`globals.css`**: Contiene los estilos globales y las variables CSS para los diferentes temas de color de la aplicación.

### 2. `src/components/` - Componentes de React

Aquí viven todos los componentes que construyen la interfaz.

- **`Terminal.tsx`**: **El corazón del proyecto.** Este componente masivo gestiona toda la lógica de la terminal:
    - El estado (líneas de salida, input del usuario, historial).
    - La definición y procesamiento de todos los comandos (`ls`, `cat`, `help`, etc.).
    - El sistema de archivos virtual.
    - La secuencia de arranque inicial.
    - Los manejadores de eventos del teclado.
- **`MatrixBackground.tsx`**: Renderiza el fondo animado con efecto "Matrix" usando un `<canvas>` de HTML.
- **`NeofetchOutput.tsx`**: El componente que formatea y muestra la información del sistema para el comando `neofetch`.
- **`ScanOutput.tsx`**: Muestra la animación de escaneo de puertos para el comando `scan`.
- **`DecryptOutput.tsx`**: Muestra la animación de descifrado para el comando `decrypt`.
- **`HtopOutput.tsx`**: Simula la interfaz de `htop` con procesos actualizándose en tiempo real.
- **`WgetOutput.tsx`**: Gestiona la animación de descarga para el comando `wget`.

- **`ui/`**: Esta carpeta contiene componentes de interfaz de usuario reutilizables (botones, diálogos, etc.), generados a partir de la librería `shadcn/ui`.

### 3. `src/hooks/` - Hooks de React Personalizados

Funcionalidades reutilizables y encapsuladas.

- **`use-mobile.tsx`**: Un hook simple para detectar si el usuario está en un dispositivo móvil. Es útil para deshabilitar funcionalidades que no funcionan bien en pantallas pequeñas (como `htop`).
- **`use-toast.ts`**: Hook para gestionar notificaciones emergentes (toasts) en la aplicación.

### 4. `src/locales/` - Internacionalización (i18n)

Aquí se guardan los textos para los diferentes idiomas.

- **`es.json`**: Contiene todas las cadenas de texto en español. Respuestas de comandos, mensajes de error, contenido de archivos, páginas de manual, etc.
- **`en.json`**: La versión en inglés de todos los textos. El comando `lang` permite cambiar entre estos archivos.

### 5. `src/lib/` - Utilidades

Funciones de ayuda.

- **`utils.ts`**: Contiene funciones de utilidad, como `cn`, que ayuda a combinar clases de Tailwind CSS de forma inteligente.

### 6. Archivos de Configuración (Raíz)

- **`tailwind.config.ts`**: Configuración de Tailwind CSS, donde se definen los colores, fuentes y otras personalizaciones de estilo.
- **`next.config.ts`**: Archivo de configuración de Next.js.
- **`components.json`**: Archivo de configuración para `shadcn/ui`.
- **`package.json`**: Define los scripts del proyecto y lista todas las dependencias (librerías de terceros) que se utilizan.
- **`tsconfig.json`**: Configuración del compilador de TypeScript.
