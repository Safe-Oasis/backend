/**
 * Copyright (c) 2022 LuciferMorningstarDev <contact@lucifer-morningstar.dev>
 * Copyright (c) 2022 safeoasis.xyz <contact@safeoasis.xyz>
 * Copyright (C) 2022 safeoasis.xyz team and contributors
 */

'use strict'; // https://www.w3schools.com/js/js_strict.asp

// append process.env object by some system variables ( ./.env )
require('dotenv').config();

// add global fetch extension
import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
});

// imports
const express = require('express');

const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const fileUpload = require('express-fileupload');

const fs = require('node:fs');
const path = require('node:path');

// load package.json information
const packageJSON = require('./package.json');

// get the webserver port from .env config
const port = process.env.PORT;

// default and public paths
const defaultPath = __dirname.endsWith('/') ? __dirname : __dirname + '/';
const publicPath = defaultPath + 'public/';

// create express application and init/append some data
const app = express();
app.data = { package: packageJSON };

// load database handler, initialite it, and append it to express-app
require('./modules/database').setupDatabaseHandler(app);

// setup sendmail
app.sendmail = require('sendmail')({
    logger: {
        debug: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    },
    silent: false,
    devPort: 25,
    devHost: 'localhost',
    smtpPort: 25,
    smtpHost: 'localhost',
});

// app middlewares
app.use(compression()); // compresses all request data
app.use(cookieParser()); // parses cookies and add it to the req variable ( req.cookies )
app.use(express.json()); // parses json bodys and append data to req variable ( req.body )
app.use(express.urlencoded({ extended: false })); // parses urlencoded bodys and append data to req variable ( req.body )

app.set('json spaces', 4); // set default json indention
app.set('view engine', 'ejs'); // apply ejs template loader to express

// serve favicon on each request
app.use(require('serve-favicon')(publicPath + 'favicon.ico'));

// public served directories
app.use('/public/', express.static(publicPath));
app.use('/uploads/', express.static(defaultPath + 'uploads/'));

// authentication
const auth = require('./middleware/auth');
// for security reason remove the powered by header
app.use(require('./middleware/removePoweredBy'));
// CORS Policy things
app.use(require('./middleware/cors'));
// Content security headers
app.use(require('./middleware/contentSecurityPolicy'));
// adding jwt authentication for api
app.use(auth.injectCSRF);

// Basic redirects
app.get('/github', async (_, res) => res.redirect('https://github.com/Safe-Oasis'));
app.get('/discord', async (_, res) => res.redirect('https://discord.gg/fmjVTKH9Gy'));
app.get('/join', async (_, res) => res.redirect('https://discord.gg/fmjVTKH9Gy'));
app.get('/twitter', async (_, res) => res.redirect('https://twitter.com/SafeOasis'));
app.get('/tiktok', async (_, res) => res.redirect('https://tiktok.com/@safeoasis'));
app.get('/instagram', async (_, res) => res.redirect('https://instagram.com/safeoasis.xyz'));
app.get('/tip', async (_, res) => res.redirect('https://www.buymeacoffee.com/safeoasis'));
app.get('/donate', async (_, res) => res.redirect('https://www.buymeacoffee.com/safeoasis'));
app.get('/email', async (_, res) => res.redirect('mailto:contact@safeoasis.xyz'));

// loads the robots.txt ( SEO )
app.get('/robots.txt', async (_, res) => res.sendFile('./public/robots.txt'));

// makes expres able to read uploaded files
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        limits: { fileSize: 50 * 1024 * 1024 },
        limitHandler: (req, res) => {
            return res.status(413).json({ error: true, message: 'FILE TOO BIG (max 50mb)' });
        },
    })
);

// 404 Handling
app.all('*', async (_, res) => {
    res.status(404).json({ error: true, message: 'not found' });
});

// finally create server listening to the port specified by .env config
app.listen(port, () => {
    console.log('HTTP WEBSERVER Server running on Port ' + port);
});
