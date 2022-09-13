/**
 * Copyright (c) 2022 LuciferMorningstarDev <contact@lucifer-morningstar.dev>
 * Copyright (c) 2022 safeoasis.xyz <contact@safeoasis.xyz>
 * Copyright (C) 2022 safeoasis.xyz team and contributors
 */

'use strict'; // https://www.w3schools.com/js/js_strict.asp

module.exports = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
};
