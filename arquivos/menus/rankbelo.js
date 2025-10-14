module.exports = async function rankbeloCommand(sock, from, Info) {
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
    const porcentagens = [100, 92, 81, 68, 55];
    const titulos = [
      "👑 *BELO SUPREMO*",
      "🌟 *BELO DE OURO*",
      "💎 *BELO BRILHANTE*",
      "✨ *BELO ESTUDIOSO*",
      "🪞 *BELO RECRUTA*"
    ];
    const frasesExtras = [
      "😍 Encanta todo mundo só com o sorriso.",
      "💖 Aparência impecável e carisma único.",
      "🌈 Beleza que se destaca até no grupo.",
      "😎 Sempre elegante e confiante.",
      "😉 Subindo no ranking, mas já chamando atenção!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   ✨ *TOP 5 BELOS 2025* ✨   ║
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
✨ *Nível de Beleza:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão Final:*  
Esses são os *Top 5 Belos Oficiais* do grupo!  
🌟 Nenhuma beleza foi poupada nesta análise!`;

    // Envia imagem com legenda e menções
    await sock.sendMessage(from, {
      image: { url: "https://tedzinho.online/upload/kIbGAM.jpg" }, // troque se quiser outra imagem
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando rankbelo:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao montar o ranking dos belos 😅" 
    }, { quoted: Info });
  }
};