// ./arquivos/menus/rebaixar.js
module.exports = async (sock, from, Info, prefix, BOT_PHONE, getVerificacao) => {
  try {
    const groupMetadata = from.endsWith("@g.us") ? await sock.groupMetadata(from) : { subject: "Chat Privado", participants: [] };
    const { participants, isSenderAdmin, isSenderOwner, isBotAdmin, donoBotNumero } =
      await getVerificacao(sock, from, Info, prefix, BOT_PHONE);

    if (!isSenderAdmin && !isSenderOwner) {
      return sock.sendMessage(from, { text: "❌ Apenas administradores podem usar este comando." }, { quoted: Info });
    }

    if (!isBotAdmin) {
      return sock.sendMessage(from, { text: "🤖 Preciso ser admin para rebaixar alguém!" }, { quoted: Info });
    }

    // ====== IDENTIFICAÇÃO DOS ALVOS ======
    let mentioned = [];
    const ctx = Info.message?.extendedTextMessage?.contextInfo;
    if (ctx?.mentionedJid) mentioned = ctx.mentionedJid;
    if (ctx?.participant && !mentioned.includes(ctx.participant)) mentioned.push(ctx.participant);

    if (mentioned.length === 0) {
      return sock.sendMessage(from, { text: "❌ Marque a mensagem da pessoa que deseja rebaixar ou use @." }, { quoted: Info });
    }

    // ====== PROCESSAMENTO ======
    let mentions = []; // array de JIDs para marcar
    let mensagem = `⚡ Resultado do comando Rebaixar no grupo "${groupMetadata.subject}" ⚡\n\n`;

    for (const alvo of mentioned) {
      const targetParticipant = participants.find(p => p.id === alvo);
      const displayName = targetParticipant?.notify || alvo.split("@")[0];

      if (!targetParticipant) {
        mensagem += `⚠️ @${displayName} não foi encontrado(a) no grupo\n`;
        mentions.push(alvo);
        continue;
      }

      const alvoNumero = targetParticipant.phoneNumber || targetParticipant.jid?.split('@')[0] || alvo.split('@')[0];
      const isAlvoDonoBot = alvoNumero.replace(/[^0-9]/g, "") === donoBotNumero;

      if (isAlvoDonoBot) {
        mensagem += `👑 @${displayName} é o chefão do bot e está seguro!\n`;
        mentions.push(alvo);
        continue;
      }

      try {
        await sock.groupParticipantsUpdate(from, [alvo], "demote");
        mensagem += `🚨 @${displayName} foi *[ REBAIXADO(A) COM SUCESSO ]*\n`;
        mentions.push(alvo);
      } catch {
        mensagem += `❌ @${displayName} não pôde ser rebaixado(a)\n`;
        mentions.push(alvo);
      }
    }

    // ====== ENVIA A MENSAGEM COM MENÇÕES ======
    await sock.sendMessage(from, { 
      text: mensagem.trim(),
      mentions 
    }, { quoted: Info });

  } catch (err) {
    await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao tentar rebaixar." }, { quoted: Info });
  }
};