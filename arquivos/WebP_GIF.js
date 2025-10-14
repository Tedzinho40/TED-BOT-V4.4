const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const fs = require('fs');

// Função que converte WebP em MP4
async function WebP_GIF(filePath) {
    try {
        // Upload para Uguu
        const formUguu = new FormData();
        formUguu.append("files[]", fs.createReadStream(filePath));
        const { data: uploadData } = await axios.post("https://uguu.se/upload.php", formUguu, {
            headers: { ...formUguu.getHeaders() }
        });
        const uploadedUrl = uploadData.files[0].url;

        // Envia para Ezgif
        const form1 = new FormData();
        form1.append('new-image-url', uploadedUrl);
        form1.append('upload', 'Upload!');

        const res1 = await axios.post('https://ezgif.com/webp-to-mp4', form1, {
            headers: { ...form1.getHeaders() }
        });

        const $ = cheerio.load(res1.data);
        const file = $('form.ajax-form input[name="file"]').attr('value');
        if (!file) throw new Error("Não encontrou o arquivo no Ezgif.");

        // Form de conversão
        const form2 = new FormData();
        form2.append('file', file);
        form2.append('convert', 'Convert WebP to MP4!');

        const res2 = await axios.post(`https://ezgif.com/webp-to-mp4/${file}`, form2, {
            headers: { ...form2.getHeaders() }
        });

        const $$ = cheerio.load(res2.data);
        const resultado = 'https:' + $$('div#output > p.outfile > video > source').attr('src');
        if (!resultado) throw new Error("Erro ao obter link do MP4");

        return {
            status: "Online",
            criador: "TED-BOT © 2025",
            resultado,
            statusCode: 200
        };

    } catch (err) {
        throw new Error("Erro WebP_GIF: " + err.message);
    }
}

module.exports = WebP_GIF;