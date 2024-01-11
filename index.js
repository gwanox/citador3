var axios = require('axios');
var express = require('express');
var moment = require('moment');
var morgan = require('morgan');
var server = express();
var sharp = require('sharp');

server.use(morgan('tiny'));
server.set('view engine', 'ejs');
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

function decodeQueryParam(param) {
    return param ? decodeURIComponent(param) : '';
}

function transformData(req) {
    return {
        msg_embed: decodeQueryParam(req.query.msg),
        usr_embed: decodeQueryParam(req.query.usr),
        src_embed: `in ${decodeQueryParam(req.query.gld)} (#${decodeQueryParam(req.query.chn)}) - ${moment(parseInt(req.query.tme)).format("MMMM Do YYYY")}`,
        lnk_embed: `https://discordapp.com/channels/${decodeQueryParam(req.query.lnk)}`,
        ava_embed: `https://cdn.discordapp.com/avatars/${decodeQueryParam(req.query.ava)}.webp?size=160`,
        col_embed: req.query.col
    };
}

function generateJsonData(transformedData) {
    return {
        author_url: decodeQueryParam(transformedData.author_url).replace(/ /g, ""),
        author_name: transformedData.usr_embed,
        provider_url: transformedData.lnk_embed.replace(/ /g, ""),
        provider_name: transformedData.src_embed
    };
}

server.get('/', function (req, res) {
    let transformedData = transformData(req);
    let jsonData = generateJsonData(transformedData);
    res.render('index.ejs', { ...transformedData, jsonData });
});

server.get('/oembed.json', function (req, res) {
    let transformedData = transformData(req);
    let jsonData = generateJsonData(transformedData);
    res.json(jsonData);
});

server.get('/round_pfp', async function (req, res) {
    const avaUrl = decodeQueryParam(req.query.ava_embed);
    if (!avaUrl) {
        return res.sendStatus(404);
    }
    const roundedCorners = Buffer.from('<svg><rect x="0" y="0" width="200" height="200" rx="200" ry="200"/></svg>');
    try {
        const input = await axios({ url: avaUrl.replace(".gif", ".webp"), responseType: "arraybuffer" });
        const image = await sharp(Buffer.from(input.data, 'binary'))
            .resize(200, 200)
            .composite([{ input: roundedCorners, blend: 'dest-in' }])
            .png()
            .toBuffer();
        res.type('png').send(image);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

server.listen(80);