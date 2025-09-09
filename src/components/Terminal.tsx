// Author: Israel Zamora - GlitchBane
// Este es el componente principal y el corazón de la aplicación.
// Gestiona toda la lógica de la terminal interactiva.
"use client";

// Importaciones de React y componentes.
import { useToast } from "../hooks/use-toast";
import { FileText, Folder, Image as ImageIcon } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { NeofetchOutput, type NeofetchData } from "./NeofetchOutput";
import { ScanOutput } from "./ScanOutput";
import { DecryptOutput } from "./DecryptOutput";
import { HtopOutput } from "./HtopOutput";
import { WgetOutput } from "./WgetOutput";
import { WeatherOutput } from "./WeatherOutput";
import { CalOutput } from "./CalOutput";
import { StatsOutput } from "./StatsOutput";
import { useIsMobile } from "../hooks/use-mobile";

// Importación de los archivos de idioma.
import es from '../locales/es.json';
import en from '../locales/en.json';

// Definición de tipos para las traducciones.
type Translations = typeof es;
const translations: { [key: string]: Translations } = { es, en };

// Interfaz para definir la estructura de cada línea en la terminal.
interface TerminalLine {
  id: number;
  content: React.ReactNode;
  type?: 'progress' | 'interactive'; // 'interactive' se usa para comandos como htop.
}

// Datos de los proyectos, utilizados por el comando `project`.
const projectData: Record<string, { name: string; description: string; githubUrl: string; demoUrl: string; tech: string[] }> = {
  "quimera": {
    name: "Proyecto Quimera",
    description: "Motor de análisis predictivo impulsado por IA para la detección de anomalías en redes. [CLASIFICADO]",
    githubUrl: "https://github.com/isradev-git/quimera",
    demoUrl: "#",
    tech: ["Python", "TensorFlow", "FastAPI", "Next.js"]
  },
  "anochecer": {
    name: "Operación Anochecer",
    description: "Protocolo de comunicación descentralizado e irrastreable basado en una red P2P. [TOP SECRET]",
    githubUrl: "https://github.com/isradev-git/anochecer",
    demoUrl: "#",
    tech: ["Go", "Libp2p", "React"]
  },
  "daemons": {
    name: "SystemDaemons",
    description: "Colección de agentes autónomos para la monitorización y automatización de infraestructuras. [CONFIDENCIAL]",
    githubUrl: "https://github.com/isradev-git/daemons",
    demoUrl: "#",
    tech: ["Rust", "Docker", "gRPC"]
  }
};

// Mapeo de nombres de temas a las clases CSS correspondientes.
const themes: Record<string, string> = {
  '1': 'theme-cyberpunk',
  'cyberpunk': 'theme-cyberpunk',
  'cyberpunk 2077': 'theme-cyberpunk',
  '2': 'theme-witcher',
  'witcher': 'theme-witcher',
  'the witcher 3': 'theme-witcher',
  '3': 'theme-hollow',
  'hollow': 'theme-hollow',
  'hollow knight': 'theme-hollow',
  '4': 'theme-reddead',
  'reddead': 'theme-reddead',
  'red dead redemption': 'theme-reddead',
  'default': 'theme-default'
};

// Definición de la estructura de un nodo en el sistema de archivos virtual.
type FileSystemNode = {
  type: 'file' | 'dir';
  content?: keyof Translations | string; // Contenido de un archivo (puede ser una clave de traducción).
  children?: { [key: string]: FileSystemNode }; // Hijos de un directorio.
};

// Estructura del sistema de archivos virtual.
const fileSystem: FileSystemNode = {
  type: 'dir',
  children: {
    'home': {
      type: 'dir',
      children: {
        'glitchbane': {
          type: 'dir',
          children: {
            'Documents': {
              type: 'dir',
              children: {
                'about.md': { type: 'file', content: 'about_md' },
                'skills.md': { type: 'file', content: 'skills_md' },
                'experience.md': { type: 'file', content: 'experience_md' },
                'education.md': { type: 'file', content: 'education_md' },
              }
            },
            'Projects': {
              type: 'dir',
              children: {
                'README.md': { type: 'file', content: 'project-list_md' },
                'quimera.proj': { type: 'file', content: 'project quimera' },
                'anochecer.proj': { type: 'file', content: 'project anochecer' },
                'daemons.proj': { type: 'file', content: 'project daemons' }
              }
            },
            'Pictures': {
                type: 'dir',
                children: {
                    'avatar.png': { type: 'file', content: 'cat_image' },
                    'logo.svg': { type: 'file', content: 'cat_image' }
                }
            },
            'vault': {
                type: 'dir',
                children: {
                    'credentials.txt.enc': { type: 'file', content: 'credentials_enc' },
                    'protocol.dat.enc': { type: 'file', content: 'protocol_enc' }
                }
            },
            'README.md': { type: 'file', content: 'README_md' },
            'contact.md': { type: 'file', content: 'contact_md' },
            'social.md': { type: 'file', content: 'social_md' },
            'resume.md': { type: 'file', content: 'resume_md' },
          }
        }
      }
    }
  }
};

// Datos para simular conexiones remotas con el comando `connect`.
const remoteSystems: Record<string, { welcome: string, files: string[] }> = {
    'quimera': {
        welcome: "connect_welcome_quimera",
        files: ["analyzer.log", "config.json", "main.py", "output.dat"]
    },
    'anochecer': {
        welcome: "connect_welcome_anochecer",
        files: ["node_list.txt", "p2p_daemon", "comm_protocol.spec"]
    }
};

// Objeto que almacenará todas las funciones de los comandos.
const commands: Record<string, (args: string[], t: (key: keyof Translations, params?: any) => string, terminal: Terminal) => React.ReactNode | void> = {};

// Implementación del comando `cowsay`.
const cowsay = (message: string, t: (key: keyof Translations) => string) => {
  const bubble = [];
  const maxLength = 40;
  let lines = [];

  if (!message) {
    message = t('cowsay_default');
  }

  // Ajuste de palabras para que quepan en la burbuja de diálogo.
  let currentLine = '';
  for (const word of message.split(' ')) {
    if (currentLine.length + word.length + 1 > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }
  lines.push(currentLine);
  
  const topBorder = ' ' + '_'.repeat(maxLength + 2);
  bubble.push(topBorder);

  if (lines.length === 1) {
    bubble.push(`< ${lines[0].padEnd(maxLength)} >`);
  } else {
    bubble.push(`/ ${lines[0].padEnd(maxLength)} \\`);
    for (let i = 1; i < lines.length - 1; i++) {
      bubble.push(`| ${lines[i].padEnd(maxLength)} |`);
    }
    bubble.push(`\\ ${lines[lines.length - 1].padEnd(maxLength)} /`);
  }
  
  const bottomBorder = ' ' + '-'.repeat(maxLength + 2);
  bubble.push(bottomBorder);

  const cow = `
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
  `;
  
  return <pre>{bubble.join('\n')}{cow}</pre>;
};

// Interfaz que define las funciones que los comandos pueden usar para interactuar con la terminal.
export interface Terminal {
  setPath: (path: string) => void;
  getPath: () => string;
  addLine: (content: React.ReactNode, type?: TerminalLine['type']) => void;
  t: (key: keyof Translations, params?: any) => string;
  setRemoteHost: (host: string | null) => void;
  finishInteractiveCommand: () => void;
  isMobile: boolean;
  addFileToCurrentDir: (filename: string) => void;
}

// Componente principal de la Terminal.
export function Terminal() {
  // --- ESTADOS ---
  const [lines, setLines] = useState<TerminalLine[]>([]); // Almacena todas las líneas de salida.
  const [input, setInput] = useState(""); // El texto que el usuario está escribiendo.
  const [suggestion, setSuggestion] = useState(""); // Sugerencia de autocompletado.
  const [isProcessing, setIsProcessing] = useState(true); // `true` para deshabilitar el input mientras se ejecuta un comando.
  const [isInteractive, setIsInteractive] = useState(false); // `true` si un comando como `htop` está activo.
  const [commandHistory, setCommandHistory] = useState<string[]>([]); // Historial de comandos.
  const [historyIndex, setHistoryIndex] = useState(-1); // Índice en el historial de comandos.
  const [ip, setIp] = useState("..."); // IP del usuario.
  const [lang, setLang] = useState('es'); // Idioma actual.
  const [currentPath, setCurrentPath] = useState('/home/glitchbane'); // Ruta actual en el sistema de archivos virtual.
  const [booted, setBooted] = useState(false); // `true` si la secuencia de arranque ha terminado.
  const [remoteHost, setRemoteHost] = useState<string | null>(null); // Host remoto al que se está "conectado".
  const [fs, setFs] = useState<FileSystemNode>(fileSystem); // Estado del sistema de archivos.

  // --- REFERENCIAS Y HOOKS ---
  const inputRef = useRef<HTMLInputElement>(null); // Referencia al campo de input para poder enfocarlo.
  const endOfLinesRef = useRef<HTMLDivElement>(null); // Referencia a un div al final para hacer scroll automático.
  const { toast } = useToast(); // Hook para mostrar notificaciones.
  const isMobile = useIsMobile(); // Hook para detectar si es un dispositivo móvil.
  
  // --- FUNCIONES DE UTILIDAD ---
  
  // Añade una nueva línea a la salida de la terminal.
  const addLine = useCallback((content: React.ReactNode, type?: TerminalLine['type']) => {
    if (type === 'interactive') {
      setIsInteractive(true);
    }
    setLines(prev => [...prev, { id: Date.now() + Math.random(), content, type }]);
  }, []);

  // Termina un comando interactivo, como `htop`.
  const finishInteractiveCommand = useCallback(() => {
    setLines(prev => prev.filter(l => l.type !== 'interactive'));
    setIsInteractive(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Función de traducción (atajo `t`).
  const t = useCallback((key: keyof Translations, params: any = {}): string => {
    let text = translations[lang]?.[key] || translations['es'][key];
    if (typeof text !== 'string') {
        if (key === 'cat_image') return 'No se puede mostrar una imagen en la terminal.';
        return key;
    }
    for (const param in params) {
        text = text.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    }
    return text;
  }, [lang]);

  // Obtiene un nodo del sistema de archivos a partir de una ruta.
  const getNodeFromPath = useCallback((path: string, currentFs: FileSystemNode): FileSystemNode | null => {
    const parts = path.split('/').filter(p => p);
    let currentNode: FileSystemNode = currentFs;

    if (path === '/') return currentFs;

    for (const part of parts) {
        if (currentNode.type === 'dir' && currentNode.children && part in currentNode.children) {
            currentNode = currentNode.children[part];
        } else {
            return null;
        }
    }
    return currentNode;
  }, []);

  // Añade un archivo al directorio actual (usado por `wget`).
  const addFileToCurrentDir = useCallback((filename: string) => {
    setFs(prevFs => {
        const newFs = JSON.parse(JSON.stringify(prevFs)); // Copia profunda para no mutar el estado.
        const currentNode = getNodeFromPath(currentPath, newFs);

        if (currentNode && currentNode.type === 'dir') {
            if (!currentNode.children) {
                currentNode.children = {};
            }
            currentNode.children[filename] = { type: 'file', content: `Downloaded file: ${filename}` };
        }
        return newFs;
    });
  }, [currentPath, getNodeFromPath]);

  // Objeto que se pasa a los comandos para que puedan interactuar con la terminal.
  const terminalInterface: Terminal = {
    setPath: (path: string) => setCurrentPath(path),
    getPath: () => currentPath,
    addLine,
    t,
    setRemoteHost,
    finishInteractiveCommand,
    isMobile,
    addFileToCurrentDir,
  };

  // Resuelve una ruta relativa o absoluta a una ruta absoluta completa.
  const resolvePath = useCallback((path: string): string => {
    if (path.startsWith('/')) {
        const newPathArray = path.split('/').filter(p => p);
        const resolvedPath: string[] = [];
        for (const part of newPathArray) {
            if (part === '..') {
                resolvedPath.pop();
            } else if (part !== '.') {
                resolvedPath.push(part);
            }
        }
        return '/' + resolvedPath.join('/');
    }

    const newPath = currentPath.split('/').filter(p => p);
    const pathParts = path.split('/').filter(p => p);

    for (const part of pathParts) {
        if (part === '..') {
            newPath.pop();
        } else if (part !== '.') {
            newPath.push(part);
        }
    }
    return '/' + newPath.join('/');
  }, [currentPath]);

  // Función de traducción que devuelve JSX para renderizar HTML.
  const t_html = useCallback((key: keyof Translations, params: any = {}): React.ReactNode => {
    const translation = t(key, params);
    if (translation === key) {
        return <div className="text-red-500">{t('cat_no_such_file', { filename: key })}</div>;
    }
    return <div dangerouslySetInnerHTML={{ __html: translation }} />
  }, [t]);
  
  // Datos para el comando `neofetch`.
  const userInfo = useCallback((): Omit<NeofetchData, 'asciiArt' | 'ip'> => ({
    usuario: "glitchbane@VoidShell",
    host: t('neofetch_host'),
    os: t('neofetch_os'),
    kernel: t('neofetch_kernel'),
    uptime: t('neofetch_uptime'),
    shell: t('neofetch_shell'),
    resolution: "2048 x 1080",
    de_wm: "Django, Express, NextJS, PHP, JavaScript, Tailwind",
    terminal_font: t('neofetch_terminal_font'),
    memory: t('neofetch_memory'),
  }), [t]);

  // Arte ASCII para `neofetch`.
  const asciiArt = `
                  ##
                 ####
                ######
               ########
              ##########
             ############
            ##############
           ################
          ##################
         ####################
        ######################
       #########      #########
      ##########      ##########
     ###########      ###########
    ##########          ##########
   #######                  #######
  ####                          ####
 ###                              ###
`;

  // --- EFECTOS ---

  // Obtiene la IP del usuario al cargar el componente.
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIp(data.ip || t('ip_not_available'));
      } catch (error) {
        console.error('Error fetching IP:', error);
        setIp(t('ip_not_available'));
      }
    };
    fetchIp();
  }, [t]);

  // Hace scroll hacia el final de la terminal cada vez que se añade una línea.
  const scrollToBottom = () => {
    endOfLinesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  // Actualiza la última línea de la salida (usado para animaciones como `wget`).
  const updateLastLine = (content: React.ReactNode) => {
    setLines(prev => {
      const newLines = [...prev];
      if (newLines.length > 0) {
        newLines[newLines.length - 1].content = content;
      }
      return newLines;
    });
  };
  
  // --- LÓGICA DE COMANDOS ---

  // Función principal para procesar y ejecutar un comando.
  const processCommand = useCallback(async (commandStr: string) => {
    const [command, ...args] = commandStr.trim().split(/\s+/);
    addLine(<Prompt input={commandStr} path={currentPath} user={remoteHost ? `${remoteHost}@voidshell` : 'glitchbane@voidshell'}/>);

    // Lógica para cuando se está en una "conexión remota".
    if (remoteHost) {
        if (command === 'exit') {
            setRemoteHost(null);
            addLine(t('connect_logout'));
        } else if (command === 'ls') {
            addLine(
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {remoteSystems[remoteHost].files.map(file => (
                        <div key={file} className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>{file}</span>
                        </div>
                    ))}
                </div>
            );
        } else if (command) {
            addLine(t('connect_command_not_found', { command }));
        }
    } else if (command === '') {
        // No hace nada si el comando está vacío.
    } else if (command in commands) {
        // Ejecuta el comando si existe.
        const output = commands[command](args, t, terminalInterface);
        if (output) addLine(output);
    } else {
        addLine(t('command_not_found', { command }));
    }

    // Añade el comando al historial.
    if (commandStr.trim() !== '') {
        setCommandHistory(prev => [commandStr, ...prev].slice(0, 50));
    }
    setHistoryIndex(-1);
  }, [t, currentPath, terminalInterface, addLine, remoteHost, fs]);
  
  // --- DEFINICIÓN DE COMANDOS ---
  // Cada comando es una función que se añade al objeto `commands`.
  
  commands['help'] = (args, t) => (
    <div className="space-y-1">
      <p>{t('help_available_commands')}</p>
      <ul className="list-disc list-inside grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4">
        {Object.keys(commands).sort().map(cmd => 
          <li key={cmd}><span className="text-primary">{cmd}</span></li>
        )}
      </ul>
    </div>
  );
  commands['clear'] = () => {
    setLines([]);
  }
  commands['neofetch'] = (args, t) => {
    const neofetchData = { ...userInfo(), asciiArt, ip };
    return <NeofetchOutput data={neofetchData} />;
  }
  commands['date'] = () => new Date().toString();
  commands['whoami'] = () => 'Israel Zamora - GlitchBane';
  commands['ls'] = (args, t) => {
    const path = args[0] ? resolvePath(args[0]) : currentPath;
    const node = getNodeFromPath(path, fs);

    if (!node || node.type !== 'dir') {
        return t('cat_no_such_file', { filename: path });
    }

    const children = node.children || {};
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(children).map(([name, childNode]) => (
                <div key={name} className="flex items-center gap-2">
                    {childNode.type === 'dir' ? (
                        <Folder className="h-4 w-4 text-blue-400" />
                    ) : name.match(/\.(png|svg|jpg)$/i) ? (
                        <ImageIcon className="h-4 w-4 text-purple-400" />
                    ) : (
                        <FileText className="h-4 w-4 text-primary" />
                    )}
                    <span className={childNode.type === 'dir' ? "text-blue-400" : ""}>{name}</span>
                </div>
            ))}
        </div>
    );
  };
  commands['cat'] = (args, t) => {
    const filename = args[0];
    if (!filename) {
      return t('cat_missing_operand');
    }
    const path = resolvePath(filename);
    const node = getNodeFromPath(path, fs);

    if (!node || node.type !== 'file') {
        return t('cat_no_such_file', { filename });
    }
    
    if (node.content) {
        if (node.content.startsWith('project ')) {
            const projectName = node.content.split(' ')[1];
            return commands['project']([projectName], t, terminalInterface);
        }
        if (node.content.endsWith('_md')) {
            return t_html(node.content as keyof Translations);
        }
        if (node.content === 'cat_image') {
            return t('cat_image');
        }
    }
    return <pre className="whitespace-pre-wrap">{t(node.content as keyof Translations, {filename})}</pre>;
  };
  commands['about'] = (args, t) => t_html('about_md');
  commands['resume'] = (args, t) => t_html('resume_md');
  commands['skills'] = (args, t) => t_html('skills_md');
  commands['experience'] = (args, t) => t_html('experience_md');
  commands['education'] = (args, t) => t_html('education_md');
  commands['project-list'] = (args, t) => t_html('project-list_md');
  commands['project'] = (args, t) => {
    const projectName = args[0]?.toLowerCase();
    if (!projectName) {
      return (
        <div>
          <p>{t('project_usage')}</p>
          <p>{t('project_available', { projects: Object.keys(projectData).join(', ') })}</p>
        </div>
      );
    }
    const project = projectData[projectName];
    if (project) {
      return (
        <div>
          <p><span className="font-bold text-primary">{project.name}</span></p>
          <p>{project.description}</p>
          <p><span className="font-bold">{t('project_tech')}:</span> {project.tech.join(', ')}</p>
          <p>
            <span className="font-bold">GitHub: </span>
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {project.githubUrl}
            </a>
          </p>
          <p>
            <span className="font-bold">Demo: </span>
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {project.demoUrl}
            </a>
          </p>
        </div>
      );
    }
    return t('project_not_found', { projectName });
  };
  commands['contact'] = (args, t) => t_html('contact_md');
  commands['social'] = (args, t) => t_html('social_md');
  commands['echo'] = (args) => args.join(' ');
  commands['history'] = (args, t) => (
    <div className="flex flex-col">
      {commandHistory.slice().reverse().map((cmd, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="w-8 text-right text-muted-foreground">{i + 1}</span>
          <span>{cmd}</span>
        </div>
      ))}
    </div>
  );
  commands['motd'] = (args, t) => {
    const motdKeys: (keyof Translations)[] = ['motd1', 'motd2', 'motd3', 'motd4', 'motd5'];
    const randomIndex = Math.floor(Math.random() * motdKeys.length);
    return t(motdKeys[randomIndex]);
  };
  commands['cowsay'] = (args, t) => cowsay(args.join(' '), t);
  commands['switch'] = (args, t) => {
    const themeName = args.join(' ').toLowerCase();
    if (!themeName) {
      return (
        <div>
          <p>{t('switch_usage')}</p>
          <p>{t('switch_available_themes')}:</p>
          <ul className="list-disc list-inside">
            <li>1. Cyberpunk 2077</li>
            <li>2. The Witcher 3</li>
            <li>3. Hollow Knight</li>
            <li>4. Red Dead Redemption</li>
            <li>default</li>
          </ul>
        </div>
      );
    }
    const themeClass = themes[themeName];
    if (themeClass) {
      document.documentElement.className = `dark ${themeClass}`;
      return t('switch_theme_changed', { themeName });
    }
    return t('switch_theme_not_found', { themeName });
  };
  commands['blog'] = (args, t) => {
    const subCommand = args[0];
    const blogPostsData = JSON.parse(t('blog_posts_json'));

    if (!subCommand) {
      return t_html('blog_usage');
    }

    if (subCommand === 'ls') {
      return (
        <div>
          <p>{t('blog_available_posts')}:</p>
          <ul className="list-disc list-inside">
            {Object.entries(blogPostsData).map(([slug, post]: [string, any]) => (
              <li key={slug}>
                <span className="text-muted-foreground">{post.date}</span> - <span className="text-primary">{post.title}</span> (`{slug}`)
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (subCommand === 'read') {
      const postSlug = args[1];
      if (!postSlug) {
        return t('blog_read_usage');
      }
      const post = blogPostsData[postSlug];
      if (post) {
        return (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-primary">{post.title}</h2>
            <p className="text-xs text-muted-foreground">{t('blog_published_on', { date: post.date })}</p>
            <div className="h-px bg-border"></div>
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        );
      }
      return t('blog_post_not_found', { postSlug });
    }

    return t('blog_command_not_recognized', { subCommand });
  };
  commands['lang'] = (args, t) => {
    const newLang = args[0];
    if (!newLang) {
      return t('lang_usage', { supported_langs: Object.keys(translations).join(', ') });
    }
    if (translations[newLang]) {
      setLang(newLang);
      // Reinicia la terminal para que los cambios de idioma se apliquen al neofetch inicial.
      setLines([]); 
      setBooted(false);
      return t('lang_changed', { lang: newLang });
    }
    return t('lang_not_supported', { lang: newLang });
  };
  commands['scan'] = (args, t) => {
    const target = args[0];
    if (!target) {
        return t('scan_usage');
    }
    return <ScanOutput target={target} t={t} />;
  };
  commands['cd'] = (args, t, { setPath }) => {
    const targetPath = args[0] || '/home/glitchbane';
    const newPath = resolvePath(targetPath);
    const node = getNodeFromPath(newPath, fs);

    if (node && node.type === 'dir') {
        setPath(newPath);
    } else {
        return t('cd_no_such_directory', { directory: targetPath });
    }
  };
  commands['tree'] = (args, t) => {
    const startPath = args[0] ? resolvePath(args[0]) : currentPath;
    const startNode = getNodeFromPath(startPath, fs);

    if (!startNode || startNode.type !== 'dir') {
        return t('cd_no_such_directory', { directory: startPath });
    }

    // Función recursiva para generar el árbol.
    const generateTree = (node: FileSystemNode, prefix = ''): React.ReactNode[] => {
        const entries = Object.entries(node.children || {});
        let treeLines: React.ReactNode[] = [];

        entries.forEach(([name, childNode], index) => {
            const isLast = index === entries.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const childPrefix = prefix + (isLast ? '    ' : '│   ');

            const icon = childNode.type === 'dir' 
                ? <Folder className="inline-block h-4 w-4 mr-1 text-blue-400" />
                : name.match(/\.(png|svg|jpg)$/i)
                ? <ImageIcon className="inline-block h-4 w-4 mr-1 text-purple-400" />
                : <FileText className="inline-block h-4 w-4 mr-1 text-primary" />;

            treeLines.push(
                <div key={prefix + name}>
                    <span>{prefix}{connector}</span>
                    {icon}
                    <span className={childNode.type === 'dir' ? 'text-blue-400' : ''}>{name}</span>
                </div>
            );

            if (childNode.type === 'dir') {
                treeLines = treeLines.concat(generateTree(childNode, childPrefix));
            }
        });
        return treeLines;
    };
    
    return (
        <div>
            <div>{startPath}</div>
            {generateTree(startNode)}
        </div>
    );
  };
  commands['decrypt'] = (args, t) => {
    const filename = args[0];
    if (!filename) {
        return t('decrypt_usage');
    }
    const path = resolvePath(filename);
    const node = getNodeFromPath(path, fs);

    if (!node || node.type !== 'file' || !node.content?.endsWith('_enc')) {
        return t('decrypt_not_found', { filename });
    }
    
    const contentKey = node.content as keyof Translations;
    const decryptedContent = t(contentKey);
    return <DecryptOutput t={t} content={decryptedContent} />;
  };
  commands['connect'] = (args, t, { setRemoteHost }) => {
    const host = args[0];
    if (!host) {
        return t('connect_usage');
    }
    if (remoteSystems[host]) {
        setRemoteHost(host);
        return t_html(remoteSystems[host].welcome as keyof Translations);
    }
    return t('connect_not_found', { host });
  };
  
  // Función que maneja la lógica de `htop` y `top`.
  const handleHtop = (t: (key: keyof Translations, params?: any) => string, { addLine, finishInteractiveCommand, isMobile }: Omit<Terminal, 'addFileToCurrentDir'>) => {
    if (isMobile) {
        return t('htop_mobile_not_supported');
    }
    addLine(<HtopOutput t={t} onExit={finishInteractiveCommand} />, 'interactive');
  };

  commands['top'] = (args, t, terminal) => handleHtop(t, terminal);
  commands['htop'] = (args, t, terminal) => handleHtop(t, terminal);

  commands['man'] = (args, t) => {
    const commandName = args[0];
    if (!commandName) {
        return t('man_usage');
    }
    const manPagesData = JSON.parse(t('man_pages_json'));
    const page = manPagesData[commandName];

    if (page) {
        return (
            <div className="space-y-2 text-sm whitespace-pre-wrap">
                <div>
                    <p className="font-bold text-primary">{t('man_section_name')}</p>
                    <p>{page.name}</p>
                </div>
                <div>
                    <p className="font-bold text-primary">{t('man_section_synopsis')}</p>
                    <p className="font-mono">{page.synopsis}</p>
                </div>
                <div>
                    <p className="font-bold text-primary">{t('man_section_description')}</p>
                    <p>{page.description}</p>
                </div>
            </div>
        );
    }
    return t('man_not_found', { command: commandName });
  };

  commands['sudo'] = (args, t) => {
    if (args.length === 0) {
        return t('sudo_usage');
    }
    return t_html('sudo_permission_denied');
  };
  
  commands['wget'] = (args, t, { addFileToCurrentDir }) => {
    const url = args[0];
    if (!url) {
        return t('wget_usage');
    }
    
    // Validación básica de la URL.
    try {
        new URL(url);
    } catch (_) {
        return t('wget_invalid_url', { url });
    }

    const filename = url.split('/').pop() || 'index.html';

    return <WgetOutput t={t} targetUrl={url} filename={filename} onComplete={() => addFileToCurrentDir(filename)} />;
  };

  commands['weather'] = (args, t) => {
    const city = args.join(' ');
    if (!city) {
      return t('weather_usage');
    }
    return <WeatherOutput city={city} t={t} apiKey={process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''} />;
  };

  commands['cal'] = (args, t) => {
    return <CalOutput t={t} />;
  };

  commands['stats'] = (args, t) => {
    return <StatsOutput t={t} />;
  };

  commands['pwd'] = (args, t, { getPath }) => {
    return getPath();
  };


  // --- MANEJADORES DE EVENTOS ---

  // Maneja los eventos de teclado en el input.
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isInteractive) return; // No hacer nada si un comando interactivo está activo.

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isProcessing) return;

      const currentInput = input;
      setInput('');
      setSuggestion('');

      setIsProcessing(true);
      await processCommand(currentInput);
      setIsProcessing(false);

    } else if (e.key === 'ArrowUp') { // Navegar historial hacia arriba.
      e.preventDefault();
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
      if (newIndex >= 0) {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') { // Navegar historial hacia abajo.
      e.preventDefault();
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setInput(commandHistory[newIndex]);
      } else {
        setInput('');
      }
    } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && inputRef.current?.selectionStart === input.length)) { // Autocompletado.
      if (suggestion) {
        e.preventDefault();
        setInput(suggestion);
        setSuggestion('');
      } else {
        // Lógica para mostrar múltiples candidatos si hay varias coincidencias.
        e.preventDefault();
        const [command, ...args] = input.trim().split(/\s+/);
        
        let candidates: string[] = [];
        const allCommands = Object.keys(commands);

        if (args.length === 0 && !input.includes(' ')) {
           candidates = allCommands.filter(c => c.startsWith(command));
        }

        if (candidates.length > 1) {
          addLine(<Prompt input={input} path={currentPath} />);
          addLine(<div className="flex flex-wrap gap-x-4">{candidates.join('  ')}</div>);
        } else if (candidates.length === 1) {
          setInput(candidates[0] + ' ');
        }
      }
    }
  };

  // Maneja los cambios en el input para actualizar el estado y las sugerencias.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value) {
      const [command, ...args] = value.split(' ');
      let newSuggestion = '';
      
      const allCommands = Object.keys(commands);

      // Lógica de autocompletado de comandos.
      if (args.length === 0 && !value.includes(' ')) {
        const match = allCommands
          .sort()
          .find(c => c.startsWith(value));
        if (match && match !== value) {
          newSuggestion = match;
        }
      }
      setSuggestion(newSuggestion);
    } else {
      setSuggestion('');
    }
  }

  // --- SECUENCIA DE ARRANQUE ---

  // Ejecuta la animación de arranque de la terminal.
  const runBootSequence = useCallback(async () => {
    if (booted) return;
    setBooted(true);
    setIsProcessing(true);
    const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
  
    addLine(<span><span className="text-green-400">[INFO]</span> {t('boot_sequence_start')}</span>);
    await wait(500);
    
    addLine(<span><span className="text-green-400">[INFO]</span> {t('boot_sequence_loading_modules')}</span>);
    await wait(300);
    addLine(<span><span className="text-green-500">[OK]</span> {t('boot_sequence_module_ok', { module: 'core' })}</span>);
    await wait(150);
    addLine(<span><span className="text-green-500">[OK]</span> {t('boot_sequence_module_ok', { module: 'net' })}</span>);
    await wait(150);
    addLine(<span><span className="text-yellow-500">[WARN]</span> {t('boot_sequence_module_warn', { old: 'gfx_legacy', new: 'gfx_stream' })}</span>);
    await wait(300);
    
    addLine(<span><span className="text-green-400">[INFO]</span> {t('boot_sequence_checking_fs')}</span>);
    await wait(500);
    addLine(<span><span className="text-green-500">[OK]</span> {t('boot_sequence_fs_ok')}</span>);
    await wait(200);

    addLine(<span><span className="text-green-400">[INFO]</span> {t('boot_sequence_connecting')}</span>);
    const progressId = Date.now();
    addLine(<span id={`progress-${progressId}`}></span>, 'progress');
    
    // Animación de barra de progreso.
    for (let i = 0; i <= 100; i += 4) {
      const bar = '█'.repeat(i / 4);
      const empty = '░'.repeat(25 - (i / 4));
      updateLastLine(
        <pre className="whitespace-pre">
          {`[${bar}${empty}] ${i}%`}
        </pre>
      );
      await wait(30);
    }
    await wait(300);
    
    setLines([]); // Limpia la salida del arranque.
    const neofetchData = { ...userInfo(), asciiArt, ip };
    addLine(<NeofetchOutput data={neofetchData} />); // Muestra el neofetch.
    setIsProcessing(false);
    
  }, [ip, t, userInfo, asciiArt, addLine, booted]);

  // Ejecuta la secuencia de arranque una vez que se ha obtenido la IP.
  useEffect(() => {
    if (ip !== "..." && !booted) {
        runBootSequence();
    }
  }, [ip, booted, runBootSequence]);
  
  // Enfoca el input cuando el usuario hace clic en cualquier parte de la terminal.
  const focusInput = () => {
    if (!isInteractive) {
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, [isProcessing, isInteractive]);

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div 
      className="w-full max-w-4xl h-[70vh] max-h-[800px] bg-black/50 backdrop-blur-sm border border-accent rounded-lg shadow-2xl shadow-primary/20 flex flex-col font-code"
      onClick={focusInput}
    >
      {/* Barra de título de la ventana */}
      <div className="flex-shrink-0 bg-black/30 p-2 rounded-t-lg flex items-center gap-2 border-b border-accent/50">
        <span className="h-3 w-3 rounded-full bg-red-500"></span>
        <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
        <span className="h-3 w-3 rounded-full bg-green-500"></span>
        <p className="text-xs text-center flex-1 text-muted-foreground">{remoteHost ? `${remoteHost}@voidshell` : 'glitchbane@voidshell'}: ~</p>
      </div>
      {/* Área de contenido de la terminal */}
      <div className="flex-1 p-4 overflow-y-auto text-sm leading-relaxed custom-scrollbar">
        {lines.map(line => (
          <div key={line.id} className="mb-2">
            {line.content}
          </div>
        ))}

        {/* Muestra el prompt y el input solo si no hay un comando procesándose o interactivo. */}
        {!isProcessing && !isInteractive && (
          <div className="relative flex items-center">
            <Prompt path={currentPath} user={remoteHost ? `${remoteHost}@voidshell` : 'glitchbane@voidshell'} promptSymbol={remoteHost ? '#' : '$'} />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none text-foreground focus:ring-0 outline-none flex-1 pl-2"
              disabled={isProcessing}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
            />
             {/* Muestra la sugerencia de autocompletado. */}
             {suggestion && input && suggestion.startsWith(input) && (
              <div className="absolute left-0 top-0 flex items-center pointer-events-none">
                <Prompt path={currentPath} user={remoteHost ? `${remoteHost}@voidshell` : 'glitchbane@voidshell'} promptSymbol={remoteHost ? '#' : '$'}/>
                <span className="text-transparent pl-2">{input}</span>
                <span className="text-muted-foreground/50">
                  {suggestion.substring(input.length)}
                </span>
              </div>
            )}
          </div>
        )}
        <div ref={endOfLinesRef} />
      </div>
    </div>
  );
}

// Componente para renderizar el prompt (ej: glitchbane@voidshell:~$).
const Prompt = ({ input, path, user = 'glitchbane@voidshell', promptSymbol = '$' }: { input?: string, path: string, user?: string, promptSymbol?: string }) => {
  const displayPath = path.replace('/home/glitchbane', '~');

  return (
    <div className="flex-shrink-0 flex items-center">
      <span className="text-green-400">{user}</span>
      <span className="text-foreground">:</span>
      <span className="text-blue-400">{displayPath}</span>
      <span className="text-foreground">{promptSymbol} </span>
      {input && <span>{input}</span>}
    </div>
  );
};
