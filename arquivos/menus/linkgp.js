// ./arquivos/menus/linkgp.js

const { getVerificacao } = require("../../database/sistema/verificador"); // ajusta o caminho conforme sua estrutura

module.exports = async function linkgpCommand(sock, from, Info, prefix, BOT_PHONE) {
  try {
    // ✅ Verifica se é grupo
    if (!from.endsWith('@g.us')) {
      return sock.sendMessage(from, { 
        text: "❌ Este comando só funciona em grupos." 
      }, { quoted: Info });
    }

    // ✅ Verifica se o usuário que enviou é administrador
    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.find(
      p => p.id === Info.key.participant || p.id === Info.key.remoteJid
    )?.admin;

    if (!isAdmin) {
      return sock.sendMessage(from, { 
        text: "❌ Apenas administradores podem gerar o link do grupo!" 
      }, { quoted: Info });
    }

    // ✅ Verifica se o bot é administrador usando a função do verificador.js
    const { isBotAdmin } = await getVerificacao(sock, from, Info, prefix, BOT_PHONE);
    if (!isBotAdmin) {
      return sock.sendMessage(from, { 
        text: "🤖 Preciso ser administrador do grupo para gerar o link de convite!" 
      }, { quoted: Info });
    }

    // Reage indicando processamento
    await sock.sendMessage(from, { react: { text: "⏳", key: Info.key } });

    // Gera o link de convite
    const code = await sock.groupInviteCode(from);
    const groupLink = `https://chat.whatsapp.com/${code}`;

    // Tenta obter a foto do grupo
    let groupPicture = null;
    try {
      groupPicture = await sock.profilePictureUrl(from, 'image');
    } catch {
      console.log("Grupo sem foto ou não foi possível carregar");
    }

    // Mensagem formatada com informações do grupo
    const linkMessage = `
╔═══════════════════════╗
║     📲 LINK DO GRUPO     ║
╚═══════════════════════╝

🏷️ *Nome:* ${metadata.subject || "Grupo"}
👥 *Participantes:* ${metadata.participants.length}
🔗 *Link de Convite:*
${groupLink}

💡 *Instruções:*
• Compartilhe este link para convidar pessoas
• O link é válido por 7 dias
• Apenas administradores podem gerar novos links

⚠️ *Aviso:* Não compartilhe em grupos públicos para evitar invasões.
    `.trim();

    // Envia mensagem com ou sem foto do grupo
    if (groupPicture) {
      await sock.sendMessage(from, { 
        image: { url: groupPicture },
        caption: linkMessage
      }, { quoted: Info });
    } else {
      await sock.sendMessage(from, { 
        text: linkMessage 
      }, { quoted: Info });
    }

    // Confirmação com reação
    await sock.sendMessage(from, { react: { text: "✅", key: Info.key } });

  } catch (error) {
    console.error("Erro no comando linkgr:", error);

    // Reação de erro
    try {
      await sock.sendMessage(from, { react: { text: "❌", key: Info.key } });
    } catch {}

    // Mensagem de erro específica
    let errorMessage = "❌ Ocorreu um erro ao gerar o link do grupo.";
    
    if (error.message.includes("not authorized")) {
      errorMessage = "❌ Não tenho permissão para gerar o link. Verifique se sou administrador.";
    } else if (error.message.includes("invite code")) {
      errorMessage = "❌ Não foi possível gerar o código de convite.";
    } else if (error.message.includes("participant")) {
      errorMessage = "❌ Erro ao verificar permissões do usuário.";
    }
    
    await sock.sendMessage(from, { text: errorMessage }, { quoted: Info });
  }
}