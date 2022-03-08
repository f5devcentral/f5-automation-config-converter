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

function processStats(stats, declaration, path) {
    stats.maps.applications.push(path);
    Object.keys(declaration).forEach((key) => {
        const objKey = declaration[key];
        if (typeof objKey === 'object' && objKey.class) {
            stats.maps.objects.push(`${path}/${key}`);
            stats.total += 1;

            if (stats.classes[objKey.class]) {
                stats.classes[objKey.class] += 1;
            } else {
                stats.classes[objKey.class] = 1;
            }
        }
    });
}

module.exports = (declaration, config = {}) => {
    const stats = {
        classes: {},
        maps: {
            applications: [],
            objects: [],
            tenants: []
        },
        total: 0
    };

    if (config.declarativeOnboarding) {
        processStats(stats, declaration.Common, '/Common');
    } else {
        Object.keys(declaration).forEach((key) => {
            const tenant = declaration[key];
            if (typeof tenant === 'object' && tenant.class === 'Tenant') {
                stats.maps.tenants.push(`/${key}`);

                Object.keys(tenant).forEach((tenKey) => {
                    const application = tenant[tenKey];

                    if (typeof application === 'object' && application.class === 'Application') {
                        processStats(stats, application, `/${key}/${tenKey}`);
                    }
                });
            }
        });
    }

    // alpha-sort classes array
    const newObj = {};
    Object.keys(stats.classes).sort((a, b) => a.localeCompare(b))
        .forEach((x) => {
            newObj[x] = stats.classes[x];
        });
    stats.classes = newObj;

    return stats;
};
