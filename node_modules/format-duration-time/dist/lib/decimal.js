"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getRoundFunction(roundType) {
    switch (roundType) {
        case 'ceil': {
            return Math.ceil;
        }
        case 'round': {
            return Math.round;
        }
        case 'floor':
        default: {
            return Math.floor;
        }
    }
}
function decimal(value, decimalPlace, roundType) {
    var exponent = decimalPlace ? Math.pow(10, decimalPlace) : 1;
    var roundFunc = getRoundFunction(roundType);
    var decimalValue = roundFunc(value * exponent) / exponent;
    return decimalValue.toFixed(decimalPlace > 0 ? decimalPlace : 0);
}
exports.default = decimal;
