module.exports = async (sock, from, Info, prefix, BOT_PHONE, getVerificacao) => {
  try {
    const groupMetadata = await sock.groupMetadata(from);
    const { participants, isSenderAdmin, isSenderOwner, botId, isBotAdmin } = 
      await getVerificacao(sock, from, Info, prefix, BOT_PHONE);

    if (!isSenderAdmin && !isSenderOwner) {
      return sock.sendMessage(from, { 
        text: "❌ Apenas administradores podem usar este comando." 
      }, { quoted: Info });
    }

    if (!isBotAdmin) {
      return sock.sendMessage(from, { 
        text: "🤖 Preciso ser admin para promover alguém!" 
      }, { quoted: Info });
    }

    // ====== IDENTIFICAÇÃO DO ALVO ======
    let mentioned = [];

    if (Info.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      mentioned = Info.message.extendedTextMessage.contextInfo.mentionedJid;
    }

    if (mentioned.length === 0 && Info.message?.extendedTextMessage?.contextInfo?.participant) {
      mentioned = [Info.message.extendedTextMessage.contextInfo.participant];
    }

    if (mentioned.length === 0) {
      return sock.sendMessage(from, { 
        text: "❌ Marque a mensagem do usuário que deseja promover a admin." 
      }, { quoted: Info });
    }

    const alvo = mentioned[0];
    await sock.groupParticipantsUpdate(from, [alvo], "promote");

    const alvoDisplay = alvo.split('@')[0];
    await sock.sendMessage(from, { 
      text: `✅ @${alvoDisplay} agora é *Administrador(a)* do grupo! 🎉`,
      mentions: [alvo]
    }, { quoted: Info });

  } catch (err) {
    console.error("❌ Erro ao promover:", err);
    await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao promover." }, { quoted: Info });
  }
};