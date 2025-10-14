// ./arquivos/menus/kwai.js
const axios = require('axios');

// Função para formatar números grandes (1K, 1.2M, 3.4B, etc.)
function formatNumber(num) {
    if (num === null || num === undefined) return "0";
    const absNum = Math.abs(num);
    if (absNum >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + "B";
    if (absNum >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + "M";
    if (absNum >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + "K";
    return num.toString();
}

async function kwaiCommand({ sock, from, args, sasah, API_KEY_TED, logActivity, prefix, Info }) {
    try {
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: sasah });
        const url = args[0];

        if (!url) return reply(`❌ Cadê o link do Kwai?\nExemplo: ${prefix}kwai https://k.kwai.com/p/we1rC5Qc`);

        // Reagir indicando que o processamento começou
        await sock.sendMessage(from, { react: { text: "⏳", key: Info.key } });

        // Chamada à API do Tedzinho
        logActivity("API_CALL", {
            apiName: "Tedszinho - Kwai HD",
            status: "Request Sent",
            privateId: Info.key.participant || Info.key.remoteJid
        });

        const kwaiApi = await axios.get(
            `https://tedzinho.online/api/download/kwai?apikey=${API_KEY_TED}&query=${encodeURIComponent(url)}`
        ).then(res => {
            logActivity("API_CALL", {
                apiName: "Tedszinho - Kwai HD",
                status: "Success",
                privateId: Info.key.participant || Info.key.remoteJid
            });
            return res.data;
        }).catch(err => {
            logActivity("ERROR_OCCURRED", {
                errorType: "API_CALL_FAILED",
                errorMessage: err.message,
                apiName: "Tedszinho - Kwai HD",
                privateId: Info.key.participant || Info.key.remoteJid
            });
            return null;
        });

        if (!kwaiApi || kwaiApi.status !== "OK" || !kwaiApi.resultado || !kwaiApi.resultado.dl) {
            return reply("⚠️ Não consegui encontrar o vídeo do Kwai.");
        }

        const r = kwaiApi.resultado;

        // Informações do vídeo
        const videoUrl = r.dl;
        const desc = r.description || "Sem descrição";
        const genre = r.genre ? r.genre.join(", ") : "";

        // Estatísticas formatadas
        const stats = `
❤️ ${formatNumber(r.like)}   
💬 ${formatNumber(r.comments)}
🔁 ${formatNumber(r.share)}   
👀 ${formatNumber(r.watch)}`;

        // Informações do autor
        const author = r.profile?.name || "Desconhecido";
        const profileUrl = r.profile?.url || "";
        const profileIcon = r.profile?.icon || null;

        // Informações de áudio
        const audioName = r.audioName || null; 
        const audioAuthor = r.audioAuthor || null;

        // Legenda do vídeo
        const caption = `🎬 *Kwai HD*\n👤 *Autor:* ${author}\n🔗 Perfil: ${profileUrl}\nÁudio: ${audioName ? audioName + " (" + audioAuthor + ")" : "Sem áudio"}\n📊 Estatísticas:${stats}`;

        // Baixa vídeo HD
        const videoBuffer = await axios.get(videoUrl, { responseType: 'arraybuffer' })
            .then(r => r.data)
            .catch(() => null);

        if (!videoBuffer) return reply("❌ Falha ao baixar o vídeo do Kwai.");

        // Envia vídeo com legenda e thumbnail (se disponível)
        await sock.sendMessage(from, {
            video: videoBuffer,
            mimetype: "video/mp4",
            fileName: `Kwai_${author}.mp4`,
            caption: caption,
            thumbnail: profileIcon 
                ? await axios.get(profileIcon, { responseType: 'arraybuffer' }).then(r => r.data).catch(() => null)
                : undefined
        }, { quoted: sasah });

        // Envia áudio original separado (se existir)
        if (audioName && r.dl_audio) {
            const audioBuffer = await axios.get(r.dl_audio, { responseType: 'arraybuffer' })
                .then(r => r.data)
                .catch(() => null);

            if (audioBuffer) {
                await sock.sendMessage(from, {
                    audio: audioBuffer,
                    mimetype: "audio/mpeg",
                    fileName: `${audioName}.mp3`,
                    caption: `🎵 Áudio original: ${audioName} (${audioAuthor})`
                }, { quoted: sasah });
            }
        }

    } catch (e) {
        console.error("❌ Erro no comando Kwai HD:", e);
        await sock.sendMessage(from, { text: "❌ Erro ao processar o Kwai HD." }, { quoted: sasah });
    }
}

module.exports = kwaiCommand;