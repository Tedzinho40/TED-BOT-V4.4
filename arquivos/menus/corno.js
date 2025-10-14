// ./arquivos/menus/corno.js

module.exports = async function cornoCommand(sock, from, Info) {
  try {
    // Verifica se o comando foi usado em grupo
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { 
        text: "❌ Este comando só pode ser usado em grupos." 
      }, { quoted: Info });
    }

    // Obtém os participantes do grupo
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;

    if (!participants || participants.length === 0) {
      return sock.sendMessage(from, { 
        text: "❌ Não consegui encontrar membros neste grupo." 
      }, { quoted: Info });
    }

    // Função para embaralhar e selecionar 5 aleatórios
    const embaralhar = arr => arr.sort(() => Math.random() - 0.5);
    const participantesAleatorios = embaralhar(participants).slice(0, 5);

    // Níveis e frases
    const porcentagens = [99, 87, 72, 58, 43];
    const titulos = [
      "👑 *KORNO SUPREMO*",
      "🥈 *KORNO DE LUXO*",
      "🥉 *KORNO BRONZEADO*",
      "🪓 *KORNO SOFREDOR*",
      "🧢 *KORNO RECRUTA*"
    ];
    const frasesExtras = [
      "💔 Pegou a morena com o motoboy e ainda pediu carona!",
      "😵 Descobriu a traição, mas perdoou e virou padrasto.",
      "😂 Já foi corno 3 vezes e ainda chama de 'minha princesa'.",
      "😭 Disse que é mentira, mas o print não mente!",
      "😬 Disse que 'amor verdadeiro supera tudo'... e tomou mais um chifre!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   🐮 *RANKING DOS KORNOS 2025* 🐮   ║
╚══════════════════════════╝

📸 *Análise feita com base em dados do grupo*  
📆 ${new Date().toLocaleDateString("pt-BR")}
───────────────────────────────
`;

    const mencionados = [];

    // Monta lista dos cornos
    for (let i = 0; i < participantesAleatorios.length; i++) {
      const p = participantesAleatorios[i];
      const numero = p.id.split("@")[0];
      mencionados.push(p.id);
      legenda += `
${titulos[i]}
@${numero}
🔥 *Nível de cornice:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão da Análise:*  
Esses são os *Top 5 Cornos Oficiais* do grupo!  
😂 Nenhum chifre foi poupado na apuração!

📷 *Eis a prova dos fatos abaixo!*`;

    // Envia imagem com legenda e marcações
    await sock.sendMessage(from, {
      image: { url: "https://xatimg.com/image/tWO07MRj1mj8.jpg" },
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando corno:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao tentar montar o ranking dos cornos 😂" 
    }, { quoted: Info });
  }
};