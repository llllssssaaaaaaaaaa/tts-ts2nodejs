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
const axios_1 = require("axios");
const azure_1 = require("../service/azure");
const retry_1 = require("../retry");
module.exports = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (request.method === 'GET') {
            let listResponse = yield axios_1.default.get('https://eastus.api.speech.microsoft.com/cognitiveservices/voices/list', {
                headers: {
                    'origin': 'https://azure.microsoft.com',
                }
            });
            let data = listResponse.data;
            if (!data) {
                console.error('获取声音列表失败');
                response.status(500).json('获取声音列表失败');
                return;
            }
            response
                .status(200)
                .setHeader('Content-Type', 'application/json; charset=utf-8')
                .end(JSON.stringify(data));
        }
        else {
            console.debug(`请求正文：${request.body}`);
            let token = process.env.TOKEN;
            if (token) {
                let authorization = request.headers['authorization'];
                if (authorization != `Bearer ${token}`) {
                    console.error('无效的TOKEN');
                    response.status(401).json('无效的TOKEN');
                    return;
                }
            }
            let format = request.headers['format'] || 'audio-16khz-32kbitrate-mono-mp3';
            if (Array.isArray(format)) {
                throw `无效的音频格式：${format}`;
            }
            if (!azure_1.FORMAT_CONTENT_TYPE.has(format)) {
                throw `无效的音频格式：${format}`;
            }
            let ssml = request.body;
            if (ssml == null) {
                throw `转换参数无效`;
            }
            let result = yield (0, retry_1.retry)(() => __awaiter(void 0, void 0, void 0, function* () {
                let result = yield azure_1.service.convert(ssml, format);
                return result;
            }), 3, (index, error) => {
                console.warn(`第${index}次转换失败：${error}`);
            }, '服务器多次尝试后转换失败');
            response.sendDate = true;
            response
                .status(200)
                .setHeader('Content-Type', azure_1.FORMAT_CONTENT_TYPE.get(format));
            response.end(result);
        }
    }
    catch (error) {
        console.error(`发生错误, ${error.message}`);
        response.status(503).json(error);
    }
});
//# sourceMappingURL=azure.js.map