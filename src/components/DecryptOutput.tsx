// Author: Israel Zamora - GlitchBane
// Este componente simula la animación de "descifrado" de un archivo.

"use client";

import React, { useState, useEffect } from 'react';
import type es from '../locales/es.json';

type Translations = typeof es;

interface DecryptOutputProps {
    content: string; // El contenido real del archivo una vez descifrado.
    t: (key: keyof Translations, params?: any) => string; // Función para traducciones.
}

// Caracteres que se usarán en la animación de texto aleatorio.
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export function DecryptOutput({ t, content }: DecryptOutputProps) {
    // Estado para las líneas de log que se muestran durante la simulación.
    const [lines, setLines] = useState<React.ReactNode[]>([]);
    // Estado para saber si la animación ha terminado.
    const [isComplete, setIsComplete] = useState(false);
    // Estado para el texto que se está "descifrando" actualmente.
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Función para añadir una línea al log con un retardo.
        const addLine = (content: React.ReactNode, delay: number) => {
            return new Promise(resolve => {
                timeoutId = setTimeout(() => {
                    setLines(prev => [...prev, content]);
                    resolve(true);
                }, delay);
            });
        };

        // Función principal que ejecuta la secuencia de animación.
        const runDecryption = async () => {
            // Muestra una serie de mensajes de estado simulados.
            await addLine(<span>{t('decrypt_starting', { filename: '' })}</span>, 100);
            await addLine(<span>{t('decrypt_analyzing')}</span>, 500);
            await addLine(<span>{t('decrypt_bruteforce')}</span>, 500);
            await addLine(<span className="text-green-500">{t('decrypt_success')}</span>, 1000);
            await addLine(<span>{t('decrypt_rendering')}</span>, 500);

            // Inicia la animación de revelación de texto.
            let currentText = '';
            let intervalId = setInterval(() => {
                // Va revelando el texto letra por letra.
                currentText = content.substring(0, currentText.length + 1) + 
                              // Rellena el resto con caracteres aleatorios.
                              Array(content.length - currentText.length -1).fill(0).map(() => charset[Math.floor(Math.random() * charset.length)]).join('');
                setDisplayText(currentText);

                // Si se ha revelado todo el texto, detiene la animación.
                if (currentText.length >= content.length) {
                    clearInterval(intervalId);
                    setDisplayText(content); // Muestra el contenido final limpio.
                    setIsComplete(true);
                }
            }, 50);
        };

        runDecryption();

        // Función de limpieza para evitar fugas de memoria si el componente se desmonta.
        return () => {
            clearTimeout(timeoutId);
        };
    }, [t, content]);

    return (
        <div>
            {/* Renderiza las líneas de log. */}
            {lines.map((line, index) => (
                <div key={index}>{line}</div>
            ))}
            {/* Renderiza el texto que se está descifrando dentro de un cuadro. */}
            {displayText && <pre className="whitespace-pre-wrap mt-2 p-2 bg-accent/30 border border-accent rounded-md">{displayText}</pre>}
        </div>
    );
}
