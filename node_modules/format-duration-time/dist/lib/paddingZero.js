"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function paddingZero(value, length) {
    var output = value;
    while (output.length < length) {
        output = "0" + output;
    }
    return output;
}
exports.default = paddingZero;
