// Author: Israel Zamora - GlitchBane
// Este componente crea la animación de fondo "Matrix" usando un <canvas> de HTML.

"use client";

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme(); // Hook para detectar el tema actual (no se usa pero es útil si quisiéramos cambiar colores por tema).

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setup = () => {
      // Ajusta el tamaño del canvas al tamaño de la ventana.
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Alfabeto de caracteres que caerán.
      const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
      const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nums = '0123456789';
      const alphabet = katakana + latin + nums;

      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize); // Calcula cuántas columnas de letras caben.

      // `rainDrops` es un array que guarda la posición 'y' de la gota de lluvia para cada columna.
      const rainDrops: number[] = [];
      for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
      }

      // La función de dibujado principal.
      const draw = () => {
        // Dibuja un rectángulo semi-transparente sobre todo el canvas.
        // Esto crea el efecto de estela/desvanecimiento de las letras.
        ctx.fillStyle = 'rgba(7, 7, 8, 0.1)'; // Estela más lenta.
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Obtiene el color primario del tema actual desde las variables CSS.
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
        ctx.fillStyle = `hsl(${primaryColor})`;
        ctx.font = `${fontSize}px monospace`;

        // Itera sobre cada columna para dibujar una letra.
        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

          // Si una gota llega al final de la pantalla, la reinicia al principio de forma aleatoria.
          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.985) { // Reinicio más lento.
            rainDrops[i] = 0;
          }
          rainDrops[i]++; // Mueve la gota hacia abajo.
        }
      };

      let lastTime = 0;
      const speed = 40; // Controla la velocidad de la animación (milisegundos por fotograma). Más alto = más lento.

      // Bucle de animación.
      const animate = (timestamp: number) => {
        if (timestamp - lastTime > speed) { // Solo dibuja si ha pasado suficiente tiempo.
          draw();
          lastTime = timestamp;
        }
        animationFrameId = window.requestAnimationFrame(animate);
      };

      animate(0);
    };

    setup(); // Llama a la función de configuración inicial.
    window.addEventListener('resize', setup); // Vuelve a configurar si la ventana cambia de tamaño.

    // Función de limpieza para detener la animación y los listeners cuando el componente se desmonta.
    return () => {
      window.removeEventListener('resize', setup);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0 bg-background" />;
}
