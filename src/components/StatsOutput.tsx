// Author: Israel Zamora - GlitchBane
// Este componente renderiza la salida del comando `stats`, mostrando estadísticas divertidas.

"use client";

import React from 'react';
import type es from '../locales/es.json';
import { Coffee, Code, Bug, Moon, FolderX, BrainCircuit, Terminal as TerminalIcon } from 'lucide-react';

type Translations = typeof es;

interface StatsOutputProps {
    t: (key: keyof Translations, params?: any) => string;
}

const statsData = [
    { key: 'stats_coffee', icon: Coffee, valueKey: 'stats_coffee_value' },
    { key: 'stats_code_lines', icon: Code, valueKey: 'stats_code_lines_value' },
    { key: 'stats_bugs_fixed', icon: Bug, valueKey: 'stats_bugs_fixed_value' },
    { key: 'stats_sleep_lost', icon: Moon, valueKey: 'stats_sleep_lost_value' },
    { key: 'stats_side_projects', icon: FolderX, valueKey: 'stats_side_projects_value' },
    { key: 'stats_sanity_level', icon: BrainCircuit, valueKey: 'stats_sanity_level_value' },
    { key: 'stats_terminals_broken', icon: TerminalIcon, valueKey: 'stats_terminals_broken_value' },
];

export function StatsOutput({ t }: StatsOutputProps) {
    return (
        <div className="text-sm">
            <h2 className="text-lg font-bold text-primary mb-2">{t('stats_title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {statsData.map(stat => (
                    <div key={stat.key} className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4 text-primary" />
                        <span className="flex-1">{t(stat.key as keyof Translations)}:</span>
                        <span className="font-mono text-foreground">{t(stat.valueKey as keyof Translations)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
