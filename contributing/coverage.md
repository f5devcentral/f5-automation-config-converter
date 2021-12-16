# Parser Coverage Table
The parser is expected to recognize the following cases:

### Empty Objects:

tmsh:
```
wom endpoint-discovery { }
```

JavaScript:
```js
'wom endpoint-discovery': {}
```



### Objects:

tmsh:
```
apm oauth db-instance /Common/oauthdb {
    description "Default OAuth DB."
}
```

JavaScript:
```js
'apm oauth db-instance /Common/oauthdb': {
    description: "Default OAuthDB."
}
```
NOTE: The presense of `"` in a line will change the logic used to determine the object key and value.



### Nested Objects (recursive):

tmsh:
```
cm device-group /Common/device_trust_group {
    devices {
        /Common/example { }
    }
}
```

JavaScript:
```js
'cm device-group /Common/debvice_trust_group': {
    devices: {
        '/Common/example': {}
    }
}
```



### Pseudo-Array (coerced to array):

tmsh:
```
sys ecm cloud-provider /Common/aws-ec2 {
    property-template {
        availability-zone {
            valid-values { a b c d }
        }
    }
}
```

JavaScript:
```js
'sys ecm cloud-provider /Common/aws-ec2': {
    'property-template': {
        'availability-zone': {
            'valid-values': [
                'a',
                'b',
                'c',
                'd'
            ]
        }
    }
}
```



### Pseudo-Array (coerced to object):

tmsh:
```
ltm data-group internal /Common/____appsvcs_declaration-1546447299568 {
    records {
        0 {
            data "date^2019-01-02T16:41:39.568Z|id^123abc|tenants^Sample_01,Sample_02|blocks^1"
        }
        1 {
            data someothertextgoeshere
        }
    }
}
```

JavaScript:
```js
'ltm data-group internal /Common/____appsvcs_declaration-1546447299568': {
    records: {
        0: {
            data: '"date^2019-01-02T16:41:39.568Z|id^123abc|tenants^Sample_01,Sample_02|blocks^1"'
        },
        1: {
            data: 'someothertextgoeshere'
        }
    }
}
```



### Single-string properties (parsed to equal ''):

tmsh:
```
sys management-ovsdb {
    bfd-disabled
    disabled
}
```

JavaScript:
```js
'sys management-ovsdb': {
    'bfd-disabled': '',
    'disabled': ''
}
```



### Regular-string properties:

tmsh:
```
apm oauth db-instance /Common/oauthdb {
    description "Default OAuth DB."
}
```

JavaScript:
```js
'apm oauth db-instance /Common/oauthdb': {
    description: '"Default OAuth DB."'
}
```



### iRules:

tmsh:
```
ltm rule /Sample_04/A1/Maintenance_iRule {
when HTTP_REQUEST {
   HTTP::respond 200 content {
      <html>
         <head>
            <title>Blocked Page</title>
         </head>
         <body>
            We are sorry, but the site you are looking for is currently under Maintenance<br>
            If you feel you have reached this page in error, please try again. Thanks for coming
         </body>
      </html>
   } noserver Cache-Control no-cache Connection Close
}
}
```

JavaScript:
```js
'ltm rule /Sample_04/A1/Maintenance_iRule':
`when HTTP_REQUEST {
   HTTP::respond 200 content {
      <html>
         <head>
            <title>Blocked Page</title>
         </head>
         <body>
            We are sorry, but the site you are looking for is currently under Maintenance<br>
            If you feel you have reached this page in error, please try again. Thanks for coming
         </body>
      </html>
   } noserver Cache-Control no-cache Connection Close
}`
```



### Multiple 'when' clause iRules:

tmsh:
```
ltm rule /Common/example1 {
when HTTP_REQUEST priority 1 {
   if {[POLICY::targets http-reply] } {
      TCP::close
      event disable all
      return
   }
}
when HTTPS_REQUEST priority 2 {
   if {[POLICY::targets https-reply] } {
      TCP::close
      event disable all
      return
   }
}
when HTTP_RESPONSE {
   HTTP::header remove Server
}
}
```

JavaScript:
```js
'ltm rule /Common/example1':

`when HTTP_REQUEST priority 1 {
   if {[POLICY::targets http-reply] } {
      TCP::close
      event disable all
      return
   }
}
when HTTPS_REQUEST priority 2 {
   if {[POLICY::targets https-reply] } {
      TCP::close
      event disable all
      return
   }
}
when HTTP_RESPONSE {
   HTTP::header remove Server
}`
```



### iRules with inconsistent indentation:

tmsh:
```
ltm rule /Common/example1 {
when HTTP_REQUEST priority 1 {
   if {[POLICY::targets http-reply] } {
      TCP::close
      event disable all
      return
   }
}
when HTTPS_REQUEST priority 2 {
   if {[POLICY::targets https-reply] } {
      TCP::close
      event disable all
      return
   }
 }
}

ltm rule /Common/example2 {
when HTTP_RESPONSE {
   HTTP::header remove Server
}
}
```

JavaScript:
```js
'ltm rule /Common/example1':

`when HTTP_REQUEST priority 1 {
   if {[POLICY::targets http-reply] } {
      TCP::close
      event disable all
      return
   }
}
when HTTPS_REQUEST priority 2 {
   if {[POLICY::targets https-reply] } {
      TCP::close
      event disable all
      return
   }
 }`,

'ltm rule /Common/example2':

`when HTTP_RESPONSE {
   HTTP::header remove Server
}`
```



### Escaped-string brackets:

tmsh:
```
security dos bot-signature "/Common/Bash Shellshock" {
    category "/Common/Exploit Tool"
    rule "headercontent:\"() {\"; useragentonly; nocase;"
    user-defined false
}
```

JavaScript:
```js
'security dos bot-signature "/Common/Bash Shellshock"': {
    category: '"/Common/Exploit Tool"',
    rule: '"headercontent:\\\"() {\\\"; useragentonly; nocase;"',
    'user-defined': 'false'
}
```



### Multiline string:

tmsh:
```
security dos profile /Common/asm-hidden/dos-hidden {
    application {
        dos-hidden {
            captcha-response {
                failure {
                    body "You have entered an invalid answer for the question. Please, try again.
<br>
%DOSL7.captcha.image% %DOSL7.captcha.change%
<br>
<b>What code is in the image\?</b>
%DOSL7.captcha.solution%
<br>
%DOSL7.captcha.submit%
<br>
<br>
Your support ID is: %DOSL7.captcha.support_id%."
                }
            }
        }
    }
}
```

JavaScript:
```js
'security dos profile /Common/asm-hidden/dos-hidden': {
    application: {
        'dos-hidden': {
            'captcha-response': {
                failure: {
                    body: `"You have entered an invalid answer for the question. Please, try again.
<br>
%DOSL7.captcha.image% %DOSL7.captcha.change%
<br>
<b>What code is in the image\\\?</b>
%DOSL7.captcha.solution%
<br>
%DOSL7.captcha.submit%
<br>
<br>
Your support ID is: %DOSL7.captcha.support_id%."`
                }
            }
        }
    }
};
```
