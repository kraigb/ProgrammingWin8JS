﻿//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";

    var inputMP3File;
    var MSS = null;
    var mssStream;
    var byteOffset;
    var timeOffset;
    var songDuration;
    var title;
    var sampleRate;
    var channelCount;
    var bitRate;

    // MP3 Framesize and length for Layer II and Layer III
    var sampleSize = 1152; 
    var sampleDuration = 70;

    var page = WinJS.UI.Pages.define("/html/S1_StreamMP3.html", {
        ready: function (element, options) {
            document.getElementById("pickMP3").addEventListener("click", pickMP3File, false);
        }
    });

    function id(elementId) {
        return document.getElementById(elementId);
    }

    function getMP3FileProperties() {
        // Get the common music properties of the input MP3 file
        return inputMP3File.properties.getMusicPropertiesAsync().then(function (mp3FileProperties) {
            songDuration = mp3FileProperties.duration;
            title = mp3FileProperties.title;
            if (title === "") {
                title = inputMP3File.displayName;
            }
        });
    }

    function getMP3EncodingProperties(){
        // Get the encoding properties of the input MP3 file
        var encodingPropertiesToRetrieve = new Array();

        encodingPropertiesToRetrieve[0] = "System.Audio.SampleRate";
        encodingPropertiesToRetrieve[1] = "System.Audio.ChannelCount";
        encodingPropertiesToRetrieve[2] = "System.Audio.EncodingBitrate";

        return inputMP3File.properties.retrievePropertiesAsync(encodingPropertiesToRetrieve).then(function (encodingProperties) {
            sampleRate = encodingProperties["System.Audio.SampleRate"];
            channelCount = encodingProperties["System.Audio.ChannelCount"];
            bitRate = encodingProperties["System.Audio.EncodingBitrate"];
        });
    }

function initializeMediaStreamSource() {
    byteOffset = 0;
    timeOffset = 0;

    // Get the MP3 file properties
    getMP3FileProperties().then(function () {
        return getMP3EncodingProperties();
    }).then(function () {
        // Creating the AudioEncodingProperties for the MP3 file
        var audioProps = Windows.Media.MediaProperties.AudioEncodingProperties.createMp3(sampleRate, channelCount, bitRate);

        // Creating the AudioStreamDescriptor for the MP3 file
        var audioDescriptor = new Windows.Media.Core.AudioStreamDescriptor(audioProps);

        // Creating the MediaStreamSource for the MP3 file
        MSS = new Windows.Media.Core.MediaStreamSource(audioDescriptor);
        MSS.canSeek = true;
        MSS.musicProperties.title = title;
        MSS.duration = songDuration;

        // Hooking up the MediaStreamSource event handlers
        MSS.addEventListener("starting", startingHandler, false);
        MSS.addEventListener("samplerequested", sampleRequestedHandler, false);        
        MSS.addEventListener("closed", closedHandler, false);

        // Set the MediaStreamSource to audio tag and start the playback
        mediaPlayer.src = URL.createObjectURL(MSS, { oneTimeOnly: true });

        //Note: this is redundant with the play() call in the completed handler
        //of the file picker, so the other is commented out.
        mediaPlayer.play();

        WinJS.log && WinJS.log("Playing using MediaStreamSource", "sample", "status");
    });
}

    function closedHandler(e){
        // Close the MediaStreamSource
        if (mssStream){
            mssStream.close();
            mssStream = undefined;
        }

        // Remove the MediaStreamSource event handlers
        e.target.removeEventListener("starting", startingHandler, false);
        e.target.removeEventListener("samplerequested", sampleRequestedHandler, false);        
        e.target.removeEventListener("closed", closedHandler, false);

        if (e.target === MSS) { 
            MSS = null; 
        }
    }

    function sampleRequestedHandler(e){
        var request = e.request;

        // Check if the sample requested byte offset is within the file size
        if (byteOffset + sampleSize <= mssStream.size)
        {
            var deferral = request.getDeferral();
            var inputStream = mssStream.getInputStreamAt(byteOffset);

            // Create the MediaStreamSample and assign to the request object. 
            // You could also create the MediaStreamSample using createFromBuffer(...)
            Windows.Media.Core.MediaStreamSample.createFromStreamAsync(
                inputStream, sampleSize, timeOffset).then(function(sample) {
                    sample.duration = sampleDuration;
                    sample.keyFrame = true;

                    // Increment the time and byte offset
                    byteOffset = byteOffset + sampleSize;
                    timeOffset = timeOffset + sampleDuration;
                    request.sample = sample;
                    deferral.complete();
                });
        }
    }


    function startingHandler(e){
        var request = e.request;

        if ((request.startPosition !== null) && request.startPosition <= MSS.duration) {
            var sampleOffset = Math.floor(request.startPosition / sampleDuration);
            timeOffset = sampleOffset * sampleDuration;
            byteOffset = sampleOffset * sampleSize;
        }

        // Create the RandomAccessStream for the input file for the first time 
        if (mssStream === undefined){
            var deferral = request.getDeferral();
            try{
                inputMP3File.openAsync(Windows.Storage.FileAccessMode.read).then(function(stream) {
                    mssStream = stream;
                    request.setActualStartPosition(timeOffset);
                    deferral.complete();
                });
            }
            catch (exception){
                MSS.notifyError(Windows.Media.Core.MediaStreamSourceErrorStatus.failedToOpenFile);
                deferral.complete();
            }
        }
        else {
            request.setActualStartPosition(timeOffset);
        }
    }


    function pickMP3File() {
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.musicLibrary;
        openPicker.fileTypeFilter.replaceAll([".mp3"]);

        openPicker.pickSingleFileAsync().then(function (file) {
            if (file) {
                inputMP3File = file;
                // Initialize the MediaStreamSource and set it to Play using the Audio tag
                initializeMediaStreamSource();

                //Not needed because initializeMediaStreamSource calls play() itself.
                //mediaPlayer.play();

                WinJS.log && WinJS.log("Playing using MediaStreamSource", "sample", "status");
            }
        },
        handleError);
    }

    function handleError(error) {
        WinJS.log && WinJS.log("Error: " + error.message, "sample", "error");
    }

})();
