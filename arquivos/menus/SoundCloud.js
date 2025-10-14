const SoundCloud = require('soundcloud-scraper');
const axios = require('axios');

const client = new SoundCloud.Client();

module.exports = async function soundCloudMenu({ sock, from, args, Info, prefix, API_KEY_TED }) {
    const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: Info });

    try {
        const query = args.join(" ");
        if (!query) return reply(`❌ Cadê o nome ou link da música do SoundCloud?\nExemplo: ${prefix}sc minha música favorita`);

        if (global.executandoSoundCloud?.[from]) {
            return reply('⏳ Aguarde! Um processo já está em andamento para você.');
        }

        global.executandoSoundCloud = global.executandoSoundCloud || {};
        global.executandoSoundCloud[from] = true;

        let track, linkOriginal;

        // 🔎 Verifica se é link direto ou pesquisa
        if (query.includes("on.soundcloud.com") || query.includes("soundcloud.com")) {
            linkOriginal = query.trim();
            track = await client.getSongInfo(linkOriginal);
        } else {
            const results = await client.search(query, "track");
            if (!results.length) {
                delete global.executandoSoundCloud[from];
                return reply('❌ Nenhuma música encontrada com esse nome.');
            }
            track = await client.getSongInfo(results[0].url);
            linkOriginal = results[0].url;
        }

        if (!track || !linkOriginal) {
            delete global.executandoSoundCloud[from];
            return reply('❌ Erro ao obter informações da música.');
        }

        // 🕒 Formatar duração
        const formatDuration = (ms) => {
            if (!ms) return "Desconhecida";
            const totalSeconds = Math.floor(ms / 1000);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
        };

        // 🔢 Formatar números grandes
        const formatNumber = (num) => {
            if (num === undefined || num === null) return "Desconhecido";
            if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "bi";
            if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "mi";
            if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
            return num.toString();
        };

        // 🎵 Função principal
        const enviarMusicaSC = async () => {
            const apiUrl = `https://tedzinho.com.br/api/download/soundcloud2?apikey=${API_KEY_TED}&url=${encodeURIComponent(linkOriginal)}`;
            const { data } = await axios.get(apiUrl);

            if (!data || data.status !== "OK" || !data.resultado?.arquivo) {
                delete global.executandoSoundCloud[from];
                return reply("❌ Não consegui baixar o áudio.");
            }

            const sc = data.resultado;

            const title = sc.title || track.title || "Sem título";
            const author = sc.author || track.author?.name || "Desconhecido";
            const duration = sc.duration || formatDuration(track.duration || 0);
            const thumbnail = track.thumbnail || sc.thumbnail || "https://i.imgur.com/OQZy6il.png";
            const plays = formatNumber(track.playCount || 0);
            const likes = formatNumber(track.likes || 0);
            const reposts = formatNumber(track.reposts || 0);
            const published = track.publishedAt || "Desconhecido";
            const description = track.description?.slice(0, 300) || "Sem descrição disponível.";
            const link = sc.original_url || linkOriginal;

            // 🖼️ Envia imagem com legenda estilizada
            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎶 *${title}*  
👤 *Autor:* ${author}  
⏱️ *Duração:* ${duration}  
▶️ *Plays:* ${plays}  
❤️ *Likes:* ${likes}  
🔁 *Reposts:* ${reposts}  
🗓️ *Publicado:* ${published}  
🔗 *Link original:* ${link}

━━━━━━━━━━━━━━━━━━━  
✨ *Powered by Tedzinho API*`,
                headerType: 4
            }, { quoted: Info });

            // 🔊 Baixar e enviar áudio final
            const audioBuffer = await axios.get(sc.arquivo, { responseType: 'arraybuffer' })
                .then(r => r.data)
                .catch(() => null);

            if (!audioBuffer) {
                delete global.executandoSoundCloud[from];
                return reply("❌ Falha ao baixar o áudio.");
            }

            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: Info });
        };

        await enviarMusicaSC();
        delete global.executandoSoundCloud[from];

    } catch (err) {
        console.error("❌ Erro no SoundCloud:", err);
        await sock.sendMessage(from, { text: "❌ Erro ao processar sua música." }, { quoted: Info });
        delete global.executandoSoundCloud[from];
    }
};