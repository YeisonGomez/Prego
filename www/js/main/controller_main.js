/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.controller('mainCtrl', function($scope, $rootScope, $cordovaNetwork, $auth, $location, $state, $ionicSideMenuDelegate, $cordovaSQLite, $ionicPopup, $ionicModal) {

    $rootScope.lengthStudents = function() {
        return 0;
    };

    if ($rootScope.user == undefined) {
        $rootScope.user = {
            id: $auth.getPayload().id,
            name: $scope.formatAllName($auth.getPayload().name),
            user: $auth.getPayload().user,
            program: $scope.formatAllName($auth.getPayload().program),
            rol: $auth.getPayload().rol
        };
    }

    $scope.isNetWork = function() {
        return $cordovaNetwork.isOnline();
    }

    $scope.idSubjectNow = function() {
        return $state.params.id;
    }

    $scope.inputSms = false;
    $scope.isWall = function() {
        return $location.path().split("/")[2] != 'wall';
    }

    $scope.logout = function() {
        //$cordovaSQLite.deleteDB("prego.db");
        $cordovaSQLite.execute(db, "DELETE FROM subject");
        $cordovaSQLite.execute(db, "DELETE FROM members");
        $cordovaSQLite.execute(db, "DELETE FROM chateacher");
        $cordovaSQLite.execute(db, "DELETE FROM chatstudent");
        $cordovaSQLite.execute(db, "DELETE FROM grades");
        localStorage.clear();
        $scope.viewlogOut = false;
        $rootScope.members = undefined;
        $rootScope.subjects = undefined;
        $state.go("login");
    }

    $scope.viewlogOut = false;

    $scope.activelogOut = function(viewlogOut) {
        if (!viewlogOut) {
            $scope.viewlogOut = true;
        } else {
            $scope.viewlogOut = false;
        }
    }

    $scope.viewUpdate = false;
    $scope.activeUpdate = function(viewUpdate) {
        if (!viewUpdate) {
            $scope.viewUpdate = true;
        } else {
            $scope.viewUpdate = false;
        }
    }

    $scope.updateSubjects = function() {
        $scope.activeUpdate(true);
        $rootScope.loading(90);
        $auth.login({
            user: $rootScope.user.user,
            password: desencrypt(localStorage.getItem("p"))
        }).then(function(token) {
            if (token.status == 200) {
                $rootScope.messageNotification("Tus materias se han actualizado con exito!");
                localStorage.setItem("token", token.data.token);
                $rootScope.user = {
                    id: $auth.getPayload().id,
                    name: $scope.formatAllName($auth.getPayload().name),
                    user: $auth.getPayload().user,
                    program: $scope.formatAllName($auth.getPayload().program),
                    rol: $auth.getPayload().rol
                };
            } else {
                $rootScope.messageNotification(token.data.token);
            }
            $rootScope.loadingState = false;
        }).catch(function(err) {
            if (err.status == 400) {
                $rootScope.messageNotification(err.data);
            } else {
                $rootScope.messageNotification("No hemos podido conectar con el servidor");
            }
            $rootScope.loadingState = false;
        });
    }

    $ionicModal.fromTemplateUrl('modalConfig', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalConfig = modal;
    });

    $scope.openConfig = function() {
        $scope.modalConfig.show();
    };

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

    var desencrypt = function(value) {
        var valueD = "";
        var cont = 0;
        for (var i = 0; i < value.length; i++) { //arreglo value
            for (var j = 0; j < value[i].length; j++) { //caracter cada palabra
                for (var k = 0; k < abc.length; k++) { //matriz abc
                    for (var l = 0; l < abc[k].length; l++) {
                        if (value[i].substring(j, j + 1) == abc[k][l]) {
                            if (cont == 0) {
                                a = k;
                                cont++;
                            } else {
                                valueD += abc[a][k + 1];
                                cont = 0;
                            }
                        }
                    }
                }
            }
        }
        return valueD
    };
});
