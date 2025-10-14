const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

const pinterestMp3Command = async (sock, from, Info, args, prefix, API_KEY_TED, sasah) => {
    try {
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: sasah });
        const url = args[0];
        if (!url) return reply(`❌ Cadê o link do Pinterest?\nExemplo: ${prefix}pinmp3 https://pin.it/xxxxx`);

        const getBuffer = async (link) => {
            try {
                const res = await axios.get(link, { responseType: 'arraybuffer' });
                return Buffer.from(res.data, "utf-8");
            } catch {
                return null;
            }
        };

        // Chama API Tedzinho - Pinterest
        const pinApi = await axios.get(
            `https://tedzinho.com.br/api/download/pinterest-download?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        ).then(res => res.data)
        .catch(() => null);

        if (!pinApi || !pinApi.resultado || !pinApi.resultado.dl_link) {
            return reply("⚠️ Não consegui encontrar o vídeo do Pinterest.");
        }

        const resultado = pinApi.resultado;
        const videoUrl = resultado.dl_link;
        const title = resultado.title || "Sem título";

        // Baixa vídeo
        const videoBuffer = await getBuffer(videoUrl);
        if (!videoBuffer) return reply("❌ Falha ao baixar o vídeo do Pinterest.");

        // Cria pasta temp se não existir
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

        // Arquivos temporários
        const timestamp = Date.now();
        const videoPath = `./temp/pinterest_${timestamp}.mp4`;
        const audioPath = `./temp/pinterest_${timestamp}.mp3`;

        fs.writeFileSync(videoPath, videoBuffer);

        // Converte vídeo em MP3 com ffmpeg
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -y -i "${videoPath}" -q:a 0 -map a "${audioPath}"`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Lê áudio convertido
        const audioBuffer = fs.readFileSync(audioPath);

        // Envia áudio
        await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`,
            ptt: false
        }, { quoted: sasah });

        // Apaga arquivos temporários
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    } catch (e) {
        console.error("❌ Erro no comando Pinterest MP3:", e);
        await sock.sendMessage(from, { text: "❌ Erro ao processar áudio do Pinterest." }, { quoted: sasah });
    }
};

// Exporta o comando
module.exports = pinterestMp3Command;