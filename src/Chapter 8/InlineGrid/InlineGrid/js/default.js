﻿(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }
            args.setPromise(WinJS.UI.processAll());

            document.getElementById("chkInline").addEventListener("click", function () {
                setGridStyle(document.getElementById("chkInline").checked);
            });

            setGridStyle(true);
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    function setGridStyle(inline) {
        var gridClass = inline ? "inline" : "block";

        document.getElementById("grid1").className = gridClass;
        document.getElementById("grid2").className = gridClass;
        document.getElementById("grid3").className = gridClass;
    }

    app.start();
})();
