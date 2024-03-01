"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const retry_1 = require("../retry");
const edge_1 = require("../service/edge");
module.exports = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    console.debug(`请求正文：${request.body}`);
    let name = (_a = request.query['name']) !== null && _a !== void 0 ? _a : 'zh-CN-XiaoxiaoNeural';
    let text = (_b = request.query["text"]) !== null && _b !== void 0 ? _b : "";
    let speed = (_c = request.query["speed"]) !== null && _c !== void 0 ? _c : "0.00";
    let token = process.env.TOKEN;
    if (token) {
        let authorization = request.headers['authorization'];
        if (authorization != `Bearer ${token}`) {
            console.error('无效的TOKEN');
            response.status(401).json('无效的TOKEN');
            return;
        }
    }
    try {
        let format = request.headers['format'] || 'audio-24khz-48kbitrate-mono-mp3';
        if (Array.isArray(format)) {
            throw `无效的音频格式：${format}`;
        }
        if (!edge_1.FORMAT_CONTENT_TYPE.has(format)) {
            throw `无效的音频格式：${format}`;
        }
        let ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="zh-CN">` +
            `<voice name="${name}">` +
            `<prosody rate="${speed}%">` +
            text +
            `</prosody>` +
            `</voice>` +
            `</speak>`;
        let result = yield (0, retry_1.retry)(() => __awaiter(void 0, void 0, void 0, function* () {
            let result = yield edge_1.service.convert(ssml, format);
            return result;
        }), 3, (index, error) => {
            console.warn(`第${index}次转换失败：${error}`);
        }, '服务器多次尝试后转换失败');
        response.sendDate = true;
        response
            .status(200)
            .setHeader('Content-Type', edge_1.FORMAT_CONTENT_TYPE.get(format));
        response.end(result);
    }
    catch (error) {
        console.error(`发生错误, ${error.message}`);
        response.status(503).json(error);
    }
});
//# sourceMappingURL=aiyue.js.map