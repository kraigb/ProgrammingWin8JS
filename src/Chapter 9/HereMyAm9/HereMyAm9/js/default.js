﻿(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;

    WinJS.Utilities.startLog("app");

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                //Normal startup: initialize lastPosition through geolocation API and leave photo to the default
                app.sessionState.initFromState = false;
            } else {
                //We'll use this bit of session state to let the home page know whether to rehydrate.
                //It should reset the flag (to false) once it's picked up so that we never save it
                //as true during suspend.
                app.sessionState.initFromState = true;
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }

            //Use then (not done) so we have a promise to give to setPromise
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    nav.history.current.initialPlaceholder = true;
                    return nav.navigate(nav.location, nav.state);
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    };

    app.start();
})();
