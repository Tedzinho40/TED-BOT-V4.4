// ./arquivos/menus/sticker.js

module.exports = async function stickerHandler(sock, from, Info, args, prefix, NomeDoBot, NickDono, getFileBuffer) {
    try {
        const fs = require('fs');
        const { exec } = require('child_process');

        const getRandom = (ext = '') => `${Math.floor(Math.random() * 1000000)}${ext}`;
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: Info });

        const pushname = Info.pushName || "Usuário";
        const sender = Info.key.participant || Info.key.remoteJid;
        const isQuotedImage = Info.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        const isQuotedVideo = Info.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        const isMedia = Info.message.imageMessage || Info.message.videoMessage;
        const isGroup = Info.key.remoteJid.endsWith("@g.us");

        const q = args.join(" ");
        const legenda = q ? q.split("/")[0] : `❒ COMANDO:\n❒ CRIADOR:\n❒ NÚMERO:\n❒ CHAT:\n❒ NOME:\n❒ DONO:\n❒ Assinado:`;
        const autor = q && q.split("/")[1] ? q.split("/")[1] :
            `❒ .sticker\n❒ ${pushname}\n❒ ${sender.split("@")[0]}\n❒ ${!isGroup ? pushname : 'Grupo'}\n❒ ${NomeDoBot}\n❒ ${NickDono}\n❒ wasure`;

        const createExif = (packName, publisher) => {
            const json = {
                "sticker-pack-name": packName,
                "sticker-pack-publisher": publisher
            };
            const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
            const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            const nomemeta = getRandom(".temp.exif");
            fs.writeFileSync(`./${nomemeta}`, exif);
            return nomemeta;
        };

        // --------- PROCESSANDO IMAGEM ----------
        if ((isMedia && Info.message.imageMessage) || isQuotedImage) {
            const encmedia = isQuotedImage ? Info.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : Info.message.imageMessage;
            const rane = getRandom('.jpg');

            const buffimg = await getFileBuffer(encmedia, 'image');
            fs.writeFileSync(rane, buffimg);

            const rano = getRandom('.webp');

            const ffmpegCmd = `ffmpeg -i ${rane} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 800:800 ${rano}`;

            exec(ffmpegCmd, (err) => {
                fs.unlinkSync(rane);
                if (err) return reply("Erro ao criar sticker!");

                const nomemeta = createExif(`👑 ⃟Criada por ${NomeDoBot}`, `🥀 Nick do dono: ${NickDono}\nFeita por: ${pushname}`);
                const webpmuxCmd = `webpmux -set exif ${nomemeta} ${rano} -o ${rano}`;

                exec(webpmuxCmd, () => {
                    sock.sendMessage(from, { sticker: fs.readFileSync(rano), isAiSticker: true }, { quoted: Info });
                    fs.unlinkSync(nomemeta);
                    fs.unlinkSync(rano);
                });
            });
        }

        // --------- PROCESSANDO VÍDEO CURTO ----------
        else if ((isMedia && Info.message.videoMessage) || isQuotedVideo) {
            const encmedia = isQuotedVideo ? Info.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage : Info.message.videoMessage;
            const videoDuration = encmedia.seconds || 0;

            if(videoDuration > 9) {
                reply(`⚠️ O vídeo é maior que 9 segundos. Ele será cortado automaticamente para sticker animado.`);
            }

            const rane = getRandom('.mp4');
            const buffvideo = await getFileBuffer(encmedia, 'video');
            fs.writeFileSync(rane, buffvideo);

            const rano = getRandom('.webp');

            const ffmpegCmd = `ffmpeg -i ${rane} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 200:200 ${rano}`;

            exec(ffmpegCmd, (err) => {
                fs.unlinkSync(rane);
                if (err) return reply("Erro ao criar sticker do vídeo!");

                const nomemeta = createExif(`👑 Criada por ${NomeDoBot}`, `🥀 Nick do dono: ${NickDono}\nFeita por: ${pushname}`);
                const webpmuxCmd = `webpmux -set exif ${nomemeta} ${rano} -o ${rano}`;

                exec(webpmuxCmd, () => {
                    sock.sendMessage(from, { sticker: fs.readFileSync(rano), isAiSticker: true }, { quoted: Info });
                    fs.unlinkSync(nomemeta);
                    fs.unlinkSync(rano);
                });
            });
        }

        // --------- CASO NÃO ENVIE NADA ----------
        else {
            reply(`Você precisa enviar uma imagem ou vídeo curto (máx. 9s) e marcar com ${prefix}s`);
        }

    } catch (e) {
        try {
            const fs = require('fs');
            if (fs.existsSync("temp.exif")) fs.unlinkSync("temp.exif");
        } catch {}
        sock.sendMessage(from, { text: "Hmm, deu erro ao criar o sticker" }, { quoted: Info });
    }
};