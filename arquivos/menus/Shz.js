const acrcloud = require('acrcloud');
const duration = require('format-duration-time');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const axios = require('axios');

module.exports = async function Shazam2Command(sock, from, Info, args, prefix, API_KEY_TED) {
  const { fileTypeFromBuffer } = await import('file-type');
  const baileysModule = await import("@whiskeysockets/baileys");
  const { downloadContentFromMessage } = baileysModule;

  try {
    const quoted = Info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const audioMsg = Info.message?.audioMessage || quoted?.audioMessage;
    const videoMsg = Info.message?.videoMessage || quoted?.videoMessage;

    if (!audioMsg && !videoMsg) {
      await sock.sendMessage(from, {
        text: "🎵 Envie ou marque um áudio/vídeo com música",
      }, { quoted: Info });
      return;
    }

    await sock.sendMessage(from, { react: { text: "🎧", key: Info.key } });

    let audioBuffer;

    // 📥 Processa mídia
    if (videoMsg) {
      const videoStream = await downloadContentFromMessage(videoMsg, "video");
      let videoBuffer = Buffer.from([]);
      for await (const chunk of videoStream) {
        videoBuffer = Buffer.concat([videoBuffer, chunk]);
      }

      const tempVideoInput = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
      const tempAudioOutput = path.join(__dirname, `temp_audio_${Date.now()}.mp3`);
      fs.writeFileSync(tempVideoInput, videoBuffer);

      await new Promise((resolve, reject) => {
        const ffmpegCommand = `ffmpeg -i "${tempVideoInput}" -vn -acodec libmp3lame -ab 192k -ar 44100 -y "${tempAudioOutput}"`;
        child_process.exec(ffmpegCommand, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      audioBuffer = fs.readFileSync(tempAudioOutput);
      if (fs.existsSync(tempVideoInput)) fs.unlinkSync(tempVideoInput);
      if (fs.existsSync(tempAudioOutput)) fs.unlinkSync(tempAudioOutput);

    } else if (audioMsg) {
      const stream = await downloadContentFromMessage(audioMsg, "audio");
      audioBuffer = Buffer.from([]);
      for await (const chunk of stream) audioBuffer = Buffer.concat([audioBuffer, chunk]);
    }

    const mimetype = await fileTypeFromBuffer(audioBuffer);
    if (!mimetype || !mimetype.mime.startsWith("audio")) {
      return await sock.sendMessage(from, { text: "❌ Mídia inválida" }, { quoted: Info });
    }

    // ✂️ Prepara áudio
    const tempInput = path.join(__dirname, `temp_in_${Date.now()}.${mimetype.ext}`);
    const tempOutput = path.join(__dirname, `temp_out_${Date.now()}.mp3`);
    fs.writeFileSync(tempInput, audioBuffer);

    await new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -i "${tempInput}" -t 20 -acodec libmp3lame -q:a 2 "${tempOutput}"`;
      child_process.exec(cmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const cutBuffer = fs.readFileSync(tempOutput);
    fs.unlinkSync(tempInput);
    fs.unlinkSync(tempOutput);

    // 🔍 Identifica música
    const configACR = {
      host: "identify-us-west-2.acrcloud.com",
      access_key: "5fa558ba9eebbab70db053014f283431",
      access_secret: "4zblfTHO0JNtvRVggdamzuvABy9TKN9FPjyz0f3w",
    };

    const acr = new acrcloud(configACR);
    const result = await acr.identify(cutBuffer);
    const { status, metadata } = result;

    if (status.code === 1001) {
      return sock.sendMessage(from, { text: "😿 Nada encontrado" }, { quoted: Info });
    } else if (status.code === 3003 || status.code === 3015) {
      return sock.sendMessage(from, { text: "⚠️ Limite API" }, { quoted: Info });
    } else if (status.code === 3000) {
      return sock.sendMessage(from, { text: "⚠️ Erro servidor" }, { quoted: Info });
    }

    const music = metadata?.music?.[0];
    if (!music) {
      return sock.sendMessage(from, { text: "❌ Não identificado" }, { quoted: Info });
    }

    const artist = music.artists?.map(a => a.name).join(", ") || "Desconhecido";
    const searchQuery = `${music.title} ${artist}`;

    // ===============================
    // 🔄 DOWNLOAD USANDO TEZINHO API
    // ===============================
    let dados = null;
    let apiUsada = null;

    const tentativas = [
      { url: `https://tedzinho.com.br/api/download/play_audio/v5?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(searchQuery)}`, nome: "Tedzinho API v5" },
      { url: `https://tedzinho.com.br/api/download/play_audio?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(searchQuery)}`, nome: "Tedzinho API v1" },
      { url: `https://tedzinho.com.br/api/download/play_audio/v3?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(searchQuery)}`, nome: "Tedzinho API v3 (Backup)" },
    ];

    for (const tentativa of tentativas) {
      try {
        const res = await axios.get(tentativa.url);
        if (res.data?.resultado?.arquivo || res.data?.resultado?.dl_link) {
          dados = res.data.resultado;
          apiUsada = tentativa.nome;
          break;
        }
      } catch {}
    }

    if (!dados) {
      return sock.sendMessage(from, { text: "❌ Não consegui encontrar a música no servidor do Tezinho." }, { quoted: Info });
    }

    // 🎨 Mensagem bonita e compacta
    const infoMessage = `✨ *Música Identificada!*

🎵 *${music.title || "N/E"}*
🎤 *${artist || "N/E"}*
⏱️ ${duration.default(music.duration_ms).format("mm:ss") || "N/E"} │ 📊 ${music.score}%

⬇️ *Baixando via ${apiUsada}...*`;

    await sock.sendMessage(from, {
      image: { url: music.album?.coverart || dados.thumbnail || "https://files.catbox.moe/427zyd.jpg" },
      caption: infoMessage
    }, { quoted: Info });

    const linkDownload = dados.arquivo || dados.dl_link;
    const audioResp = await axios.get(linkDownload, { responseType: "arraybuffer" });

    await sock.sendMessage(from, {
      audio: audioResp.data,
      mimetype: "audio/mpeg",
      fileName: `${music.title.replace(/[<>:"/\\|?*]/g, '_')}.mp3`
    }, { quoted: Info });

    await sock.sendMessage(from, { react: { text: "✅", key: Info.key } });

  } catch (err) {
    console.error("Erro Shazam2:", err);
    await sock.sendMessage(from, { text: "❌ Erro na identificação" }, { quoted: Info });
    await sock.sendMessage(from, { react: { text: "❌", key: Info.key } });
  }
};