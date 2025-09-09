// Author: Israel Zamora - GlitchBane
// Este componente se encarga de formatear y mostrar la salida del comando `neofetch`.

export type NeofetchData = {
  usuario: string;
  host?: string;
  ip?: string;
  os?: string;
  kernel?: string;
  uptime?: string;
  shell?: string;
  resolution?: string;
  de_wm?: string;
  terminal_font?: string;
  memory?: string;
  asciiArt: string;
}

interface NeofetchOutputProps {
  data: NeofetchData;
}

export function NeofetchOutput({ data }: NeofetchOutputProps) {
  // Desestructura los datos para un acceso más fácil.
  const { 
    asciiArt, 
    usuario,
    host,
    ip,
    os,
    kernel,
    uptime,
    shell,
    resolution,
    de_wm,
    terminal_font,
    memory
  } = data;

  // Pequeño componente reutilizable para renderizar cada línea de información.
  const InfoLine = ({ label, value }: { label: string; value: string | string[] | undefined }) => (
    <div>
      <span className="text-primary font-bold">{label}</span>
      <span className="text-foreground">
        : {Array.isArray(value) ? value.join(', ') : value}
      </span>
    </div>
  );

  return (
    // Usa flexbox para mostrar el arte ASCII y la información lado a lado.
    // 'sm:items-center' alinea ambos elementos verticalmente al centro en pantallas de escritorio.
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
      {/* El arte ASCII se muestra dentro de una etiqueta <pre> para mantener el formato. */}
      <pre className="text-primary text-xs sm:text-sm leading-tight sm:leading-tight">{asciiArt}</pre>      
      {/* Contenedor para la información del sistema. */}
      <div className="flex flex-col justify-center gap-1 text-sm">
        <InfoLine label={usuario.split('@')[0]} value={usuario} />
        {host && <InfoLine label="Host" value={host} />}
        {ip && <InfoLine label="IP" value={ip} />}
        <div className="w-full h-px bg-border my-1"></div> {/* Separador visual */}
        {os && <InfoLine label="OS" value={os} />}
        {kernel && <InfoLine label="Kernel" value={kernel} />}
        {uptime && <InfoLine label="Uptime" value={uptime} />}
        {shell && <InfoLine label="Shell" value={shell} />}
        {resolution && <InfoLine label="Resolution" value={resolution} />}
        {de_wm && <InfoLine label="DE/WM" value={de_wm} />}
        {terminal_font && <InfoLine label="Terminal Font" value={terminal_font} />}
        {memory && <InfoLine label="Memory" value={memory} />}
      </div>
    </div>
  );
}
