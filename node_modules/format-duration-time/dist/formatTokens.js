"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var decimal_1 = __importDefault(require("./lib/decimal"));
var formatTokens = {
    d: {
        type: 'day',
        func: function (milliSecond, options, isSmallest) {
            if (options === void 0) { options = {}; }
            var day = milliSecond / 86400000;
            var value = isSmallest ? decimal_1.default(day, options.decimalPlace, options.roundType)
                : Math.floor(day);
            return [value, milliSecond - Number(value) * 86400000];
        },
    },
    h: {
        type: 'hour',
        func: function (milliSecond, options, isSmallest) {
            if (options === void 0) { options = {}; }
            var hour = milliSecond / 3600000;
            var value = isSmallest ? decimal_1.default(hour, options.decimalPlace, options.roundType)
                : Math.floor(hour);
            return [value, milliSecond - Number(value) * 3600000];
        },
    },
    m: {
        type: 'minute',
        func: function (milliSecond, options, isSmallest) {
            if (options === void 0) { options = {}; }
            var minute = milliSecond / 60000;
            var value = isSmallest ? decimal_1.default(minute, options.decimalPlace, options.roundType)
                : Math.floor(minute);
            return [value, milliSecond - Number(value) * 60000];
        },
    },
    s: {
        type: 'second',
        func: function (milliSecond, options, isSmallest) {
            if (options === void 0) { options = {}; }
            var second = milliSecond / 1000;
            var value = isSmallest ? decimal_1.default(second, options.decimalPlace, options.roundType)
                : Math.floor(second);
            return [value, milliSecond - Number(value) * 1000];
        },
    },
    S: {
        type: 'millisecond',
        func: function (milliSecond, options, isSmallest) {
            if (options === void 0) { options = {}; }
            var value = isSmallest ? decimal_1.default(milliSecond, options.decimalPlace, options.roundType)
                : Math.floor(milliSecond);
            return [value, 0];
        },
    },
};
exports.default = formatTokens;
