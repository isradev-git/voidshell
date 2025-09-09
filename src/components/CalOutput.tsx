// Author: Israel Zamora - GlitchBane
// Este componente renderiza la salida del comando `cal`, mostrando un calendario.

"use client";

import React from 'react';
import type es from '../locales/es.json';

type Translations = typeof es;

interface CalOutputProps {
    t: (key: keyof Translations, params?: any) => string;
}

export function CalOutput({ t }: CalOutputProps) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-11

    // Obtiene los nombres de los meses y días desde los archivos de traducción.
    const monthNames = [
        t('cal_month_jan'), t('cal_month_feb'), t('cal_month_mar'),
        t('cal_month_apr'), t('cal_month_may'), t('cal_month_jun'),
        t('cal_month_jul'), t('cal_month_aug'), t('cal_month_sep'),
        t('cal_month_oct'), t('cal_month_nov'), t('cal_month_dec')
    ];
    const weekDays = t('cal_week_days').split(' '); // "Do Lu Ma Mi Ju Vi Sá" o "Su Mo Tu We Th Fr Sa"

    const header = `${monthNames[month]} ${year}`;
    
    // Calcula el número de días del mes y el día en que empieza.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // getDay() devuelve 0 para Domingo, 1 para Lunes...
    // Lo ajustamos para que el Lunes sea el primer día si el idioma es 'es'.
    const firstDayOfMonthRaw = new Date(year, month, 1).getDay();
    const firstDayOfMonth = t('weather_lang_code') === 'es-ES' ? (firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1) : firstDayOfMonthRaw;


    const calendarRows = [];
    let currentDays = [];
    
    // Rellena los espacios vacíos al principio del mes.
    for (let i = 0; i < firstDayOfMonth; i++) {
        currentDays.push(<span key={`empty-${i}`} className="w-8 text-center"></span>);
    }

    // Rellena los días del mes.
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate();
        // Resalta el día actual.
        const dayClass = isToday 
            ? "w-8 text-center bg-primary text-primary-foreground rounded-sm"
            : "w-8 text-center";
        
        currentDays.push(<span key={day} className={dayClass}>{String(day).padStart(2, ' ')}</span>);

        // Si la semana está completa (7 días), la añade a las filas y empieza una nueva.
        if (currentDays.length === 7) {
            calendarRows.push(<div key={`week-${day}`} className="flex justify-start gap-1">{currentDays}</div>);
            currentDays = [];
        }
    }

    // Añade la última semana si no estaba completa.
    if (currentDays.length > 0) {
        calendarRows.push(<div key="last-week" className="flex justify-start gap-1">{currentDays}</div>);
    }

    return (
        <div className="font-mono text-sm">
            <div className="text-center mb-1">{header}</div>
            <div className="flex justify-start gap-1 text-primary">
                {weekDays.map(day => <span key={day} className="w-8 text-center">{day}</span>)}
            </div>
            <div className="flex flex-col gap-1">
                {calendarRows}
            </div>
        </div>
    );
}
