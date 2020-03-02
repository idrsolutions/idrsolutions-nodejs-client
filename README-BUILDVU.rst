IDRSolutions NodeJS Client with BuildVu
=======================================

Convert PDF to HTML5 or SVG with NodeJS, using the IDRSolutions NodeJS Client to
interact with IDRsolutions' `BuildVu Microservice Example`_.

The BuildVu Microservice Example is an open source project that allows you to
convert PDF to HTML5 or SVG by running `BuildVu`_ as an online service.

IDR Solutions offer a free trial service for running BuildVu with NodeJS,
more infomation on this can be found `here.`_

--------------

Installation
------------

Using NPM:
~~~~~~~~~~

::

    npm install @idrsolutions/idrcloudclient

--------------

Usage
-----

Basic (Upload):
~~~~~~~~~~~~~~~

::

    var client = require('@idrsolutions/idrcloudclient');

    var endpoint = "http://localhost:8080/buildvu-microservice/" + client.BUILDVU;

    client.convert({
    endpoint: endpoint,
    parameters: {
            // Upload a local file to the server
            input: client.UPLOAD,
            file: "path/to/file.pdf",
            token: "token-if-required"
        },

        failure: function(e) {
            console.log(e);
        },
        progress: function() { },
        success: function(e) {
            console.log('Converted ' + e.downloadUrl);
        }

    });



Basic (Download):
~~~~~~~~~~~~~~~~~
::

    var client = require('@idrsolutions/idrcloudclient');

    var endpoint = "http://localhost:8080/buildvu-microservice/" + client.BUILDVU;

    client.convert({
        endpoint: endpoint,
        parameters: {
            // Download a remote file on the server
            input: client.DOWNLOAD,
            url: 'http://example/url/file.pdf'
        },

        failure: function(e) {
            console.log(e);
        },
        progress: function() { },
        success: function(e) {
            console.log('Converted ' + e.downloadUrl);
        }

    });

Additional parameters can be used in ``convert()``, they are defined in our 
`API`_

--------------

Who do I talk to?
=================

Found a bug, or have a suggestion / improvement? Let us know through the
Issues page.

Got questions? You can contact us `here`_.

--------------

Code of Conduct
===============

Short version: Don't be an awful person.

Longer version: Everyone interacting in the IDRSolutions NodeJS Client
project's codebases, issue trackers, chat rooms and mailing lists is
expected to follow the `code of conduct`_.

--------------

Copyright 2018 IDRsolutions

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

.. _BuildVu Microservice Example: https://github.com/idrsolutions/buildvu-microservice-example
.. _BuildVu: https://www.idrsolutions.com/buildvu/
.. _here: https://idrsolutions.zendesk.com/hc/en-us/requests/new
.. _code of conduct: CODE_OF_CONDUCT.md
.. _API: https://github.com/idrsolutions/buildvu-microservice-example/blob/master/API.md
.. _here.: https://www.idrsolutions.com/buildvu/convert-pdf-in-python/
