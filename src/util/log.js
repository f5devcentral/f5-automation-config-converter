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

const winston = require('winston');
const Writable = require('stream').Writable;

const colorizer = winston.format.colorize();
let level = process.env.LOG_LEVEL || 'info';
if (process.env.NODE_ENV === 'test') level = 'warn';

// var for stream log stdout into it
let output = '';
const stream = new Writable();
stream._write = (chunk, encoding, next) => {
    output += chunk.toString();
    next();
};

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf((msg) => `${msg.timestamp} ${msg.level.toUpperCase()} ${msg.message}`)
    ),
    level,
    json: false,
    transports: [
        new winston.transports.Console({
            format: winston.format.printf(
                (msg) => `${msg.timestamp} ${colorizer.colorize(
                    msg.level,
                    msg.level.toUpperCase()
                )} ${msg.message}`
            )
        }),
        new winston.transports.Stream({ stream })
    ]
});

logger.configure = (filename) => {
    if (filename) {
        logger.add(new winston.transports.File({
            filename,
            json: false,
            maxsize: 10000000
        }));
    }
};

logger.memory = () => {
    const arr = output.trim().split('\n');
    output = '';
    return arr;
};

module.exports = logger;
