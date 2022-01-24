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

const unquote = require('../../../util/convert/unquote');

// APM complicates conversion in few ways.
//
// 1. There are seven html rule types.  Rather than having a ruleType
//    attribute as is implemented in AS3, ruleType is included in the object
//    path.  This means that rather than having one handler for all html
//    rules, we need a separate handler for each of the seven html rule types.
//
// 2. Along with that there are two nested objects ('action' and 'match') for
//    a subset of the html rules.  During conversion, handlers are called as
//    shown below.
//
//       'ltm html-rule tag-remove-attribute'
//       'ltm html-rule tag-remove-attribute action'
//       'ltm html-rule tag-remove-attribute match'
//
//    Breaking conversion up into all of these handlers distributes the
//    the conversion which can be confusing.
//
// 3. Unfortunately, the attribute 'attributeName' is used in the HTML_Rule
//    and within the match object.  So, combined with default flattening
//    behavior of conversion, the order of how handlers get called can cause
//    the loss of one of the 'attributeName' attributes.
//
// The solution to the issues above is to do all processing in the parent
// handler (e.g. 'ltm html-rule tag-remove-attribute').  The customHandling
// file arg can be used to handle the 'attributeName' attribute.

// Convert the nested 'match' object
const mapMatchObj = (rootObj) => {
    const match = {};
    if (rootObj.tagName) {
        match.tagName = unquote(rootObj.tagName);
        delete rootObj.tagName;
    }

    if (rootObj.attributeName) {
        match.attributeName = unquote(rootObj.attributeName);
        delete rootObj.attributeName;
    }

    if (rootObj.attributeValue) {
        match.attributeValue = unquote(rootObj.attributeValue);
        delete rootObj.attributeValue;
    }

    return match;
};

module.exports = {

    // HTML_Rule comment-raise-event
    'ltm html-rule comment-raise-event': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.ruleType = 'comment-raise-event';

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTML_Rule comment-remove
    'ltm html-rule comment-remove': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.ruleType = 'comment-remove';

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTML_Rule tag-append-html
    'ltm html-rule tag-append-html': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.ruleType = 'tag-append-html';

            // Convert 'match' object
            rootObj.match = mapMatchObj(rootObj);

            // Convert 'action' object
            if (rootObj.text) {
                rootObj.content = unquote(rootObj.text);
                delete rootObj.text;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTML_Rule tag-prepend-html
    'ltm html-rule tag-prepend-html': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.ruleType = 'tag-prepend-html';

            // Convert 'match' object
            rootObj.match = mapMatchObj(rootObj);

            // Convert 'action' object
            if (rootObj.text) {
                rootObj.content = unquote(rootObj.text);
                delete rootObj.text;
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTML_Rule tag-raise-event
    'ltm html-rule tag-raise-event': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.ruleType = 'tag-raise-event';

            // Convert 'match' object
            rootObj.match = mapMatchObj(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTML_Rule tag-remove
    'ltm html-rule tag-remove': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc) => {
            const newObj = {};

            rootObj.ruleType = 'tag-remove';

            // Convert 'match' object
            rootObj.match = mapMatchObj(rootObj);

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    },

    // HTML_Rule tag-remove-attribute
    'ltm html-rule tag-remove-attribute': {
        class: 'HTML_Rule',

        customHandling: (rootObj, loc, file) => {
            const newObj = {};

            rootObj.ruleType = 'tag-remove-attribute';

            // Convert 'match' object
            rootObj.match = mapMatchObj(rootObj);

            // Convert 'action' object
            //
            // Note: file is used here due to attributeName overloading
            //       in HTML_Rule and HTML_Rule.match.
            if (file[loc.original].action['attribute-name']) {
                rootObj.attributeName = unquote(file[loc.original].action['attribute-name']);
            }

            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
