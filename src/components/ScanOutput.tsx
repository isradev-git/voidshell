// Author: Israel Zamora - GlitchBane
// Este componente simula la animación de un escaneo de puertos de red.

"use client";

import React, { useState, useEffect } from 'react';
import type es from '../locales/es.json';

type Translations = typeof es;

interface ScanOutputProps {
    target: string; // El objetivo (IP o dominio) del escaneo.
    t: (key: keyof Translations, params?: any) => string; // Función de traducción.
}

// Lista de puertos y servicios ficticios para la simulación.
const ports = [
    { port: 21, service: 'FTP', status: 'closed' },
    { port: 22, service: 'SSH', status: 'open' },
    { port: 25, service: 'SMTP', status: 'closed' },
    { port: 80, service: 'HTTP', status: 'open' },
    { port: 110, service: 'POP3', status: 'closed' },
    { port: 143, service: 'IMAP', status: 'closed' },
    { port: 443, service: 'HTTPS', status: 'open' },
    { port: 3306, service: 'MySQL', status: 'open' },
    { port: 5432, service: 'PostgreSQL', status: 'closed' },
    { port: 8080, service: 'HTTP-Alt', status: 'open' },
];

export function ScanOutput({ target, t }: ScanOutputProps) {
    // Estado para las líneas de salida que se muestran.
    const [lines, setLines] = useState<React.ReactNode[]>([]);
    // Estado para controlar si el escaneo ha finalizado.
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Función para añadir una línea a la salida con un retardo.
        const addLine = (content: React.ReactNode, delay: number) => {
            return new Promise(resolve => {
                timeoutId = setTimeout(() => {
                    setLines(prev => [...prev, content]);
                    resolve(true);
                }, delay);
            });
        };

        // Función principal que ejecuta la simulación de escaneo.
        const runScan = async () => {
            await addLine(<span>{t('scan_start', { target })}</span>, 100);
            await addLine(<span>{t('scan_resolving')}</span>, 500);
            await addLine(<span>{t('scan_discovery')}</span>, 500);

            // Itera sobre la lista de puertos para simular el escaneo de cada uno.
            for (const p of ports) {
                const randomDelay = Math.random() * 200 + 50; // Retardo aleatorio.
                const status = Math.random() > 0.4 ? 'open' : 'closed'; // Estado aleatorio.
                
                let line;
                if (status === 'open') {
                    line = (
                        <div key={p.port}>
                            {/* Muestra en verde si está abierto. */}
                            <span className="text-green-500">[+]</span> {t('scan_port_open', { port: p.port, service: p.service })}
                        </div>
                    );
                } else {
                    line = (
                        <div key={p.port}>
                             {/* Muestra en rojo si está cerrado. */}
                            <span className="text-red-500">[-]</span> {t('scan_port_closed', { port: p.port })}
                        </div>
                    );
                }
                await addLine(line, randomDelay);
            }

            await addLine(<span>{t('scan_complete')}</span>, 500);
            setIsComplete(true);
        };

        runScan();

        // Limpia el timeout si el componente se desmonta.
        return () => clearTimeout(timeoutId);
    }, [target, t]);

    return (
        <div>
            {/* Renderiza todas las líneas de salida generadas. */}
            {lines.map((line, index) => (
                <div key={index}>{line}</div>
            ))}
        </div>
    );
}
