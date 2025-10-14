const config = require("../config.json");

// Função para gerar data/hora formatada
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR");
    return { date, time };
}

function generateMenuAdm() {
    const { date, time } = getCurrentDateTime();

    return `
╔═════ ∘◦ ✨ ◦∘ ═════╗
        👑 MENU ADM 👑
╚═════ ∘◦ ✨ ◦∘ ═════╝

🗓️ _${date}_
🕰️ _${time}_
👤 _Dono: ${config.NickDono}_

┏━────╯⌬╰────━┓
┃   *💡 CONFIGURAÇÕES*
┃ ▸ 👁️ ${config.prefix}views 1/0      - *Ativar/Desativar views*
┃ ▸ 💾 ${config.prefix}backup          - *Backup do sistema*
┃ ▸ 🔄 ${config.prefix}restart         - *Reiniciar bot*
┣━━「 🔒 PROTEÇÃO 」 
┃ ▸ 🚫 ${config.prefix}antilinkhard   - *Anti-link global*
┃ ▸ 🔗 ${config.prefix}antilinkgrupo  - *Anti-link no grupo*
┃ ▸ 📣 ${config.prefix}totag          - *Mencionar todos*
┃ ▸ 👋 ${config.prefix}welcome         - *Boas-vindas automáticas*
┣━━「 ⚔️ ADMINISTRATIVO 」 
┃ ▸ ❌ ${config.prefix}ban @user       - *Banir membro*
┃ ▸ 🤭 ${config.prefix}marcar         - *Marcar alguém*
┃ ▸ 👑 ${config.prefix}promover       - *Dar cargo de admin*
┃ ▸ 🔻 ${config.prefix}rebaixar       - *Remover cargo*
┃ ▸ 🔊 ${config.prefix}mute           - *Silenciar membro*
┃ ▸ 🔇 ${config.prefix}unmute         - *Liberar som*
┃ ▸ 🔗 ${config.prefix}linkgp         - *Gerar link do grupo*
┃ ▸ 📜 ${config.prefix}regras         - *Mostrar regras*
┗━────╮⌬╭────━┛

`;
}

module.exports = generateMenuAdm;