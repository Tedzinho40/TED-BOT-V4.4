"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var duration_1 = __importDefault(require("./duration"));
function duration(value, unit) {
    if (unit === void 0) { unit = 'S'; }
    return new duration_1.default(value, unit);
}
exports.default = duration;
