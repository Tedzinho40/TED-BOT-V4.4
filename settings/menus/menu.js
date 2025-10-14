const config = require("../config.json");

// Função para gerar data/hora formatada
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR");
    return { date, time };
}

function generateMenu() {
    const { date, time } = getCurrentDateTime();

    return `
╔═════ ∘◦ ✨ ◦∘ ═════╗
      *${config.NomeDoBot}*
╚═════ ∘◦ ✨ ◦∘ ═════╝

🗓️ _${date}_
🕰️ _${time}_
👤 _Dono: ${config.NickDono}_

┏━────╯⌬╰────━┓
┃   *MENU DE COMANDOS*
┣━━「 💠 *PRINCIPAL* 」
┃ ▸ ${config.prefix}menuadm
┃ ▸ ${config.prefix}brincadeiras
┣━━「 🔹 *SISTEMA* 」
┃ ▸ ${config.prefix}ping
┃ ▸ ${config.prefix}status
┃ ▸ ${config.prefix}stats
┃ ▸ ${config.prefix}roubar
┃ ▸ ${config.prefix}sticker
┃ ▸ ${config.prefix}toimg
┣━━「 🎤 *CONVERSÃO* 」
┃ ▸ ${config.prefix}totext
┃ ▸ ${config.prefix}ptvmsg
┃ ▸ ${config.prefix}attp
┃ ▸ ${config.prefix}ttp
┣━━「 📥 *DOWNLOAD* 」
┃ ▸ ${config.prefix}tomp3
┃ ▸ ${config.prefix}shazam
┃ ▸ ${config.prefix}play
┃ ▸ ${config.prefix}sc
┃ ▸ ${config.prefix}ttk
┃ ▸ ${config.prefix}ttk2
┃ ▸ ${config.prefix}tiktok
┃ ▸ ${config.prefix}tiktok2
┃ ▸ ${config.prefix}kwai
┃ ▸ ${config.prefix}instamp4
┃ ▸ ${config.prefix}instamp3
┃ ▸ ${config.prefix}Pintemp4
┃ ▸ ${config.prefix}Pintemp3
┃ ▸ ${config.prefix}Pinterest
┣━━「 👤 *PERFIL* 」
┃ ▸ ${config.prefix}perfil
┗━────╮⌬╭────━┛
`;
}

module.exports = generateMenu;