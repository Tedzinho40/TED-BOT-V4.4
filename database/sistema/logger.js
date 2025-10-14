const chalk = require("chalk");
const path = require("path");

/**
 * 🎨 Classe de formatação visual
 */
class Formatter {
    constructor() {
        this.colors = {
            primary: chalk.hex('#00BFFF'),    // Azul Neon
            success: chalk.hex('#32CD32'),    // Verde Vibrante
            warning: chalk.hex('#FFD700'),    // Dourado
            error: chalk.hex('#FF4500'),      // Laranja avermelhado
            info: chalk.hex('#9370DB'),       // Roxo suave
            system: chalk.hex('#40E0D0'),     // Turquesa
            api: chalk.hex('#FF69B4'),        // Rosa vibrante
            debug: chalk.hex('#A9A9A9'),      // Cinza
        };
    }

    // 🔹 Divisor elegante
    divider(color = this.colors.primary) {
        return color('╔══════════════════════════════════════════════════╗');
    }

    // 🔹 Rodapé opcional
    footer(color = this.colors.primary) {
        return color('╚══════════════════════════════════════════════════╝');
    }

    // 🔹 Cabeçalho bonito com ícone + hora
    header(icon, title, color) {
        const timestamp = chalk.gray(new Date().toLocaleTimeString('pt-BR'));
        return `${this.divider(color)}
${color.bold(` ${icon} ${title}`)}  ${timestamp}`;
    }

    // 🔹 Linha de detalhe mais moderna
    detail(label, value, color) {
        const labelStyled = chalk.white.bold(`› ${label}:`);
        const valueStyled = chalk.white(value || chalk.gray('N/A'));
        return `${color(labelStyled)} ${valueStyled}`;
    }
}

/**
 * 🚀 Logger estilizado e melhorado
 */
class Logger {
    constructor() {
        this.formatter = new Formatter();
        this.botStartTime = Date.now();
    }

    getUptime() {
        const uptimeMs = Date.now() - this.botStartTime;
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptimeMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((uptimeMs / (1000 * 60)) % 60);
        return `${days}d ${hours}h ${minutes}m`;
    }

    log(type, details = {}) {
        const { colors } = this.formatter;
        const output = [];

        const beautify = (icon, title, color, lines = []) => {
            output.push(this.formatter.header(icon, title, color));
            lines.forEach(line => output.push(line));
            output.push(this.formatter.footer(color));
        };

        switch (type) {
            case 'MESSAGE_RECEIVED':
                beautify('💬', 'Mensagem Recebida', colors.primary, [
                    this.formatter.detail('De', details.sender, colors.primary),
                    details.isGroup ? this.formatter.detail('Grupo', details.groupName, colors.primary) : '',
                    this.formatter.detail('Tipo', details.messageType, colors.primary),
                    this.formatter.detail('Conteúdo', (details.messageContent || '').substring(0, 80), colors.primary),
                ]);
                break;

            case 'COMMAND_EXECUTED':
                beautify('⚡', `Comando Executado: ${details.command}`, colors.success, [
                    details.isGroup ? this.formatter.detail('Grupo', details.groupName, colors.success) : '',
                    this.formatter.detail('Usuário', details.sender, colors.success),
                    this.formatter.detail('ID Privado', details.privateId, colors.success),
                ]);
                break;

            case 'ERROR_OCCURRED':
                beautify('🚨', `Erro: ${details.errorType}`, colors.error, [
                    this.formatter.detail('Mensagem', details.errorMessage, colors.error),
                    details.command ? this.formatter.detail('Comando', details.command, colors.error) : '',
                ]);
                break;

            case 'ANTILINK_TRIGGERED':
                beautify('🚫', 'Anti-Link Ativado', colors.warning, [
                    this.formatter.detail('Grupo', details.groupName, colors.warning),
                    this.formatter.detail('Usuário', details.sender, colors.warning),
                    this.formatter.detail('Ação', details.action, colors.warning),
                ]);
                break;

            case 'USER_JOINED':
                beautify('👋', 'Novo Membro no Grupo', colors.info, [
                    this.formatter.detail('Grupo', details.groupName, colors.info),
                    this.formatter.detail('Usuário', details.userId, colors.info),
                ]);
                break;

            case 'CONFIG_CHANGED':
                beautify('⚙️', 'Configuração Alterada', colors.system, [
                    this.formatter.detail('Config', details.setting, colors.system),
                    this.formatter.detail('Valor', details.value ? 'ATIVADO' : 'DESATIVADO', colors.system),
                    this.formatter.detail('Alterado por', details.changer, colors.system),
                ]);
                break;

            case 'API_CALL':
                beautify('🌐', `Chamada de API: ${details.apiName}`, colors.api, [
                    this.formatter.detail('Status', details.status, colors.api),
                ]);
                break;

            case 'BOT_STATUS':
                beautify('🤖', `Status do Bot: ${details.status}`, colors.primary, [
                    details.message ? this.formatter.detail('Info', details.message, colors.primary) : '',
                    this.formatter.detail('Uptime', this.getUptime(), colors.primary),
                ]);
                break;

            default:
                beautify('🐞', `Debug: ${type}`, colors.debug, [
                    this.formatter.detail('Dados', JSON.stringify(details, null, 2).substring(0, 120), colors.debug),
                ]);
                break;
        }

        console.log(output.filter(Boolean).join('\n'));
    }
}

module.exports = new Logger();