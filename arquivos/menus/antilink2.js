module.exports = async (sock, Info, args, from, isGroup, antiLinkManager) => {
  try {
    if (!isGroup) {
      return sock.sendMessage(from, { 
        text: '⚠️ Este comando só funciona em grupos!' 
      }, { quoted: Info });
    }

    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants;
    const senderJid = Info.key.participant || Info.key.remoteJid;
    const senderParticipant = participants.find(p => p.id === senderJid);
    const isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin');
    const isSenderOwner = metadata.owner === senderJid;

    // Verifica se o autor tem permissão
    if (!isSenderAdmin && !isSenderOwner) {
      return sock.sendMessage(from, { 
        text: '🚫 Apenas administradores podem alterar o *AntiLinkHard*!' 
      }, { quoted: Info });
    }

    const option = args[0]?.toLowerCase();

    if (option === 'on' || option === 'ativar') {
      antiLinkManager.enable(from);
      return sock.sendMessage(from, { 
        text: '✅ *AntiLinkHard* foi *ativado* neste grupo.' 
      }, { quoted: Info });

    } else if (option === 'off' || option === 'desativar') {
      antiLinkManager.disable(from);
      return sock.sendMessage(from, { 
        text: '❌ *AntiLinkHard* foi *desativado* neste grupo.' 
      }, { quoted: Info });

    } else {
      const status = antiLinkManager.isEnabled(from) ? '🟢 Ativado' : '🔴 Desativado';
      return sock.sendMessage(from, { 
        text: `📡 *Status do AntiLinkHard neste grupo:*\n${status}\n\nUse:\n• *.antilinkhard on* para ativar\n• *.antilinkhard off* para desativar` 
      }, { quoted: Info });
    }

  } catch (err) {
    console.error('Erro no comando antilinkhard:', err);
    await sock.sendMessage(from, { 
      text: '❌ Ocorreu um erro ao tentar alterar o AntiLinkHard.' 
    }, { quoted: Info });
  }
};