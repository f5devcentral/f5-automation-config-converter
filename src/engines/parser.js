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

const arrToMultilineStr = require('../util/parse/arrToMultilineStr');
const countIndent = require('../util/parse/countIndent');
const getTitle = require('../util/parse/getTitle');
const objToArr = require('../util/parse/objToArr');
const log = require('../util/log');
const removeIndent = require('../util/parse/removeIndent');
const strToObj = require('../util/parse/strToObj');

// pass arr of individual bigip-obj
// recognize && handle edge cases
function orchestrate(arr) {
    const key = getTitle(arr[0]);

    // remove opening and closing brackets
    arr.pop();
    arr.shift();

    let obj = {};

    // edge case: iRules (multiline string)
    if (key.includes('ltm rule') || key.includes('gtm rule')) {
        obj = arr.join('\n');

    // edge case: monitor min X of {...}
    } else if (key.includes('monitor min')) {
        arr = arr.map((s) => s.trim());
        obj = arr.join(' ').split(' ');

    // edge case: skip cli script
    } else if (!key.includes('cli script')) {
        for (let i = 0; i < arr.length; i += 1) {
            // edge case: nested object
            // RECURSIVE FUNCTION
            // quoted bracket "{" won't trigger recursion
            if (arr[i].endsWith('{')) {
                let c = 0;
                while (arr[i + c] !== '    }') {
                    c += 1;
                }
                const subObjArr = removeIndent(arr.slice(i, i + c + 1));

                // Coerce unnamed objects into array
                let arrIdx = 0;
                const coerceArr = subObjArr.map((line) => {
                    if (line === '    {') {
                        line = line.replace('{', `${arrIdx} {`);
                        arrIdx += 1;
                    }
                    return line;
                });

                // Recursion for subObjects
                Object.assign(obj, orchestrate(coerceArr));

                // skip over nested block
                i += c;

            // edge case: empty object
            } else if (arr[i].split(' ').join('').endsWith('{}')) {
                obj[arr[i].split('{')[0].trim()] = {};

            // edge case: pseudo-array pattern (coerce to array)
            } else if (arr[i].includes('{') && arr[i].includes('}') && !arr[i].includes('"')) {
                obj[arr[i].split('{')[0].trim()] = objToArr(arr[i]);

            // edge case: single-string property
            } else if ((!arr[i].trim().includes(' ') || arr[i].trim().match(/^"[\s\S]*"$/)) && !arr[i].includes('}')) {
                obj[arr[i].trim()] = '';

            // regular string property
            // ensure string props on same indentation level
            } else if (countIndent(arr[i]) === 4) {
                // edge case: multiline string
                const count = (arr[i].match(/"/g) || []).length;
                if (count % 2 === 1) {
                    let c = 1;

                    // keep count of '"'?
                    while (arr[i + c] && (arr[i + c].match(/"/g) || []).length % 2 !== 1) {
                        c += 1;
                    }

                    const chunk = arr.slice(i, i + c + 1);
                    const subObjArr = arrToMultilineStr(chunk);
                    obj = Object.assign(obj, subObjArr);
                    i += c;

                // treat as typical string
                } else {
                    arr[i] = arr[i].trim();
                    obj = Object.assign(obj, strToObj(arr[i]));
                }

            // else report exception
            } else {
                log.warn('UNRECOGNIZED LINE:', arr[i], '\n');
            }
        }
    }

    return { [key]: obj };
}

/* THIS FUNCTION SHOULD ONLY GROUP ROOT-LEVEL CONFIG OBJECTS */

function groupObjects(arr) {
    const group = [];
    for (let i = 0; i < arr.length; i += 1) {
        const currentLine = arr[i];

        // empty obj / pseudo-array
        // change to use first/last char pattern (not nested empty obj)
        // skip nested objects for now..
        if (currentLine.includes('{') && currentLine.includes('}') && currentLine[0] !== ' ') {
            group.push([currentLine]);
        } else if (currentLine.trim().endsWith('{') && !currentLine.startsWith(' ')) {
            // looking for non-indented '{'
            let c = 0;

            // different grouping logic for iRules
            let bracketCount = 1;
            while (bracketCount !== 0) {
                c += 1;

                // count { and }. They should occur in pairs
                const line = arr[i + c];
                let subcount = 0;
                line.split('').forEach((char) => {
                    // count brackets if functional (not stringified)
                    // closing root-level obj
                    const split = line.split('{');
                    const quoted = split.length > 1 && split[0].includes('"') && split[1].includes('"');
                    if (char === '{' && !quoted) subcount += 1;
                    if (char === '}' && !quoted) subcount -= 1;
                });

                // abort if run into next rule
                if (line.includes('ltm rule')) {
                    c -= 1;
                    bracketCount = 0;
                }
                bracketCount += subcount;
            }
            group.push(arr.slice(i, i + c + 1));
            i += c;
        }
    }
    return group;
}

// count specific char in string
function countChar(str, char) {
    return str.split(char).length - 1;
}

module.exports = (files) => {
    try {
        let data = {};

        Object.keys(files).forEach((key) => {
            // do not parse certs, keys or license
            if (key.includes('Common_d')
                || key.includes('bigip_script.conf')
                || key.includes('.license')) return;

            log.debug(`Parsing ${key}`);

            const fileStr = files[key].replace(/\r\n/g, '\n');
            let fileArr = fileStr.split('\n');

            // gtm topology
            const newFileArr = [];
            const topologyArr = [];
            let topologyCount = 0;
            let longestMatchEnabled = false;
            let inTopology = false;
            let irule = 0;
            fileArr.forEach((line) => {
                // Process comments in iRules:
                if (irule === 0) {
                    if (line.trim().startsWith('# ')) {
                        // mark comments outside of irules with specific prefix
                        line = line.trim().replace('# ', '#comment# ');
                    } else if (line.includes('ltm rule')) irule += 1;
                } else {
                    irule = irule + countChar(line, '{') - countChar(line, '}');
                }

                let ldns = '';
                let server = '';
                if (line.includes('topology-longest-match') && line.includes('yes')) {
                    longestMatchEnabled = true;
                }
                if (line.startsWith('gtm topology ldns:')) {
                    inTopology = true;
                    if (topologyArr.length === 0) {
                        topologyArr.push('gtm topology /Common/Shared/topology {');
                        topologyArr.push('    records {');
                    }
                    const ldnsIndex = line.indexOf('ldns:');
                    const serverIndex = line.indexOf('server:');
                    const bracketIndex = line.indexOf('{');
                    ldns = line.slice(ldnsIndex + 5, serverIndex).trim();
                    topologyArr.push(`        topology_${topologyCount} {`);
                    topologyCount += 1;
                    topologyArr.push(`            source ${ldns}`);
                    server = line.slice(serverIndex + 7, bracketIndex).trim();
                    topologyArr.push(`            destination ${server}`);
                } else if (inTopology) {
                    if (line === '}') {
                        inTopology = false;
                        topologyArr.push('        }');
                    } else {
                        topologyArr.push(`        ${line}`);
                    }
                } else {
                    newFileArr.push(line);
                }
            });
            if (topologyArr.length) {
                topologyArr.push(`        longest-match-enabled ${longestMatchEnabled}`);
                topologyArr.push('    }');
                topologyArr.push('}');
            }
            fileArr = newFileArr.concat(topologyArr);

            // filter whitespace && found comments
            fileArr = fileArr.filter((line) => !(line === '' || line.trim().startsWith('#comment# ')));

            const groupArr = groupObjects(fileArr).map((obj) => orchestrate(obj));
            data = Object.assign(data, ...groupArr);
        });

        return data;
    } catch (e) {
        e.message = `Error parsing input file. Please open an issue at https://github.com/f5devcentral/f5-automation-config-converter/issues and include the following error:\n${e.message}`;
        throw e;
    }
};
