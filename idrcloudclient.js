/*
 * Copyright 2021 IDRsolutions
 *
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

import http from "http";
import https from "https";
import FormData from "form-data";
import fs from "fs";

(() => {
    const getProtocol = (endPoint) => {
        if (endPoint.toLowerCase().startsWith("https")) {
            return https;
        }

        return http;
    };

    const Converter = (() => {
        const doPoll = (uuid, endpoint) => {
            let req, retries = 0, time = 0;
            const uri = `${endpoint}?uuid=${uuid}`;

            const errorHandler = (error) => {
                retries++;
                if (retries > 3) {
                    clearInterval(poll);
                    if (failure) {
                        failure(error);
                    }
                }
            };

            var poll = setInterval(() => {
                if (!req) {
                    const options = {
                        method: "GET",
                    };

                    if (username && password) {
                        options.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
                    }

                    time += 500;
                    if (conversionTimeout && time > conversionTimeout) {
                        if (failure) {
                            failure({code: "ECONVERSIONTIMEOUT"});
                        }
                        clearInterval(poll);
                        return;
                    }

                    req = getProtocol(endpoint).request(uri, options, (response) => {
                        response.on("data", (body) => {
                            if (response.statusCode === 200) {
                                const data = JSON.parse(body.toString());
                                if (data.state === "processed") {
                                    clearInterval(poll);
                                    if (success) {
                                        success(data);
                                    }
                                } else if (data.state === "error") {
                                    clearInterval(poll);
                                    if (failure) {
                                        failure(new Error(JSON.stringify(data)));
                                    }
                                } else {
                                    if (progress) {
                                        progress(data);
                                    }
                                }
                            } else {
                                const failData = {
                                    body: body.toString(),
                                    statusCode: response.statusCode,
                                    headers: response.headers,
                                    request: {
                                        method: response.req.method,
                                        headers: response.req.getHeaders(),
                                    },
                                };
                                errorHandler(new Error(JSON.stringify(failData)));
                            }
                            req = null;
                        });
                    }).on("error", (e) => {
                        errorHandler(e);
                        req = null;
                    });
                    req.end();
                }
            }, 500);
        };

        var progress, success, failure, username, password, requestTimeout, conversionTimeout;

        return {
            UPLOAD: "upload",
            DOWNLOAD: "download",
            JPEDAL: "jpedal",
            BUILDVU: "buildvu",
            FORMVU: "formvu",
            bufferToFile(file, filename) {
                let returnFile;
                if (file instanceof Buffer) {
                    if (!filename) {
                        throw Error("Missing filename");
                    }
                    returnFile = {
                        value: file,
                        options: {
                            filename,
                            contentType: "application/pdf",
                        },
                    };
                }
                return returnFile;
            },
            convert(params) {
                if (!params.endpoint) {
                    throw Error("Missing endpoint");
                }
                if (params.success && typeof params.success === "function") {
                    success = params.success;
                }
                if (params.failure && typeof params.failure === "function") {
                    failure = params.failure;
                }
                if (params.progress && typeof params.progress === "function") {
                    progress = params.progress;
                }

                requestTimeout = params.requestTimeout;
                conversionTimeout = params.conversionTimeout;

                const rawForm = params.parameters || {};

                if (typeof rawForm.input === "undefined" || rawForm.input == null) {
                    throw Error("Parameter 'input' must be provided");
                }

                switch (rawForm.input) {
                    case this.UPLOAD:
                        if (typeof rawForm.file === "undefined" || rawForm.file == null) {
                            throw Error("Parameter 'file' must be provided when using input=upload");
                        } else if (rawForm.file instanceof Buffer) {
                            throw Error("Please use the bufferToFile method on your file parameter");
                        } else if (typeof rawForm.file === "string" || rawForm.file instanceof String) {
                            rawForm.file = fs.createReadStream(rawForm.file);
                        } else if (!(rawForm.file instanceof fs.ReadStream) && !rawForm.file["value"] && !rawForm.file["options"]
                                   && !rawForm.file.options["filename"] && !rawForm.file.options["contentType"]) {
                            throw Error("Did not recognise type of 'file' parameter");
                        }
                        break;

                    case this.DOWNLOAD:
                        if (typeof rawForm.url === "undefined" || rawForm.url == null) {
                            throw Error("Parameter 'url' must be provided when using input=download");
                        }
                        break;
                }

                const formData = new FormData();

                Object.entries(rawForm).forEach(([key, value]) => formData.append(key, value));

                const options = {
                    method: "POST",

                    headers: formData.getHeaders(),
                };

                if (params.username || params.password) {
                    if (!params.username) {
                        throw Error("Password provided but username is missing");
                    } else {
                        username = params.username;
                    }

                    if (!params.password) {
                        throw Error("Username provided but password is missing");
                    } else {
                        password = params.password;
                    }
                    options["Authorization"] = `Basic ${Buffer.from(`${params.username}:${params.password}`).toString("base64")}`;
                }

                if (requestTimeout) {
                    options["timeout"] = requestTimeout;
                }

                const theRequest = getProtocol(params.endpoint).request(params.endpoint, options, (response) => {
                    response.on("data", (body) => {
                        if (response.statusCode === 200) {
                            if (rawForm.callbackUrl && !(params.success || params.progress)) {
                                //Exit without a failure
                            } else {
                                doPoll(JSON.parse(body.toString()).uuid, params.endpoint);
                            }
                        } else {
                            if (failure) {
                                const failData = {
                                    body: body.toString(),
                                    statusCode: response.statusCode,
                                    headers: response.headers,
                                    request: {
                                        method: response.req.method,
                                        headers: response.req.getHeaders(),
                                    },
                                };
                                failure(new Error(JSON.stringify(failData)));
                            }
                        }
                    });
                }).on("error", (e) => {
                    if (failure) {
                        failure(e);
                    }
                });

                formData.pipe(theRequest);
            },
        };
    })();

    if (typeof define === "function" && define.amd) {
        //noinspection JSUnresolvedFunction
        define(["converter"], [], () => Converter);
    } else if (typeof module === "object" && module.exports) {
        module.exports = Converter;
    }

})();
