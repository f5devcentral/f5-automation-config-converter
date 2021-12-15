/**
 * Copyright 2021 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const fs = require('fs').promises;
const extract = require('./extract');

const fromConf = (confPath) => fs.readFile(confPath).then((data) => ({ [confPath]: data.toString() }));

const fromUCS = (ucsPath) => extract(ucsPath)
    .then((fileArr) => Object.assign({}, ...fileArr.filter((x) => x.type !== 'directory')
        .filter((x) => !x.path.includes('._'))
        .map((x) => ({ [x.path]: x.data.toString() }))));

function handlePathArr(pathArr) {
    return Promise.all(
        pathArr.map((path) => (path.includes('.ucs') ? fromUCS(path) : fromConf(path)))
    ).then((fileArr) => Object.assign({}, ...fileArr))
        .then((fileObj) => {
            handlePathArr.data = fileObj;
            return fileObj;
        });
}

handlePathArr.data = {};

module.exports = handlePathArr;
