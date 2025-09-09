// Author: Israel Zamora - GlitchBane
// Este componente simula la interfaz del monitor de sistema `htop`.

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type es from '../locales/es.json';

type Translations = typeof es;

interface HtopOutputProps {
    t: (key: keyof Translations, params?: any) => string; // Función de traducción.
    onExit: () => void; // Función que se llama cuando el usuario presiona 'q' para salir.
}

// Datos iniciales de los procesos falsos que se mostrarán.
const initialProcesses = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.5, time: '1:25.32', command: '/sbin/init' },
  { pid: 123, user: 'root', cpu: 0.0, mem: 0.2, time: '0:05.11', command: 'kthreadd' },
  { pid: 456, user: 'glitchbane', cpu: 2.5, mem: 1.5, time: '12:45.67', command: 'node /usr/bin/voidshell' },
  { pid: 789, user: 'www-data', cpu: 0.3, mem: 2.1, time: '2:10.98', command: 'nginx: worker process' },
  { pid: 101, user: 'root', cpu: 0.7, mem: 0.8, time: '0:55.23', command: 'sshd: /usr/sbin/sshd' },
  { pid: 212, user: 'glitchbane', cpu: 95.8, mem: 5.3, time: '0:01.55', command: 'gcc -O2 -pipe main.c -o a.out' },
  { pid: 323, user: 'postgres', cpu: 0.0, mem: 3.2, time: '4:30.12', command: 'postgres: logger' },
  { pid: 434, user: 'root', cpu: 1.2, mem: 0.9, time: '0:15.77', command: 'dockerd' },
  { pid: 545, user: 'glitchbane', cpu: 5.1, mem: 2.8, time: '1:02.43', command: 'zsh' },
  { pid: 656, user: 'root', cpu: 0.0, mem: 0.1, time: '25:11.34', command: 'systemd-journald' },
  { pid: 767, user: 'glitchbane', cpu: 0.9, mem: 1.2, time: '0:08.19', command: 'neovim' },
  { pid: 878, user: 'root', cpu: 0.3, mem: 0.4, time: '3:21.88', command: 'cron' },
  { pid: 989, user: 'root', cpu: 15.2, mem: 1.1, time: '0:02.12', command: 'kernel_panic --force' },
  { pid: 1100, user: 'glitchbane', cpu: 0.0, mem: 15.2, time: '0:00.50', command: 'cat /dev/urandom' },
];

export function HtopOutput({ t, onExit }: HtopOutputProps) {
  // Estado para la lista de procesos.
  const [processes, setProcesses] = useState(initialProcesses);
  // Estado para simular el tiempo de actividad (uptime).
  const [time, setTime] = useState(0);

  // Función para actualizar los datos de los procesos de forma aleatoria.
  const updateProcesses = useCallback(() => {
    setProcesses(prev =>
      prev.map(p => ({
        ...p,
        // Simula un uso de CPU alto para ciertos comandos.
        cpu: p.command.includes('gcc') || p.command.includes('kernel_panic')
            ? parseFloat((Math.random() * 20 + 80).toFixed(1))
            : parseFloat((Math.random() * 5).toFixed(1)),
        mem: parseFloat((p.mem + (Math.random() - 0.5) * 0.1).toFixed(1)),
      })).sort((a, b) => b.cpu - a.cpu) // Ordena por uso de CPU.
    );
    setTime(prev => prev + 2); // Incrementa el tiempo de actividad.
  }, []);

  // useEffect para actualizar los procesos cada 2 segundos.
  useEffect(() => {
    const interval = setInterval(updateProcesses, 2000);
    return () => clearInterval(interval); // Limpia el intervalo al desmontar.
  }, [updateProcesses]);

  // useEffect para manejar la pulsación de la tecla 'q' para salir.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown); // Limpia el listener.
  }, [onExit]);

  const totalTasks = processes.length;
  const runningTasks = processes.filter(p => p.cpu > 1).length;
  
  // Componente para formatear y mostrar el tiempo de actividad.
  const Uptime = () => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Componente para renderizar una barra de uso (no utilizado actualmente pero útil).
  const MemBar = ({ value, total }: { value: number, total: number }) => {
    const percentage = (value / total) * 100;
    const barWidth = Math.round(percentage / 2);
    const bar = '█'.repeat(barWidth);
    const empty = ' '.repeat(50 - barWidth);
    return `[${bar.padEnd(50, ' ')}] ${value.toFixed(1)}M/${total}M`;
  };

  return (
    // El `-m-4` y `p-2` es para que ocupe todo el espacio de la terminal sin márgenes internos.
    <div className="text-xs font-mono bg-black -m-4 p-2">
      {/* Cabecera con medidores de CPU y memoria. */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p>
            1<span className="text-gray-400"> [</span><span className="text-cyan-400 h-2 w-20 bg-cyan-400">████████</span><span className="text-gray-400">                  11.5%]</span>
            <span> </span>2<span className="text-gray-400"> [</span><span className="text-cyan-400">█</span><span className="text-gray-400">                           1.2%]</span>
          </p>
          <p>
            3<span className="text-gray-400"> [</span><span className="text-cyan-400">███</span><span className="text-gray-400">                       4.8%]</span>
            <span> </span>4<span className="text-gray-400"> [</span><span className="text-cyan-400">████</span><span className="text-gray-400">                      7.2%]</span>
          </p>
          <p><span className="text-gray-400">{t('htop_mem')}  [</span><span className="text-green-400">█████████████</span><span className="text-gray-400">             1.75G/7.81G]</span></p>
          <p><span className="text-gray-400">{t('htop_swp')}  [</span><span className="text-red-400"></span><span className="text-gray-400">                            0K/0K]</span></p>
        </div>
        {/* Información general: tareas, carga media, tiempo activo. */}
        <div className="text-right">
          <p>{t('htop_tasks')}: {totalTasks}, {runningTasks} {t('htop_running')}; {t('htop_threads')}: {totalTasks * 2 + runningTasks}</p>
          <p>{t('htop_load_avg')}: 0.85 0.95 1.05</p>
          <p>{t('htop_uptime')}: <Uptime /></p>
        </div>
      </div>
      
      {/* Encabezado de la tabla de procesos. */}
      <div className="bg-cyan-600 text-black font-bold mt-1">
        <span className="w-12 inline-block">{t('htop_pid')}</span>
        <span className="w-20 inline-block">{t('htop_user')}</span>
        <span className="w-12 inline-block text-right">{t('htop_cpu')}</span>
        <span className="w-12 inline-block text-right">{t('htop_mem_perc')}</span>
        <span className="w-20 inline-block text-right">{t('htop_time')}</span>
        <span>{t('htop_command')}</span>
      </div>

      {/* Lista de procesos. */}
      <div className="h-full overflow-y-auto">
        {processes.map(p => (
          // Colorea en rojo o verde las filas con alto uso de CPU.
          <div key={p.pid} className={`${p.cpu > 80 ? 'bg-red-800' : p.cpu > 5 ? 'bg-green-800' : ''}`}>
            <span className="text-white w-12 inline-block">{p.pid}</span>
            <span className="text-cyan-400 w-20 inline-block">{p.user}</span>
            <span className="text-white w-12 inline-block text-right">{p.cpu.toFixed(1)}</span>
            <span className="text-white w-12 inline-block text-right">{p.mem.toFixed(1)}</span>
            <span className="text-cyan-400 w-20 inline-block text-right">{p.time}</span>
            <span className="text-gray-300">{p.command}</span>
          </div>
        ))}
      </div>
      {/* Pie de página con la instrucción para salir. */}
       <div className="bg-cyan-600 text-black font-bold p-px text-center">
            {t('htop_press_q')}
        </div>
    </div>
  );
}
