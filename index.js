const axios = require('axios');
const express = require('express');
const moment = require('moment');
const morgan = require('morgan');
const sharp = require('sharp');
const app = express();
app.use(morgan('tiny'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const decodeQueryParam = (param) => param ? decodeURIComponent(param) : '';

const transformData = (req) => ({
    msg_embed: decodeQueryParam(req.query.msg),
    usr_embed: decodeQueryParam(req.query.usr),
    src_embed: `in ${decodeQueryParam(req.query.gld)} %23${decodeQueryParam(req.query.chn)} - ${moment(parseInt(req.query.tme)).format("MMMM Do YYYY")}`,
    lnk_embed: `https://discordapp.com/channels/${decodeQueryParam(req.query.lnk)}`,
    ava_embed: `https://cdn.discordapp.com/avatars/${decodeQueryParam(req.query.ava)}.webp?size=160`,
    col_embed: req.query.col
});

app.get('/', (req, res) => {
    res.render('index.ejs', transformData(req));
});

app.get('/oembed.json', (req, res) => {
    res.json({
        author_url: " ",
        author_name: req.query.usr_json,  // usr_embed
        provider_url: req.query.lnk_json, // lnk_embed
        provider_name: req.query.src_json // src_embed
    });
});

app.get('/round_pfp', async (req, res) => {
    const avaUrl = decodeQueryParam(req.query.ava_embed);
    const roundedCorners = Buffer.from('<svg><rect x="0" y="0" width="200" height="200" rx="200" ry="200"/></svg>');
    
    try {
        const input = await axios({ url: avaUrl.replace(".gif", ".webp"), responseType: "arraybuffer" });
        const image = await sharp(Buffer.from(input.data, 'binary'))
            .raw()
            .resize(200, 200)
            .extend({bottom: 200, left: 200, background: {r:0, g:0, b:0, alpha:0}})
            .composite([{input: roundedCorners, gravity: 'northeast', blend: 'dest-in'}])
            .png()
            .toBuffer();
        res.type('png').send(image);
    } catch (error) {
        "osef";
    }
});

app.listen(80, () => console.log('CitadorV3 is running on port 80'));
