/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.controller('appCtrl', function($scope, $rootScope, $timeout, $interval, $cordovaNetwork) {

    $scope.isConnectionDB = false;
    $rootScope.notification = false;

    $rootScope.messageNotification = function(text) {
        $rootScope.notification = true;
        $scope.messageNotification = text;
        $timeout(function() {
            $scope.messageNotification = "";
            $rootScope.notification = false;
        }, 8000);
    };

    $rootScope.loadingState = false;

    $rootScope.loading = function(time, accion, params) {
        var varnew;
        var acum = 0;
        if ($cordovaNetwork.isOnline()) {
            $rootScope.loadingState = true;
            varnew = $interval(function() {
                acum++;
                if (acum == time || !$rootScope.loadingState) {
                    $interval.cancel(varnew);
                    if (accion !== undefined && acum == time) {
                        accion(params);
                    }
                    acum = 0;
                    $rootScope.loadingState = false;
                } else {
                    if ($rootScope.loadingState !== false) {
                        $rootScope.loadingState = true;
                    }
                }
            }, 1000);
        }
    };

    $rootScope.formatName = function(nombreC) {
        var nam = nombreC.split(" ");
        var rom = ['I', 'II', 'III', 'IV', 'V', 'VI'];
        var format = "";
        for (var i = 0; i < nam.length; i++) {
            if (nam[i] !== "" && nam[i].length > 3) {
                format += nam[i].substring(0, 1) + nam[i].substring(1, nam[i].length).toLowerCase() + " ";
            } else if (nam[i].length <= 3) {
                for (var j = 0; j < rom.length; j++) {
                    if (rom[j] == nam[i]) {
                        format += (j + 1);
                        break;
                    }
                }
            }
        }
        return format;
    };

    $scope.formatAllName = function(nombreC) {
        var nam = nombreC.split(" ");
        var format = "";
        for (var i = 0; i < nam.length; i++) {
            if (nam[i] !== "") {
                format += nam[i].substring(0, 1) + nam[i].substring(1, nam[i].length).toLowerCase() + " ";
            }
        }
        return format;
    };
});
