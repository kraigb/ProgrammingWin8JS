﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/scenario3.html", {
        ready: function (element, options) {
            //Click handler uses a new function
            document.getElementById("button1").addEventListener("click", readPrevCredentialAndLaunch, false);
            //document.getElementById("button1").addEventListener("click", launchCredPicker, false);
            document.getElementById("InputProtocol").addEventListener("change", hideShowCustomProtocol, false);
        }
    });

    //Added
    function readPrevCredentialAndLaunch() {
        Windows.Storage.ApplicationData.current.localFolder.getFileAsync("credbuffer.dat").then(function (file) {
            return Windows.Storage.FileIO.readBufferAsync(file);
        }).done(function (buffer) {
            console.log("Read from credbuffer.dat");
            launchCredPicker(buffer);
        }, function (e) {
            console.log("Could not reopen credbuffer.dat; launching default");
            launchCredPicker(null);
        });
    }

    function hideShowCustomProtocol() {
        // ignore if fired when elements are missing or uninitialized
        if (document.getElementById("InputProtocol") === null || document.getElementById("CustomProtocolContainer") === null) {
            return;
        }
        // toggle visibility
        if (document.getElementById("InputProtocol").value === "Custom") {
            document.getElementById("CustomProtocolContainer").style.display = "table-row";
        } else {
            document.getElementById("CustomProtocolContainer").style.display = "none";
        }
    }

    //Modified to take a buffer
    function launchCredPicker(prevCredBuffer) {
        try {
            var options = new Windows.Security.Credentials.UI.CredentialPickerOptions();

            //Set the previous credential if provided
            if (prevCredBuffer != null) {
                options.previousCredential = prevCredBuffer;
            }

            options.message = document.getElementById("InputMessage").value;
            options.caption = document.getElementById("InputCaption").value;
            options.targetName = document.getElementById("InputTarget").value;
            options.alwaysDisplayDialog = document.getElementById("InputAlwaysShowUI").checked;
            options.callerSavesCredential = document.getElementById("InputCallerSaves").checked;
            switch (document.getElementById("InputProtocol").value) {
                case "Negotiate":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.negotiate;
                    break;
                case "Kerberos":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.kerberos;
                    break;
                case "CredSsp":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.credSsp;
                    break;
                case "Basic":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.basic;
                    break;
                case "Digest":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.digest;
                    break;
                case "NTLM":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.ntlm;
                    break;
                case "Custom":
                    options.authenticationProtocol = Windows.Security.Credentials.UI.AuthenticationProtocol.custom;
                    options.customAuthenticationProtocol = document.getElementById("InputCustomProtocol").value;
                    break;
                default:
                    WinJS.log && WinJS.log("Bad auth protocol specified: " + document.getElementById("InputProtocol").value, "sample", "error");
                    break;
            }
            switch (document.getElementById("InputCheckboxState").value) {
                case "Unselected":
                    options.credentialSaveOption = Windows.Security.Credentials.UI.CredentialSaveOption.unselected;
                    break;
                case "Selected":
                    options.credentialSaveOption = Windows.Security.Credentials.UI.CredentialSaveOption.selected;
                    break;
                case "Hidden":
                    options.credentialSaveOption = Windows.Security.Credentials.UI.CredentialSaveOption.hidden;
                    break;
                default:
                    WinJS.log && WinJS.log("Bad save option specified: " + document.getElementById("InputCheckboxState").value, "sample", "error");
                    break;                      
            }
            Windows.Security.Credentials.UI.CredentialPicker.pickAsync(options).then(function (results) {
                document.getElementById("OutputDomainName").value = results.credentialDomainName;
                document.getElementById("OutputUserName").value = results.credentialUserName;
                document.getElementById("OutputPassword").value = results.credentialPassword;
                document.getElementById("OutputCredentialSaved").value = results.credentialSaved ? "Yes" : "No";
                document.getElementById("OutputCredentialSaveState").value = (results.credentialSaveOption === Windows.Security.Credentials.UI.CredentialSaveOption.hidden) ? "Hidden" :
                                                                             ((results.credentialSaveOption === Windows.Security.Credentials.UI.CredentialSaveOption.selected) ? "Selected" : "Unselected");
                WinJS.log && WinJS.log("pickAsync status: " + results.errorCode, "sample", "status");

                //Save the credential buffer to a file
                //results.credential will be null if the user cancels
                if (results.credential != null) {
                    //Having retrieved a credential, write the opaque buffer to a file
                    var option = Windows.Storage.CreationCollisionOption.replaceExisting;

                    Windows.Storage.ApplicationData.current.localFolder.createFileAsync("credbuffer.dat", option).then(function (file) {
                        return Windows.Storage.FileIO.writeBufferAsync(file, results.credential);
                    }).done(function () {
                        //No results for this operation
                        console.log("credbuffer.dat written.");
                    }, function (e) {
                        console.log("Could not create credbuffer.dat file.");
                    });
                }

            });
        } catch (err) {
            WinJS.log && WinJS.log("Error message: " + err.message, "sample", "error");
        }
    }
})();
