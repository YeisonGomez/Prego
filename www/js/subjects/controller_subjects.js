/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.controller('subjectsCtrl', function($scope, $rootScope, subjectService, $cordovaSQLite, $state, $cordovaNetwork) {
    var vari;

    var notConnect = function() {
        var query = "SELECT id, name FROM subject";
        $cordovaSQLite.execute(db, query).then(function(result) {
            if (result.rows.length > 0) {
                $rootScope.subjects = [];
                for (var i = 0; i < result.rows.length; i++) {
                    $rootScope.subjects.push({
                        id: result.rows.item(i).id,
                        name: $rootScope.formatName(result.rows.item(i).name)
                    });
                }
            } else {
                $rootScope.messageNotification("Tu conexión a internet esta fallando");
                console.log("No encuentra materias en la base de datos");
                //Y no tiene conexion a internet   
            }
        }, function(error) {
            console.log(error);
        });
    }

    $rootScope.downloadSubjects = function() {
        if ($rootScope.subjects == undefined) {
            $rootScope.loading(8, notConnect);
            subjectService.getSubject().then(function(data) {
                $rootScope.loadingState = false;
                if (data.data != "El usuario no tiene asignaturas actualmente") {
                    $rootScope.subjects = data.data;
                    for (var i = 0; i < data.data.length; i++) {
                        $rootScope.subjects[i].name = $rootScope.formatName($rootScope.subjects[i].name);
                        $scope.insertSubject(data.data[i].id, data.data[i].name);
                    }
                } else {
                    notConnect();
                }
            }).catch(function(data) {
                $rootScope.loadingState = false;
                if (data.status == 401) {
                    $scope.logout();
                } else {
                    notConnect();
                }
            });
        }
    }

    try {
        $rootScope.downloadSubjects();
    } catch (er) {
        console.log(er);
        if ($cordovaNetwork.isOnline()) {
            firebase.initializeApp(config);
            $rootScope.downloadSubjects();
        } else {
            notConnect();
        }

    }

    $scope.insertSubject = function(id, name) {
        var query = "SELECT * FROM subject WHERE id = ?";
        $cordovaSQLite.execute(db, query, [id]).then(function(result) {
            if (result.rows.length > 0) {
                var query = "UPDATE subject SET id = ?, name = ? WHERE id = ?";
                $cordovaSQLite.execute(db, query, [id, name, id]).then(function(result2) {
                    //console.log("UPDATE -> " + name);
                }, function(error) {
                    console.log(error);
                });
            } else { //Guarda
                var query = "INSERT INTO subject (id, name) VALUES (?,?)";
                $cordovaSQLite.execute(db, query, [id, name]).then(function(result3) {
                    //console.log("INSERT ID -> " + result3.insertId);
                }, function(error) {
                    console.log(error);
                });
            }
        }, function(error) {
            console.log(error);
        });
    }
});
