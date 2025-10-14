
// UI Module
const chalk = require("chalk");
const cfonts = require("cfonts");
const readline = require("readline");

// Cores personalizadas para um design moderno
const colors = {
  primary: '#8A2BE2', // Roxo vibrante
  secondary: '#FFD700', // Dourado
  success: '#32CD32', // Verde lima
  warning: '#FF8C00', // Laranja escuro
  error: '#DC143C', // Vermelho carmesim
  info: '#1E90FF', // Azul dodger
  dark: '#1A1A2E', // Azul escuro quase preto
  light: '#E0E0E0', // Cinza claro
  accent: '#00FFFF' // Ciano para detalhes
};

// Banner futurista e informativo
function showBanner(botName = "TED BOT", tagline = "tedzinho.com.br") {
  clearScreen(); // Limpa a tela para um banner limpo
  const bannerText = cfonts.render((botName), {
    font: 'block',
    align: "center",
    colors: [colors.primary, colors.accent],
    space: false,
    letterSpacing: 1,
    lineHeight: 1,
    maxLength: 0,
    gradient: true,
    independentGradient: true,
    transitionGradient: true,
    env: 'node'
  });
  console.log(bannerText.string);

  const info = cfonts.render(tagline, {
    font: 'console',
    align: 'center',
    colors: [colors.light, colors.light],
    space: false,
    letterSpacing: 0,
    lineHeight: 1,
    maxLength: 0,
    gradient: false,
    independentGradient: false,
    transitionGradient: false,
    env: 'node'
  });
  console.log(info.string);
  console.log(chalk.hex(colors.secondary).bold(`
${'─'.repeat(process.stdout.columns || 80)}
`));
}

// Sistema de logs aprimorado com ícones modernos e cores vibrantes
const status = {
  _log: (type, icon, color, text) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    console.log(chalk.hex(color).bold(`${icon} [${timestamp}] `) + chalk.hex(color)(text));
  },

  info: (text) => {
    status._log('info', '💡', colors.info, text);
  },
  
  success: (text) => {
    status._log('success', '✅', colors.success, text);
  },
  
  warning: (text) => {
    status._log('warning', '⚠️', colors.warning, text);
  },
  
  error: (text) => {
    status._log('error', '❌', colors.error, text);
  },
  
  connection: (text) => {
    status._log('connection', '🔗', colors.primary, text);
  },
  
  message: (text) => {
    status._log('message', '💬', '#87CEEB', text);
  },
  
  command: (text) => {
    status._log('command', '⚡', '#98FB98', text);
  },
  
  save: (text) => {
    status._log('save', '💾', '#DDA0DD', text);
  },
  
  antilink: (text) => {
    status._log('antilink', '🚫', '#FF4500', text);
  },
  
  welcome: (text) => {
    status._log('welcome', '👋', '#FF69B4', text);
  },
  
  config: (text) => {
    status._log('config', '⚙️', '#40E0D0', text);
  },

  debug: (text) => {
    status._log('debug', '🐛', colors.secondary, text); // Novo tipo de log para depuração
  }
};

// Função de prompt interativo e estilizado
function promptInput(label) {
  const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout 
  });
  
  return new Promise((resolve) => {
    const prompt = chalk.hex(colors.accent).bold(`
${label}: `);
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Função para mostrar estatísticas com um design mais limpo
function showStats(stats) {
  const borderChar = '═';
  const cornerChar = '─';
  const verticalChar = '║';
  const horizontalChar = '─';

  const maxLength = Object.keys(stats).reduce((max, key) => Math.max(max, key.length), 0);
  const valueLength = Object.values(stats).reduce((max, value) => Math.max(max, String(value).length), 0);
  const totalWidth = maxLength + valueLength + 7; // Key + Value + ' : ' + spaces

  console.log(chalk.hex(colors.primary)(`
╔${borderChar.repeat(totalWidth)}╗`));
  console.log(chalk.hex(colors.primary)(`${verticalChar} ${chalk.hex(colors.accent).bold('ESTATÍSTICAS DO SISTEMA').padStart(Math.floor((totalWidth - 24) / 2) + 24).padEnd(totalWidth)} ${verticalChar}`));
  console.log(chalk.hex(colors.primary)(`╠${horizontalChar.repeat(totalWidth)}╣`));
  
  Object.entries(stats).forEach(([key, value]) => {
    const formattedKey = chalk.hex(colors.light)(key.padEnd(maxLength));
    const formattedValue = chalk.hex(colors.secondary)(String(value).padStart(valueLength));
    console.log(chalk.hex(colors.primary)(`${verticalChar} ${formattedKey} : ${formattedValue} ${verticalChar}`));
  });
  
  console.log(chalk.hex(colors.primary)(`╚${borderChar.repeat(totalWidth)}╝`));
  console.log('');
}

// Função para mostrar progresso com barra de carregamento moderna
function showProgress(current, total, label = 'Progresso') {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * 20); // Barra menor para não poluir
  const empty = 20 - filled;
  
  const bar = chalk.hex(colors.success)('█'.repeat(filled)) + chalk.hex(colors.dark)('░'.repeat(empty));
  const progressText = `${label}: [${bar}] ${percentage}% (${current}/${total})`;
  
  console.log(chalk.hex(colors.info)(progressText));
}

// Função para limpar terminal
function clearScreen() {
  process.stdout.write('\x1Bc');
}

// Função para mostrar separador estilizado
function showSeparator(text = '') {
  const width = process.stdout.columns || 80;
  const lineChar = '─';
  let line;
  if (text) {
    const padding = Math.max(0, (width - text.length - 2) / 2);
    line = lineChar.repeat(Math.floor(padding)) + ` ${text} ` + lineChar.repeat(Math.ceil(padding));
  } else {
    line = lineChar.repeat(width);
  }
  console.log(chalk.hex(colors.accent)(line));
}

// Função para mostrar tabela com design aprimorado
function showTable(headers, rows) {
  const colWidths = headers.map((header, i) => 
    Math.max(header.length, ...rows.map(row => String(row[i] || '').length))
  );
  
  const totalWidth = colWidths.reduce((sum, width) => sum + width, 0) + (headers.length * 3) + 1; // Colunas + separadores + bordas

  // Header
  const headerRow = '║ ' + headers.map((header, i) => 
    chalk.hex(colors.secondary).bold(header.padEnd(colWidths[i]))
  ).join(' ║ ') + ' ║';
  
  const separator = '╠' + colWidths.map(width => 
    '═'.repeat(width + 2)
  ).join('╬') + '╣';
  
  const topBorder = '╔' + colWidths.map(width => 
    '═'.repeat(width + 2)
  ).join('╦') + '╗';
  
  const bottomBorder = '╚' + colWidths.map(width => 
    '═'.repeat(width + 2)
  ).join('╩') + '╝';
  
  console.log(chalk.hex(colors.primary)(topBorder));
  console.log(chalk.hex(colors.primary)(headerRow));
  console.log(chalk.hex(colors.primary)(separator));
  
  // Rows
  rows.forEach(row => {
    const rowText = '║ ' + row.map((cell, i) => 
      chalk.hex(colors.light)(String(cell || '').padEnd(colWidths[i]))
    ).join(' ║ ') + ' ║';
    console.log(chalk.hex(colors.primary)(rowText));
  });
  
  console.log(chalk.hex(colors.primary)(bottomBorder));
}

// Função para obter e exibir informações do sistema - VERSÃO CORRIGIDA E APRIMORADA
async function showSystemStats() {
  try {
    const si = require("systeminformation");
    const mem = await si.mem();
    const fsSize = await si.fsSize();
    const currentLoad = await si.currentLoad();
    const osInfo = await si.osInfo();

    const cpuUsage = currentLoad.currentLoad !== undefined ? currentLoad.currentLoad.toFixed(2) + '%' : "N/A";
    
    const firstFs = fsSize[0];
    const totalStorage = firstFs && firstFs.size !== undefined ? 
      `${(firstFs.size / (1024 ** 3)).toFixed(2)} GB` : "N/A";
    const usedStorage = firstFs && firstFs.used !== undefined ? 
      `${(firstFs.used / (1024 ** 3)).toFixed(2)} GB` : "N/A";
    
    const stats = {
      "Sistema Operacional": osInfo.distro,
      "Arquitetura": osInfo.arch,
      "Uso da CPU": cpuUsage,
      "Memória Total": `${(mem.total / (1024 ** 3)).toFixed(2)} GB`,
      "Memória Usada": `${(mem.used / (1024 ** 3)).toFixed(2)} GB`,
      "Armazenamento Total": totalStorage,
      "Armazenamento Usado": usedStorage
    };
    
    showStats(stats);
  } catch (error) {
    status.error(`Erro ao obter informações detalhadas do sistema: ${error.message}`);
    // Fallback com informações básicas de memória
    try {
      const si = require("systeminformation");
      const mem = await si.mem();
      const stats = {
        "Memória Total": `${(mem.total / (1024 ** 3)).toFixed(2)} GB`,
        "Memória Usada": `${(mem.used / (1024 ** 3)).toFixed(2)} GB`
      };
      showStats(stats);
    } catch (fallbackError) {
      status.error("Não foi possível obter nenhuma informação do sistema.");
    }
  }
}

module.exports = { 
  showBanner, 
  status, 
  promptInput, 
  showStats, 
  showProgress, 
  clearScreen, 
  showSeparator, 
  showTable,
  colors,
  showSystemStats
};

