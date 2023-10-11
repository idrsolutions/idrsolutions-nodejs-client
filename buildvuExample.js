/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var idrcloudclient = require('@idrsolutions/idrcloudclient');

function progressListener(e) {
    console.log(JSON.stringify(e));
}

function failureListener(e) {
    console.log(e);
    console.log("Failed!");
}

function successListener(e) {
    console.log(JSON.stringify(e));
   // console.log("Converted " + e.previewUrl);
   console.log("Converted " + e.downloadUrl);
}

var endpoint = "http://localhost:8080/buildvu-microservice/" + idrcloudclient.BUILDVU;

idrcloudclient.convert({
    endpoint: endpoint,
    // The parameters object should contain the parameters that are sent to the API
    // See https://github.com/idrsolutions/buildvu-microservice-example/blob/master/API.md
    parameters: {
        // Upload a local file to the server
        input: idrcloudclient.UPLOAD,
        file: "path/to/file.pdf"
        //token: "token-if-required"
    },
    // Basic authentication values if required
    username: "username-if-required",
    password: "password-if-required",

    // The below are the available listeners
    progress: progressListener,
    success: successListener,
    failure: failureListener
});

// Alternatively you can specify a URL for the server to download the file from.
// To use the URL parameter, input must be set as DOWNLOAD
//idrcloudclient.convert({
    //endpoint: endpoint,
    //parameters: {
        //input: idrcloudclient.DOWNLOAD,
        //url: 'http://example/url/file.pdf'
    //}
//});