﻿//// THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF
//// ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO
//// THE IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
//// PARTICULAR PURPOSE.
////
//// Copyright (c) Microsoft Corporation. All rights reserved

(function () {
    "use strict";
    var clockImage, hourImage, minuteImage, secondImage;
    var clockWidth = 281;
    var clockHeight = 349;
    var handWidth = 18;
    var handHeight = 153;
    var width = 317;
    var height = 317;

    var context;
    var lastTime = 0;
    var fps = 10;

    var page = WinJS.UI.Pages.define("/html/scenario1.html", {
        ready: function (element, options) {
            loadImage();
            var selectFPS = document.getElementById("selectFPS");
            fps = selectFPS[selectFPS.selectedIndex].id;

            selectFPS.addEventListener("change", function () {
                fps = selectFPS[selectFPS.selectedIndex].id;
            });

            var scenario1Canvas = document.getElementById("scenario1Canvas");
            context = scenario1Canvas.getContext("2d");

            //If you just want a once-per-second movement of the second hand, just use a 1s interval.
            //Note that we still use requestAnimationFrame to coordinate the drawing with the display.
            //setInterval(function () { requestAnimationFrame(drawClock); }, 1000);

            requestAnimationFrame(renderLoopRAF);
        }
    });

    function id(elementId) {
        return document.getElementById(elementId);
    }

    function loadImage() {
        clockImage = document.getElementById("img1");
        hourImage = document.getElementById("img2");
        minuteImage = document.getElementById("img3");
        secondImage = document.getElementById("img4");
    }

    
    function renderLoopRAF() {        
        var interval = 1000 / fps;
        var curTime = Math.floor(Date.now() / interval);

        if (lastTime != curTime) {
            lastTime = curTime;
            drawClock();
        }

        requestAnimationFrame(renderLoopRAF);
    }


    function drawClock() {
        context.save();

        //Modified from original sample to do smooth animation of the hands.
        var date = new Date();
        var second = date.getSeconds() + date.getMilliseconds() / 1000;
        var minute = date.getMinutes() + second / 60;
        var hour   = date.getHours() + minute / 60;        

        // Outside circle
        context.clearRect(0, 0, width, height);

        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.shadowBlur = 10;
        context.shadowColor = "rgba(0, 0, 0, 0.5)";

        context.drawImage(clockImage, 0, 0, width, height);

        context.shadowBlur = 5;

        var sDegree = second / 60 * 360 - 180;
        var mDegree = minute / 60 * 360 - 180;
        var hDegree = ((hour + (minute / 60)) / 12) * 360 - 180;

        // Second hand
        context.save();
        context.translate(150, 150);
        context.rotate(sDegree * Math.PI / 180);
        context.drawImage(secondImage, -8, -39, handWidth, handHeight);
        context.restore();

        // Minute hand
        context.save();
        context.translate(150, 150);
        context.rotate(mDegree * Math.PI / 180);
        context.drawImage(minuteImage, -8, -39, handWidth, handHeight);
        context.restore();

        // Hour hand
        context.save();
        context.translate(150, 150);
        context.rotate(hDegree * Math.PI / 180);
        context.drawImage(hourImage, -8, -39, handWidth, handHeight);
        context.restore();

        context.restore();
    }
})();
