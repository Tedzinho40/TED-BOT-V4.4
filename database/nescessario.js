const fs = require('fs');
const path = require('path');

const nescessarioPath = path.join(__dirname, 'nescessario.json');

function carregarNescessario() {
    if (!fs.existsSync(nescessarioPath)) {
        fs.writeFileSync(nescessarioPath, JSON.stringify({ verificado: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(nescessarioPath, 'utf-8'));
}

let nescessario = carregarNescessario();

function getNes() {
    return nescessario;
}

function setNes(data) {
    nescessario = data;
    fs.writeFileSync(nescessarioPath, JSON.stringify(nescessario, null, 2));
}

module.exports = { getNes, setNes };
