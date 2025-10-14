module.exports = async function rankricoCommand(sock, from, Info) {
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
    const porcentagens = [100, 90, 77, 63, 50];
    const titulos = [
      "👑 *RICO SUPREMO*",
      "💰 *RICO DE OURO*",
      "💎 *RICO BRILHANTE*",
      "🏦 *RICO ESTUDIOSO*",
      "🪙 *RICO RECRUTA*"
    ];
    const frasesExtras = [
      "💸 Compra ações e criptos antes de todo mundo.",
      "🏠 Tem casa na praia e apartamento na cidade.",
      "🚗 Possui mais carros que o grupo inteiro.",
      "📈 Investimentos sempre no topo do mercado.",
      "💳 Sempre paga as contas sem suar!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   💰 *TOP 5 RICOS 2025* 💰   ║
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
💰 *Nível de Riqueza:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão Final:*  
Esses são os *Top 5 Ricos Oficiais* do grupo!  
💸 Nenhuma fortuna foi poupada nesta análise!`;

    // Envia imagem com legenda e menções
    await sock.sendMessage(from, {
      image: { url: "https://tedzinho.online/upload/wyhyXN.jpg" }, // troque se quiser outra imagem
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando rankrico:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao montar o ranking dos ricos 😅" 
    }, { quoted: Info });
  }
};