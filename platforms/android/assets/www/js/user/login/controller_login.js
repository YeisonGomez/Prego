/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.controller('loginCtrl', function($scope, $auth, $state, $rootScope, $stateParams, $ionicHistory, $ionicPopup, $cordovaOauth) {
    var vari;
    var repit = false;

    $scope.login = function() {
        if (!repit) {
            $rootScope.loading(90);
            repit = true;
            $cordovaOauth.chaira("857614255265", ["email"]).then(function(result) {
                $auth.login({tok: result.access_token}).then(function(token) {
                    if (token.status == 200) {
                        localStorage.setItem("token", token.data.token);
                        $rootScope.user = {
                            id: $auth.getPayload().id,
                            name: $scope.formatAllName($auth.getPayload().name),
                            user: $auth.getPayload().user,
                            program: $scope.formatAllName($auth.getPayload().program),
                            rol: $auth.getPayload().rol
                        };

                        $ionicHistory.clearCache().then(function() {
                            $state.go("main.subjects");
                        });
                        //Guardar credenciales en local
                    } else {
                        $rootScope.messageNotification(token.data.token);
                    }
                    $rootScope.loadingState = false;
                    repit = false;
                }).catch(function(err) {
                    repit = false;
                    if (err.status == 400) {
                        $rootScope.messageNotification(err.data);
                    } else {
                        $rootScope.messageNotification("No hemos podido conectar con el servidor");
                    }
                    $rootScope.loadingState = false;
                });
            }, function(error) {
                $rootScope.loadingState = false;
                repit = false;
            });
        }
    }

    //======================Modal=============================

    var abc = [
        ['!', "1", "q", "a", "z", "Q", "A", "Z", "_", "{"],
        ['"', "2", "w", "s", "x", "W", "S", "X", "?", "}"],
        ["#", "3", "e", "d", "c", "E", "D", "C", " ", "["],
        ["$", "4", "r", "f", "v", "R", "F", "V", "¿", "]"],
        ["%", "5", "t", "g", "b", "T", "G", "B", "'", "*"],
        ["&", "6", "y", "h", "n", "Y", "H", "N", ":", "^"],
        ["/", "7", "u", "j", "m", "U", "J", "M", "°", ";"],
        ["(", "8", "i", "k", ",", "I", "K", "+", "¡", "´"],
        [")", "9", "o", "l", ".", "O", "L", "`", "<", "|"],
        ["=", "0", "p", "ñ", "P", "Ñ", "~", "-", ">", "¬"]
    ];

    var encrypt = function(value) {
        var valueE = "";
        for (var i = 0; i < value.length; i++) { //arreglo value
            for (var j = 0; j < value[i].length; j++) { //caracter cada palabra
                for (var k = 0; k < abc.length; k++) { //matriz abc
                    for (var l = 0; l < abc[k].length; l++) {
                        if (value[i].substring(j, j + 1) == abc[k][l]) {
                            valueE += abc[k][0] + "" + l;
                        }
                    }
                }
            }
        }
        return valueE
    }
});
