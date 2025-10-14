// ./arquivos/menus/rankgay.js

module.exports = async function rankgayCommand(sock, from, Info) {
  try {
    // Só pode ser usado em grupo
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { 
        text: "❌ Este comando só pode ser usado em grupos." 
      }, { quoted: Info });
    }

    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;

    if (!participants || participants.length === 0) {
      return sock.sendMessage(from, { 
        text: "❌ Não consegui encontrar membros neste grupo." 
      }, { quoted: Info });
    }

    // Seleciona 5 aleatórios
    const embaralhar = arr => arr.sort(() => Math.random() - 0.5);
    const participantesAleatorios = embaralhar(participants).slice(0, 5);

    // Dados do ranking
    const porcentagens = [100, 89, 76, 61, 47];
    const titulos = [
      "👑 *GAY SUPREMO*",
      "🌈 *GAY DE OURO*",
      "💅 *GAY BRILHANTE*",
      "🩷 *GAY FASHION*",
      "🫦 *GAY RECRUTA*"
    ];
    const frasesExtras = [
      "💋 Disse que era brincadeira, mas gostou do beijo.",
      "👠 Tem mais roupa colorida que a bandeira LGBTQIA+.",
      "🎤 Canta Gloria Groove no chuveiro com emoção.",
      "💅 Sabe mais de maquiagem que a própria namorada.",
      "🕺 Rebola até em música de elevador!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   🏳️‍🌈 *RANKING DOS GAYS 2025* 🏳️‍🌈   ║
╚══════════════════════════╝

📸 *Análise feita com base em dados ultra secretos do grupo*  
📆 ${new Date().toLocaleDateString("pt-BR")}
───────────────────────────────
`;

    const mencionados = [];

    // Monta a lista
    for (let i = 0; i < participantesAleatorios.length; i++) {
      const p = participantesAleatorios[i];
      const numero = p.id.split("@")[0];
      mencionados.push(p.id);
      legenda += `
${titulos[i]}
@${numero}
🌈 *Índice Gayzístico:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão Final:*  
Esses são os *Top 5 Arco-Íris Oficiais* do grupo!  
✨ Nenhum glitter foi poupado na apuração!

📷 *Comprovantes abaixo!*`;

    // Envia imagem com legenda e marcações
    await sock.sendMessage(from, {
      image: { url: "https://telegra.ph/file/fe1a5a942d6114ebc18a3.jpg" },
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando rankgay:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao tentar montar o ranking dos gays 😂" 
    }, { quoted: Info });
  }
};