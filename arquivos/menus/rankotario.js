module.exports = async function rankotarioCommand(sock, from, Info) {
  try {
    // Só funciona em grupos
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
    const porcentagens = [99, 85, 70, 55, 40];
    const titulos = [
      "👑 *OTÁRIO SUPREMO*",
      "🥈 *OTÁRIO DE LUXO*",
      "🥉 *OTÁRIO COMUM*",
      "🪓 *OTÁRIO SOFREDOR*",
      "🧢 *OTÁRIO RECRUTA*"
    ];
    const frasesExtras = [
      "😂 Caiu em golpe de WhatsApp e ainda agradeceu.",
      "😵 Acreditou em fake news e compartilhou pro grupo.",
      "😬 Confundiu boleto falso com conta real.",
      "😭 Comprou pacote caro e recebeu produto errado.",
      "🙃 Sempre pega no pulo, mas nunca aprende!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   🤡 *TOP 5 OTÁRIOS 2025* 🤡   ║
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
🤡 *Nível de Otarice:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão Final:*  
Esses são os *Top 5 Otários Oficiais* do grupo!  
😂 Nenhum vacilo foi poupado nesta análise!`;

    // Envia imagem com legenda e menções
    await sock.sendMessage(from, {
      image: { url: "https://tedzinho.online/upload/awHdvo.jpeg" }, // você pode trocar a imagem
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando rankotario:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao montar o ranking dos otários 😅" 
    }, { quoted: Info });
  }
};