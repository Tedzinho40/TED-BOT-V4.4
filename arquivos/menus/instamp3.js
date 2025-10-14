const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');

const instaMp3Command = async (sock, from, Info, args, prefix, API_KEY_TED, sasah) => {
    try {
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: sasah });
        const url = args[0];
        if (!url) return reply(`❌ Cadê o link do Instagram?\nExemplo: ${prefix}instamp3 https://www.instagram.com/reel/xxxxx/`);

        // Função para baixar buffer
        const getBuffer = async (link) => {
            try {
                const res = await axios.get(link, { responseType: 'arraybuffer' });
                return Buffer.from(res.data, "utf-8");
            } catch {
                return null;
            }
        };

        // Chama API do Tedzinho
        const instaApi = await axios.get(
            `https://tedzinho.com.br/api/download/instagram/v2?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        ).then(res => res.data)
        .catch(() => null);

        if (!instaApi || !instaApi.resultado || instaApi.resultado.length === 0) {
            return reply("⚠️ Não consegui encontrar o vídeo do Instagram.");
        }

        // Pega primeiro resultado
        const resultado = instaApi.resultado[0];
        const videoUrl = resultado.url;

        // Baixa vídeo
        const videoBuffer = await getBuffer(videoUrl);
        if (!videoBuffer) return reply("❌ Falha ao baixar o vídeo do Instagram.");

        // Cria arquivos temporários
        const timestamp = Date.now();
        const videoPath = `./temp/insta_temp_${timestamp}.mp4`;
        const audioPath = `./temp/insta_temp_${timestamp}.mp3`;

        // Certifica que a pasta ./temp existe
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

        fs.writeFileSync(videoPath, videoBuffer);

        // Converte vídeo para MP3 usando ffmpeg
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
            fileName: "Instagram_Audio.mp3",
            ptt: false
        }, { quoted: sasah });

        // Apaga arquivos temporários
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

    } catch (e) {
        console.error("❌ Erro no comando Instagram MP3:", e);
        await sock.sendMessage(from, { text: "❌ Erro ao processar áudio do Instagram." }, { quoted: sasah });
    }
};

// Exporta o comando para uso no bot
module.exports = instaMp3Command;