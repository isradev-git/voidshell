// Author: Israel Zamora - GlitchBane
// Este es un hook de React personalizado para detectar si el usuario está en un dispositivo móvil.

import * as React from "react"

// Define el punto de ruptura para considerar un dispositivo como móvil (768px).
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Estado para almacenar si el dispositivo es móvil. `undefined` al inicio para evitar errores de hidratación.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // `matchMedia` es una API del navegador para comprobar si un documento coincide con una media query.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Función que se ejecutará cada vez que cambie el estado de la media query.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Añade un listener para el evento 'change'.
    mql.addEventListener("change", onChange)
    
    // Establece el estado inicial al cargar el componente.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Función de limpieza: elimina el listener cuando el componente se desmonta para evitar fugas de memoria.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Devuelve `true` o `false`. El `!!` convierte el valor (que puede ser `undefined`) en un booleano.
  return !!isMobile
}
