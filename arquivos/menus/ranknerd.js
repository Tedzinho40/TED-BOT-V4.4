const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = async function ranknerdCommand(sock, from, Info) {
  try {
    // Só em grupos
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { 
        text: "❌ Este comando só pode ser usado em grupos." 
      }, { quoted: Info });
    }

    // Pega participantes do grupo
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;

    if (!participants || participants.length === 0) {
      return sock.sendMessage(from, { 
        text: "❌ Não consegui encontrar membros neste grupo." 
      }, { quoted: Info });
    }

    // Embaralha e seleciona 5 aleatórios
    const embaralhar = arr => arr.sort(() => Math.random() - 0.5);
    const participantesAleatorios = embaralhar(participants).slice(0, 5);

    // Dados do ranking
    const porcentagens = [100, 91, 78, 65, 52];
    const titulos = [
      "👑 *NERD SUPREMO*",
      "🧠 *NERD DE OURO*",
      "💻 *NERD BRILHANTE*",
      "📚 *NERD ESTUDIOSO*",
      "🎮 *NERD RECRUTA*"
    ];
    const frasesExtras = [
      "🤓 Sabe mais de Star Wars que a própria Wookie.",
      "💾 Programando desde que aprendeu a andar.",
      "🎲 Mestre dos RPGs e quizzes do grupo.",
      "📖 Lê mais livros do que a biblioteca inteira.",
      "🕹️ Gamer nível hard, nerd nível expert!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   🤓 *TOP 5 NERDS 2025* 🤓   ║
╚══════════════════════════╝

🔍 *Análise solicitada por @${(Info.key?.participant || Info.from || "usuário").split("@")[0]}*  
📆 ${new Date().toLocaleDateString("pt-BR")}
───────────────────────────────
`;

    const mencionados = [];

    // Monta ranking
    for (let i = 0; i < participantesAleatorios.length; i++) {
      const p = participantesAleatorios[i];
      const numero = p.id.split("@")[0];
      mencionados.push(p.id);
      legenda += `
${titulos[i]}
@${numero}
🧠 *Nível de Nerdice:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão Final:*  
Esses são os *Top 5 Nerds Oficiais* do grupo!  
🤓 Nenhuma inteligência foi poupada nesta análise!`;

    // Envia imagem com legenda e menções
    await sock.sendMessage(from, {
      image: { url: "https://tedzinho.online/upload/WHbfpG.jpg" },
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando ranknerd:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao montar o ranking dos nerds 😅" 
    }, { quoted: Info });
  }
};