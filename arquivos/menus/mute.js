// .arquivos/menus/mute.js

const { getVerificacao } = require("../../database/sistema/verificador"); // ajusta o caminho conforme sua estrutura

async function handleMuteCommand(sock, from, Info, args, prefix, BOT_PHONE, muteManager) {
  try {
    // ✅ Verifica se é grupo
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: "❌ Este comando só funciona em grupos." }, { quoted: Info });
    }

    // ✅ Verifica permissões do usuário e do bot
    const { participants, isSenderAdmin, isSenderOwner, isSenderDonoBot, botId, isBotAdmin } =
      await getVerificacao(sock, from, Info, prefix, BOT_PHONE);

    if (!isSenderAdmin && !isSenderOwner && !isSenderDonoBot) {
      return sock.sendMessage(from, { text: "🚫 Apenas administradores, dono do grupo ou dono do bot podem mutar membros." }, { quoted: Info });
    }

    if (!isBotAdmin) {
      return sock.sendMessage(from, { text: "🤖 Preciso ser administrador para aplicar o mute." }, { quoted: Info });
    }

    // === Identifica o alvo ===
    let alvo = null;
    if (Info.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      alvo = Info.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (Info.message?.extendedTextMessage?.contextInfo?.participant) {
      alvo = Info.message.extendedTextMessage.contextInfo.participant;
    } else if (args.length > 0) {
      const maybe = args[0];
      alvo = maybe.includes('@') ? maybe : (maybe + '@s.whatsapp.net');
    }

    if (!alvo) {
      return sock.sendMessage(from, { text: "📌 Use: *.mute @usuario* ou *.mute 5598999999999@s.whatsapp.net*" }, { quoted: Info });
    }

    if (alvo === botId) {
      return sock.sendMessage(from, { text: "🤖 Não posso me mutar!" }, { quoted: Info });
    }

    const alvoInfo = participants.find(p => p.id === alvo);
    if (alvoInfo && (alvoInfo.admin === 'admin' || alvoInfo.admin === 'superadmin') && !isSenderDonoBot) {
      return sock.sendMessage(from, { text: "⛔ Não posso mutar um administrador (somente o dono do bot pode)." }, { quoted: Info });
    }

    // === Executa o mute ===
    muteManager.muteUser(from, alvo, Info.key.participant || Info.key.remoteJid);

    await sock.sendMessage(from, {
      text: `🔇 @${alvo.split('@')[0]} foi *mutado* neste grupo.`,
      mentions: [alvo]
    }, { quoted: Info });

  } catch (err) {
    console.error("Erro no comando mute:", err);
    await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao tentar mutar o usuário." }, { quoted: Info });
  }
}

async function handleUnmuteCommand(sock, from, Info, args, prefix, BOT_PHONE, muteManager) {
  try {
    // ✅ Verifica se é grupo
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { text: "❌ Este comando só funciona em grupos." }, { quoted: Info });
    }

    // ✅ Verifica permissões do usuário
    const { participants, isSenderAdmin, isSenderOwner, isSenderDonoBot, botId } =
      await getVerificacao(sock, from, Info, prefix, BOT_PHONE);

    if (!isSenderAdmin && !isSenderOwner && !isSenderDonoBot) {
      return sock.sendMessage(from, { text: "🚫 Apenas administradores, dono do grupo ou dono do bot podem desmutar membros." }, { quoted: Info });
    }

    // === Identifica o alvo ===
    let alvo = null;
    if (Info.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      alvo = Info.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (Info.message?.extendedTextMessage?.contextInfo?.participant) {
      alvo = Info.message.extendedTextMessage.contextInfo.participant;
    } else if (args.length > 0) {
      const maybe = args[0];
      alvo = maybe.includes('@') ? maybe : (maybe + '@s.whatsapp.net');
    }

    if (!alvo) {
      return sock.sendMessage(from, { text: "📌 Use: *.unmute @usuario* ou *.unmute 5598999999999@s.whatsapp.net*" }, { quoted: Info });
    }

    if (alvo === botId) {
      return sock.sendMessage(from, { text: "🤖 Eu não posso me desmutar (porque nunca me mutei!)." }, { quoted: Info });
    }

    // === Executa o unmute ===
    const sucesso = muteManager.unmuteUser(from, alvo);

    if (sucesso) {
      await sock.sendMessage(from, {
        text: `🔊 @${alvo.split('@')[0]} foi *desmutado* neste grupo.`,
        mentions: [alvo]
      }, { quoted: Info });
      
    } else {
      await sock.sendMessage(from, {
        text: `⚠️ @${alvo.split('@')[0]} não está mutado neste grupo.`,
        mentions: [alvo]
      }, { quoted: Info });
    }

  } catch (err) {
    console.error("Erro no comando unmute:", err);
    await sock.sendMessage(from, { text: "❌ Ocorreu um erro ao tentar desmutar o usuário." }, { quoted: Info });
  }
}

module.exports = { handleMuteCommand, handleUnmuteCommand };