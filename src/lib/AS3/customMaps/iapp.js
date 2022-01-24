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

module.exports = {

    // Service Discovery iApps
    'sys application service': {

        // class: 'Service_Discovery_Azure',
        class: 'Pool',

        keyValueRemaps: {
            remark: (key, val) => ({ remark: unquote(val) })
        },

        customHandling: (rootObj, loc) => {
            // Support only service discovery iapp
            if (rootObj.template !== '/Common/f5.service_discovery') return {};

            const newObj = {};
            const members = [];
            const member = {};
            const tags = rootObj.variables;

            // tagKey
            if (tags.pool__tag_key) {
                member.tagKey = tags.pool__tag_key.value;
            }

            // tagValue
            if (tags.pool__tag_value) {
                member.tagValue = tags.pool__tag_value.value;
            }

            // updateInterval
            if (tags.pool__interval) {
                member.updateInterval = parseInt(tags.pool__interval.value, 10);
            }

            // addressRealm
            if (tags.pool__public_private) {
                member.addressRealm = tags.pool__public_private.value;
            }

            // servicePort is required
            if (tags.pool__member_port) {
                member.servicePort = parseInt(tags.pool__member_port.value, 10);
            } else {
                member.servicePort = 80;
            }

            // addressDiscovery
            if (tags.cloud__cloud_provider) {
                member.addressDiscovery = tags.cloud__cloud_provider.value;

                // credentialUpdate
                member.credentialUpdate = false;

                // Azure case
                if (tags.cloud__cloud_provider.value === 'azure') {
                    // resourceGroup is required
                    if (tags.cloud__azure_resource_group) {
                        member.resourceGroup = tags.cloud__azure_resource_group.value;
                    } else {
                        member.resourceGroup = '-';
                    }

                    //  cloud__azure_subscription_id is required
                    if (tags.cloud__azure_subscription_id) {
                        member.subscriptionId = tags.cloud__azure_subscription_id.value;
                    } else {
                        member.subscriptionId = '-';
                    }

                    // directoryId is required
                    if (tags.cloud__azure_tenant_id) {
                        member.directoryId = tags.cloud__azure_tenant_id.value;
                    } else {
                        member.directoryId = '-';
                    }

                    // cloud__azure_client_id is required
                    if (tags.cloud__azure_client_id) {
                        member.applicationId = tags.cloud__azure_client_id.value;
                    } else {
                        member.applicationId = '-';
                    }

                    // apiAccessKey is required
                    if (tags.cloud__azure_sp_secret) {
                        member.apiAccessKey = Buffer.from(tags.cloud__azure_sp_secret.value).toString('base64');
                    } else {
                        member.apiAccessKey = '-';
                    }

                // AWS case
                } else if (tags.cloud__cloud_provider.value === 'aws') {
                    // region
                    if (tags.cloud__aws_region) {
                        member.region = tags.cloud__aws_region.value;
                    }

                    // accessKeyId is required together with secretAccessKey
                    if (tags.cloud__aws_access_key_id && tags.cloud__aws_secret_access_key) {
                        member.accessKeyId = tags.cloud__aws_access_key_id.value;
                        member.secretAccessKey = Buffer.from(tags.cloud__aws_secret_access_key.value).toString('base64');
                    }

                    // roleARN is required together with externalId
                    if (tags.cloud__aws_role_arn && tags.cloud__aws_external_id) {
                        member.roleARN = tags.cloud__aws_role_arn.value;
                        member.externalId = tags.cloud__aws_external_id.value;
                    }

                // GCE case
                } else if (tags.cloud__cloud_provider.value === 'gce') {
                    // encodedCredentials
                    if (tags.cloud__gce_credentials_json_base64) {
                        member.encodedCredentials = Buffer.from(tags.cloud__gce_credentials_json_base64.value).toString('base64');
                    }

                    // region
                    if (tags.cloud__gce_region) {
                        member.region = tags.cloud__gce_region.value;
                    }
                }
            }

            members.push(member);
            rootObj.members = members;

            delete rootObj.variables;
            delete rootObj.template;
            newObj[loc.profile] = rootObj;
            return newObj;
        }
    }
};
