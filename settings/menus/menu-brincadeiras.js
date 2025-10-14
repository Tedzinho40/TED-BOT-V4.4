const config = require("../config.json");

// Função para gerar data/hora formatada
function getCurrentDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR");
    return { date, time };
}

function generateBrincadeirasMenu() {
    const { date, time } = getCurrentDateTime();

    return `
╔═════ ∘◦ ✨ ◦∘ ═════╗
      *🎉 MENU DE BRINCADEIRAS 🎉*
╚═════ ∘◦ ✨ ◦∘ ═════╝

🗓️ _${date}_
🕰️ _${time}_
👤 _Dono: ${config.NickDono}_

┏━────╯⌬╰────━┓
┃   *🏆 TOP 5 - RANKS* 📊
┃ ▸ 🌈 ${config.prefix}rankgay      - *Top 5 Gays*
┃ ▸ 🐂 ${config.prefix}rankcorno    - *Top 5 Cornos*
┃ ▸ 😍 ${config.prefix}rankbelo     - *Top 5 Bonitos*
┃ ▸ 🤓 ${config.prefix}ranknerd     - *Top 5 Nerds*
┃ ▸ 💃 ${config.prefix}rankgostosa  - *Top 5 Gostosas*
┃ ▸ 🤡 ${config.prefix}rankotario   - *Top 5 Otários*
┃ ▸ 😂 ${config.prefix}rankfeio     - *Top 5 Feios*
┃ ▸ 💸 ${config.prefix}rankrico     - *Top 5 Milionários*
┣━━「 🎲 BRINCADEIRAS » 」
┃ ▸ 🎯 ${config.prefix}verdade       - *Jogo da Verdade*
┃ ▸ 🃏 ${config.prefix}desafio       - *Desafio Aleatório*
┃ ▸ 🎰 ${config.prefix}roleta        - *Roleta Divertida*
┃ ▸ 🧩 ${config.prefix}quiz          - *Quiz Interativo*
┃ ▸ 🥳 ${config.prefix}simounao      - *Sim ou Não*
┗━────╮⌬╭────━┛
`;
}

module.exports = generateBrincadeirasMenu;