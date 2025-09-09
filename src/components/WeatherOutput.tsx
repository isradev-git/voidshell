"use client";

import React, { useState, useEffect } from 'react';
import type es from '../locales/es.json';
import { Wifi, WifiOff, MapPin, Wind, Droplets, Sunrise, Sunset, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, SunMedium } from 'lucide-react';

type Translations = typeof es;

interface WeatherOutputProps {
    city: string;
    apiKey: string;
    t: (key: keyof Translations, params?: any) => string;
}

type WeatherData = {
    list: {
        dt: number;
        main: {
            temp: number;
            temp_min: number;
            temp_max: number;
            humidity: number;
        };
        weather: {
            id: number;
            main: string;
            description: string;
            icon: string;
        }[];
        wind: {
            speed: number;
        };
        dt_txt: string;
    }[];
    city: {
        name: string;
        country: string;
        sunrise: number;
        sunset: number;
    };
};

// Mapeo de iconos de OpenWeatherMap a componentes de Lucide.
const weatherIconMap: { [key: string]: React.ElementType } = {
    '01d': Sun, '01n': Sun,
    '02d': SunMedium, '02n': SunMedium,
    '03d': Cloud, '03n': Cloud,
    '04d': Cloud, '04n': Cloud,
    '09d': CloudRain, '09n': CloudRain,
    '10d': CloudRain, '10n': CloudRain,
    '11d': CloudLightning, '11n': CloudLightning,
    '13d': CloudSnow, '13n': CloudSnow,
    '50d': Wind, '50n': Wind,
};

const WeatherIcon = ({ iconCode }: { iconCode: string }) => {
    const IconComponent = weatherIconMap[iconCode] || Sun;
    return <IconComponent className="h-12 w-12 text-primary" />;
};


export function WeatherOutput({ city, apiKey, t }: WeatherOutputProps) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchWeather = async () => {
            if (!apiKey) {
                setError(t('weather_no_api_key'));
                setLoading(false);
                return;
            }
            try {
                // 1. Obtener coordenadas de la ciudad
                const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
                const geoData = await geoResponse.json();

                if (geoData.length === 0) {
                    setError(t('weather_city_not_found', { city }));
                    setLoading(false);
                    return;
                }
                const { lat, lon } = geoData[0];

                // 2. Obtener el pronóstico de 5 días
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${t('weather_lang_code')}`);
                const data = await weatherResponse.json();
                
                if (weatherResponse.status !== 200) {
                    throw new Error(data.message || 'Error fetching weather data');
                }

                setWeatherData(data);

            } catch (err: any) {
                setError(t('weather_fetch_error', { error: err.message }));
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [city, apiKey, t]);

    // Función para procesar y agrupar los datos por día
    const getDailyForecast = () => {
        if (!weatherData) return [];

        const dailyData: { [key: string]: any } = {};

        weatherData.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    temps: [],
                    weathers: {},
                    icons: {},
                    humidity: [],
                    wind: [],
                };
            }
            dailyData[date].temps.push(item.main.temp);
            dailyData[date].humidity.push(item.main.humidity);
            dailyData[date].wind.push(item.wind.speed);

            const weatherMain = item.weather[0].main;
            const weatherIcon = item.weather[0].icon;

            dailyData[date].weathers[weatherMain] = (dailyData[date].weathers[weatherMain] || 0) + 1;
            dailyData[date].icons[weatherIcon] = (dailyData[date].icons[weatherIcon] || 0) + 1;
        });

        return Object.entries(dailyData).map(([date, data]) => {
            const mostCommonWeather = Object.keys(data.weathers).reduce((a, b) => data.weathers[a] > data.weathers[b] ? a : b);
            const mostCommonIcon = Object.keys(data.icons).reduce((a, b) => data.icons[a] > data.icons[b] ? a : b);

            return {
                date,
                day: new Date(date).toLocaleDateString(t('weather_lang_code'), { weekday: 'long' }),
                temp_min: Math.min(...data.temps),
                temp_max: Math.max(...data.temps),
                weather: mostCommonWeather,
                icon: mostCommonIcon,
            };
        });
    };

    if (loading) {
        return <div><Wifi className="inline-block animate-pulse h-4 w-4 mr-2" />{t('weather_fetching', { city })}</div>;
    }

    if (error) {
        return <div className="text-red-500"><WifiOff className="inline-block h-4 w-4 mr-2" />{error}</div>;
    }

    if (!weatherData) {
        return null;
    }

    const today = weatherData.list[0];
    const dailyForecasts = getDailyForecast();

    return (
        <div className="text-sm">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {weatherData.city.name}, {weatherData.city.country}
            </h2>
            <p className="text-muted-foreground">{currentDate.toLocaleString(t('weather_lang_code'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <div className="flex flex-col sm:flex-row items-center gap-4 my-4 p-2 bg-accent/20 rounded-md">
                <div className="flex items-center gap-2">
                    <WeatherIcon iconCode={today.weather[0].icon} />
                    <p className="text-4xl font-bold">{Math.round(today.main.temp)}°C</p>
                </div>
                <div className="flex-1 space-y-1">
                    <p className="font-bold text-lg capitalize">{today.weather[0].description}</p>
                    <div className="flex gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1"><Wind className="h-4 w-4" />{today.wind.speed.toFixed(1)} m/s</span>
                        <span className="flex items-center gap-1"><Droplets className="h-4 w-4" />{today.main.humidity}%</span>
                    </div>
                </div>
                <div className="flex flex-col text-xs text-right">
                    <span className="flex items-center gap-1"><Sunrise className="h-4 w-4" />{new Date(weatherData.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><Sunset className="h-4 w-4" />{new Date(weatherData.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <h3 className="font-bold my-2">{t('weather_forecast_5days')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {dailyForecasts.map(day => (
                    <div key={day.date} className="p-2 bg-accent/30 rounded-md flex flex-col items-center justify-between text-center">
                        <p className="font-bold capitalize">{day.day}</p>
                        <WeatherIcon iconCode={day.icon} />
                        <p className="font-bold">{Math.round(day.temp_max)}° / {Math.round(day.temp_min)}°</p>
                        <p className="text-xs capitalize text-muted-foreground">{day.weather}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
