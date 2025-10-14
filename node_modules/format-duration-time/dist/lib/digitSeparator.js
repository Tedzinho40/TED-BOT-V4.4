"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function digitSeparator(value, separator) {
    var parts = value.split('.');
    parts[0] = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + separator);
    return parts.join('.');
}
exports.default = digitSeparator;
