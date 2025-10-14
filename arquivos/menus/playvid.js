const axios = require("axios");

/**
 * Comando: playvid
 * Função: Baixar e enviar vídeo ou música do YouTube via API externa.
 */
async function playvid(sock, from, args, Info) { // <--- 'logActivity' foi REMOVIDO daqui
  const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: Info });

  try {
    const query = args.join(" ").trim();

    if (!query) {
      return reply(`❌ Cadê o nome da música ou o link do YouTube?\n\n*Exemplo:*\n.playvid Matuê Quer Voar`);
    }

    await sock.sendMessage(from, { react: { text: "⏳", key: Info.key } });

    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = query.match(youtubeRegex);
    const youtubeId = match ? match[1] : null;

    const apiUrlVideo = youtubeId
      ? `https://systemzone.store/api/ytmp4?id=${youtubeId}`
      : `https://systemzone.store/api/ytmp4?text=${encodeURIComponent(query)}`;
    const apiUrlAudio = youtubeId
      ? `https://systemzone.store/api/ytmp3?id=${youtubeId}`
      : `https://systemzone.store/api/ytmp3?text=${encodeURIComponent(query)}`;

    // A chamada para 'logActivity' foi COMPLETAMENTE REMOVIDA daqui.

    const [videoApiResult, audioApiResult] = await Promise.all([
      axios.get(apiUrlVideo).then(r => r.data).catch(() => null),
      axios.get(apiUrlAudio).then(r => r.data).catch(() => null)
    ]);

    if ((!videoApiResult || !videoApiResult.status) && (!audioApiResult || !audioApiResult.status)) {
      await sock.sendMessage(from, { react: { text: "❌", key: Info.key } });
      return reply("⚠️ Não consegui encontrar o conteúdo solicitado. Verifique o nome ou o link.");
    }

    const data = videoApiResult?.status ? videoApiResult : audioApiResult;
    const { title = "Sem título", author = "Desconhecido", duration = "N/A", thumb } = data;

    let durationSec = 0;
    if (typeof duration === "string" && duration.includes(":")) {
      const parts = duration.split(":").map(Number);
      if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
    }

    const isShortEnoughForAudio = durationSec > 0 && durationSec < 900;
    const sendAsAudio = isShortEnoughForAudio && audioApiResult?.download_url;
    const downloadUrl = sendAsAudio ? audioApiResult.download_url : videoApiResult?.download_vid_url;

    if (!downloadUrl) {
      await sock.sendMessage(from, { react: { text: "❌", key: Info.key } });
      return reply("❌ A API não forneceu um link para download. Tente outro vídeo.");
    }

    const buffer = await axios.get(downloadUrl, { responseType: "arraybuffer" }).then(r => r.data).catch(() => null);

    if (!buffer) {
      await sock.sendMessage(from, { react: { text: "❌", key: Info.key } });
      return reply("❌ Falha ao baixar o arquivo final. Pode ser um problema temporário na API.");
    }

    const caption = `*${title}*\n\n👤 *Autor:* ${author}\n⏱️ *Duração:* ${duration}`;

    if (sendAsAudio) {
      await sock.sendMessage(from, {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `${title.replace(/[^\w\s.-]/gi, "")}.mp3`,
      }, { quoted: Info });
      await sock.sendMessage(from, { text: caption }, { quoted: Info });
    } else {
      await sock.sendMessage(from, {
        video: buffer,
        mimetype: "video/mp4",
        fileName: `${title.replace(/[^\w\s.-]/gi, "")}.mp4`,
        caption: caption,
        jpegThumbnail: thumb ? (await axios.get(thumb, { responseType: 'arraybuffer' }).then(r => r.data).catch(() => undefined)) : undefined
      }, { quoted: Info });
    }

    await sock.sendMessage(from, { react: { text: "✅", key: Info.key } });

  } catch (e) {
    console.error("❌ Erro fatal no comando playvid:", e);
    await sock.sendMessage(from, { text: "❌ Ocorreu um erro inesperado ao processar sua solicitação." }, { quoted: Info });
  }
}

module.exports = playvid;
