/**
 * Copyright 2022 F5 Networks, Inc.
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

/* eslint-disable no-unused-vars */

const express = require('express');
const multer = require('multer');

const extract = require('./preConverter/extract');
const log = require('./util/log');
const main = require('./main').main;

const app = express();
const port = process.env.PORT || 8080;

const limits = { fileSize: '1GB' };
const storage = multer.memoryStorage();
const upload = multer({ limits, storage });

app.use(express.static('src/static'));

app.post('/converter', upload.any(), (req, res, next) => {
    const checkBool = (str) => str === 'true';
    const fields = req.body;

    // fix config inputs
    const config = {
        logFile: fields.log,
        output: fields.output,
        controls: checkBool(fields.controls),
        declarativeOnboarding: checkBool(fields.declarativeOnboarding),
        disableAnalytics: checkBool(fields.disableAnalytics),
        next: checkBool(fields.next),
        nextNotConverted: checkBool(fields.nextNotConverted),
        safeMode: checkBool(fields.safeMode),
        server: true,
        vsName: fields.vsName,
        applicationTarget: fields.applicationTarget,
        tenantTarget: fields.tenantTarget,
        container: checkBool(process.env.DOCKER_CONTAINER),
        showExtended: checkBool(fields.showExtended)
    };

    return Promise.resolve()
        // Extract configs from UCS and .conf/scf files
        .then(async () => Object.assign({}, ...await Promise.all(
            req.files.map((file) => {
                const filename = file.originalname;
                if (file.fieldname === 'ucs') {
                    return extract(file.buffer)
                        .then((fileArr) => Object.assign(...fileArr
                            .filter((x) => x.type !== 'directory')
                            .filter((x) => !x.path.includes('._'))
                            .map((x) => ({ [x.path]: x.data.toString() }))));
                }
                return { [filename]: file.buffer.toString() };
            })
        )))

        // Process (parse and convert) input files
        .then((files) => main(files, config))

        // Build response object
        .then((results) => {
            if (checkBool(fields.verbose)) {
                return res.status(201).json({
                    config,
                    logs: results.metadata.logs,
                    output: results.declaration,
                    as3Recognized: results.metadata.as3Recognized,
                    as3Converted: results.metadata.as3Converted,
                    as3NotConverted: results.metadata.as3NotConverted,
                    as3NextNotConverted: results.metadata.as3NextNotConverted,
                    keyNextConverted: results.metadata.keyNextConverted
                });
            }
            return res.status(201).json(results.declaration);
        })
        .catch((err) => next(err));
});

app.use((err, req, res, next) => {
    log.error(err);
    return res.status(400).json({ message: err });
});

module.exports = () => app.listen(port, () => {
    log.info(`Server listening on http://localhost:${port}`);
});
