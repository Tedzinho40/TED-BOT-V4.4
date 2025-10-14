// ./arquivos/menus/rankgostosa.js

module.exports = async function rankgostosaCommand(sock, from, Info) {
  try {
    // Verifica se o comando foi usado em grupo
    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { 
        text: "❌ Este comando só pode ser usado em grupos." 
      }, { quoted: Info });
    }

    // Pega informações do grupo
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
    const porcentagens = [100, 94, 82, 69, 57];
    const titulos = [
      "👑 *GOSTOSA SUPREMA*",
      "🔥 *GOSTOSO(A) DE LUXO*",
      "💃 *GOSTOSO(A) BRILHANTE*",
      "😉 *GOSTOSO(A) INTERMEDIÁRIO(A)*",
      "😋 *GOSTOSO(A) RECRUTA*"
    ];
    const frasesExtras = [
      "💋 Faz todo mundo virar o pescoço quando entra no grupo.",
      "🔥 Deu um sorriso e o chat parou!",
      "😎 Até os emojis ficam com inveja do charme.",
      "💞 Beleza natural e atitude de milhões.",
      "😂 Tá subindo no ranking, mas ainda falta aquele gingado!"
    ];

    // Cabeçalho do ranking
    let legenda = `╔══════════════════════════╗
║   💋 *RANKING DAS GOSTOSAS 2025* 💋   ║
╚══════════════════════════╝

📸 *Baseado em dados ultra confiáveis do grupo*  
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
💞 *Nível de Gostosura:* ${porcentagens[i]}%
${frasesExtras[i]}
───────────────────────────────`;
    }

    legenda += `
🏆 *Conclusão Final:*  
Esses são os *Top 5 Mais Gostosos(as)* do grupo!  
🔥 Nenhum charme foi poupado nesta análise!

📷 *Eis a prova dos fatos abaixo!*`;

    // Envia imagem com legenda e menções
    await sock.sendMessage(from, {
      image: { url: "https://files.catbox.moe/pslnpn.jpg" },
      caption: legenda,
      mentions: mencionados
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro no comando rankgostosa:", err);
    await sock.sendMessage(from, { 
      text: "⚠️ Ocorreu um erro ao montar o ranking das gostosas 😅" 
    }, { quoted: Info });
  }
};