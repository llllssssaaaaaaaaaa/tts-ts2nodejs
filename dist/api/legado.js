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
const edge_1 = require("../service/edge");
module.exports = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    let api = request.query['api'];
    let name = (_a = request.query['name']) !== null && _a !== void 0 ? _a : '大声朗读';
    let voiceName = (_b = request.query['voiceName']) !== null && _b !== void 0 ? _b : 'zh-CN-XiaoxiaoNeural';
    let styleName = request.query['styleName'];
    let styleDegree = request.query['styleDegree'];
    let voiceFormat = (_c = request.query['voiceFormat']) !== null && _c !== void 0 ? _c : 'audio-16khz-32kbitrate-mono-mp3';
    let lexicon = (_d = request.query['lexicon']) !== null && _d !== void 0 ? _d : '';
    let token = (_e = request.query['token']) !== null && _e !== void 0 ? _e : '';
    if (Array.isArray(voiceFormat)) {
        throw `Invalid format ${voiceFormat}`;
    }
    if (!edge_1.FORMAT_CONTENT_TYPE.has(voiceFormat)) {
        throw `Invalid format ${voiceFormat}`;
    }
    const data = {};
    data['name'] = name == '' ? 'TTS' : name;
    data['contentType'] = edge_1.FORMAT_CONTENT_TYPE.get(voiceFormat);
    data['id'] = Date.now();
    data['loginCheckJs'] = '';
    data['loginUi'] = '';
    data['loginUrl'] = '';
    let header = {
        'Content-Type': 'text/plain',
        Authorization: 'Bearer ' + token,
        Format: voiceFormat,
    };
    data['header'] = JSON.stringify(header);
    let ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">` +
        `<voice name="${voiceName}">` +
        (lexicon === '' ? '' : `<lexicon uri="${lexicon}"/>`) +
        (styleName
            ? `<mstts:express-as style="${styleName}" styledegree="${styleDegree}">`
            : ``) +
        `<prosody rate="{{(speakSpeed - 10) * 2}}%" pitch="+0Hz">` +
        `{{String(speakText).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}}` +
        `</prosody>` +
        (styleName ? ` </mstts:express-as>` : ``) +
        `</voice>` +
        `</speak>`;
    let body = {
        method: 'POST',
        body: ssml,
    };
    data['url'] = api + ',' + JSON.stringify(body);
    response.status(200).json(data);
});
//# sourceMappingURL=legado.js.map