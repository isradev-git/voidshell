// Author: Israel Zamora - GlitchBane
// Este componente simula la animación de descarga del comando `wget`.

"use client";

import React, { useState, useEffect } from 'react';
import type es from '@/locales/es.json';

type Translations = typeof es;

interface WgetOutputProps {
    targetUrl: string; // La URL de la que se "descarga".
    filename: string; // El nombre del archivo que se "guardará".
    t: (key: keyof Translations, params?: any) => string; // Función de traducción.
    onComplete: () => void; // Callback que se ejecuta cuando la descarga finaliza.
}

export function WgetOutput({ t, targetUrl, filename, onComplete }: WgetOutputProps) {
    // Estado para el progreso de la descarga (0-100).
    const [progress, setProgress] = useState(0);
    // Estado para la fase actual de la simulación.
    const [phase, setPhase] = useState('connecting'); // Fases: connecting, downloading, complete

    useEffect(() => {
        // Simula la fase de conexión.
        if (phase === 'connecting') {
            const timeoutId = setTimeout(() => {
                setPhase('downloading');
            }, 1000); // Espera 1 segundo antes de empezar a descargar.
            return () => clearTimeout(timeoutId);
        }

        // Simula la fase de descarga.
        if (phase === 'downloading') {
            const intervalId = setInterval(() => {
                setProgress(prev => {
                    // Si el progreso llega al 100%, se detiene y se marca como completo.
                    if (prev >= 100) {
                        clearInterval(intervalId);
                        setPhase('complete');
                        onComplete(); // Llama al callback para añadir el archivo al sistema de archivos.
                        return 100;
                    }
                    // Incrementa el progreso de forma aleatoria.
                    return prev + Math.floor(Math.random() * 10) + 1;
                });
            }, 200); // Actualiza el progreso cada 200ms.
            return () => clearInterval(intervalId);
        }
    }, [phase, onComplete]);

    // Lógica para renderizar la barra de progreso.
    const clampedProgress = Math.min(progress, 100);
    const barWidth = 25;
    const filledWidth = Math.round((clampedProgress / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);

    return (
        <div className="font-mono text-sm">
            {phase === 'connecting' && (
                <div>{t('wget_connecting', { url: targetUrl })}</div>
            )}

            {phase === 'downloading' && (
                 <div>
                    <p>{t('wget_downloading', { url: targetUrl })}</p>
                    <div className="flex items-center gap-2">
                        <span>[{progressBar}]</span>
                        <span>{clampedProgress}%</span>
                    </div>
                </div>
            )}
            
            {phase === 'complete' && (
                <div>
                    <p>{t('wget_downloading', { url: targetUrl })}</p>
                     <div className="flex items-center gap-2">
                        <span>[{progressBar}]</span>
                        <span>{clampedProgress}%</span>
                    </div>
                    <p className="text-green-500">{t('wget_complete', { filename })}</p>
                </div>
            )}

        </div>
    );
}
