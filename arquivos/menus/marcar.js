
async function markAll(sock, Info, from) {
  try {
    // Obtém os metadados do grupo (informações como participantes, dono, etc.)
    const metadata = await sock.groupMetadata(from);
    if (!metadata.participants) {
        return sock.sendMessage(from, { 
            text: "❌ Este comando só pode ser usado em grupos." 
        }, { quoted: Info });
    }
    const participants = metadata.participants;

    // Identifica o remetente da mensagem
    const senderJid = Info.key.participant || Info.key.remoteJid;
    const senderParticipant = participants.find(p => p.id === senderJid);

    // Verifica se o remetente é administrador ou o dono do grupo
    const isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

    if (!isSenderAdmin) {
      return sock.sendMessage(from, {
        text: "❌ Apenas administradores podem marcar todos os membros."
      }, { quoted: Info });
    }

    // Extrai o texto adicional que o usuário enviou junto com o comando
    const messageText = Info.message?.conversation || Info.message?.extendedTextMessage?.text || "";
    const command = messageText.split(' ')[0];
    const additionalText = messageText.replace(command, '').trim();

    // Monta a mensagem de menção com um design
    let message = `╔═══════════════════╗\n`;
    message += `║   *MENÇÃO GERAL* 📢   ║\n`;
    message += `╚═══════════════════╝\n\n`;

    if (additionalText) {
      message += `💬 *Mensagem:* ${additionalText}\n\n`;
    }

    message += `*Marcando todos os ${participants.length} membros.*\n\n`;

    // Adiciona a menção de cada participante ao texto
    let mentions = [];
    participants.forEach(participant => {
      const userJid = participant.id;
      const userNumber = userJid.split('@')[0];
      message += `• @${userNumber}\n`;
      mentions.push(userJid);
    });

    // Envia a mensagem final, incluindo o array 'mentions' para que o WhatsApp reconheça as marcações
    await sock.sendMessage(from, {
      text: message,
      mentions: mentions
    }, { quoted: Info });

  } catch (err) {
    console.error("Erro no comando 'marcar todos':", err);
    await sock.sendMessage(from, {
      text: "❌ Ocorreu um erro ao tentar marcar todos os membros. Verifique se estou como admin no grupo."
    }, { quoted: Info });
  }
}

// Exporta a função para ser utilizada em outros arquivos
module.exports = markAll;
