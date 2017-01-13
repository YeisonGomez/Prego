/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.controller('wallCtrl', function($scope, $ionicSlideBoxDelegate, $state, $rootScope, $cordovaSQLite, wallService, $cordovaNetwork, $ionicScrollDelegate) {

    var vari;
    $rootScope.message = "";
    $scope.conversation = [];
    $scope.mostConversation = true;
    $scope.limitMessage = 0;
    $scope.new_message = false;
    var ultimo_mensaje = 9999999999999;
    var ultimo = 0;
    var cont = 1;

    var contMostMessage = 0;
    var setMessage = function(data) {
        if (data.time != ultimo_mensaje) {
            if ($scope.new_message) {
                $scope.new_message = false;
                cont += 2;
            }
            contMostMessage = 0;
            var rol = $scope.classRol(data);
            $scope.conversation.push({
                id: data.key,
                message: data.message,
                user_name: (rol == 'chat-mine') ? "Yo:" : data.user_name,
                class: rol,
                time: data.time
            });
            $scope.saveMessage(data, 'chateacher');
        } else {
            contMostMessage++;
            if (contMostMessage >= $scope.conversation.length) {
                $scope.mostConversation = false;
            } else {
                $scope.mostConversation = true;
            }
        }
        $rootScope.loadingState = false;
    }

    $scope.getMessages = function() {
        if ($cordovaNetwork.isOnline()) {
            $rootScope.loading(6, $scope.notConnect, { group: 'chateacher', addChat: addChat });
            wallService.getMessages(ultimo_mensaje, $state.params.id, setMessage,
                function(sock) {
                    $rootScope.loadingState = false;
                    if ($scope.mostMessage == undefined) {
                        $scope.mostMessage = function() { //Agregar mas mensajes a la vista
                            ultimo_mensaje = $scope.conversation[ultimo].time;
                            $scope.limitMessage += 10;
                            ultimo = ($scope.limitMessage == 0) ? 0 : $scope.limitMessage + cont;
                            $scope.getMessages();
                        }
                    }
                },
                function() {
                    $scope.notConnect({ group: 'chateacher', addChat: addChat });
                    $rootScope.loadingState = false;
                });
        } else {
            $rootScope.messageNotification("No tienes conexion a internet");
            $scope.notConnect({ group: 'chateacher', addChat: addChat });
            $rootScope.loadingState = false;
        }
    }

    var addChat = function(message) {
        $rootScope.conversation.push(message);
    }

    $rootScope.viewChatStudent = false;

    wallService.getRol($state.params.id, function(rol) {
        $rootScope.user.rol = rol.rol;
        $rootScope.viewChatStudent = (rol.rol == "Estudiante") ? true : false;
        $scope.getMessages();
    });

    var repit = false;
    $scope.sendMessage = function(message, group) {
        if (!repit && validMessage(message)) {
            if ($cordovaNetwork.isOnline()) {
                $rootScope.loading(6);
                repit = true;
                $scope.new_message = true;
                wallService.sendMessage({
                    name: $rootScope.user.name,
                    message: $scope.easteregg(message),
                    rol: $rootScope.user.rol,
                    time: new Date().getTime()
                }, $state.params.id, group, function(res, json) {
                    if (res != "done") {
                        $rootScope.messageNotification("No tienes conexion a internet");
                    }
                    $rootScope.loadingState = false;
                    repit = false;
                });
            } else {
                $rootScope.messageNotification("No tienes conexion a internet");
            }
        }
    }

    $scope.saveMessage = function(data, group) {
        try {
            var query = "SELECT * FROM " + group + " WHERE group_id = ?";
            $cordovaSQLite.execute(db, query, [$state.params.id]).then(function(result) {
                if (result.rows.length >= 10) {
                    var query = "UPDATE " + group + " SET user = ?, message = ?, userol = ?, time = ? WHERE chat_id = ?";
                    $cordovaSQLite.execute(db, query, [data.user_name, data.message, data.rol, data.time, data.key]).then(function(result2) {
                        //console.log("UPDATE -> " + data.message);
                    }, function(error) {
                        console.log(error);
                    });
                } else { //Guarda
                    var exist = false;
                    if (result.rows.length > 0) {
                        for (var i = 0; i < result.rows.length; i++) {
                            if (result.rows.item(i).chat_id == data.key) {
                                exist = true;
                                break;
                            }
                        }
                    }
                    if (!exist) {
                        var query = "INSERT INTO " + group + " (group_id, chat_id, user, message, userol, time) VALUES (?, ?, ?, ?, ?, ?)";
                        $cordovaSQLite.execute(db, query, [$state.params.id, data.key, data.user_name, data.message, data.rol, data.time]).then(function(result3) {
                            //console.log("INSERT ID -> " + data.message);
                        }, function(error, a) {
                            console.log(error);
                        });
                    }
                }
            }, function(error) {
                console.log(error);
            });
        } catch (err) {
            console.log("Error al guardar datos en local");
        }

    }

    $scope.notConnect = function(params) {
        var query = "SELECT * FROM " + params.group + " WHERE group_id = ?";
        $cordovaSQLite.execute(db, query, [$state.params.id]).then(function(result) {
            if (result.rows.length > 0) {
                for (var i = 0; i < result.rows.length; i++) {
                    var rol = $scope.classRol({ rol: result.rows.item(i).userol, user_name: result.rows.item(i).user });
                    params.addChat({
                        id: result.rows.item(i).chat_id,
                        user_name: (rol == 'chat-mine') ? "Yo:" : result.rows.item(i).user,
                        message: result.rows.item(i).message,
                        class: rol,
                        time: result.rows.item(i).time
                    });
                }
            } else {
                $scope.isConnectionDB = true;
                //console.log("No encuentra los miembros en la base de datos");
            }
        }, function(error) {
            console.log(error);
        });
    }

    $scope.classRol = function(send) {
        if (send.rol == "Docente") {
            return "chat-professor";
        } else if ($rootScope.user.name == send.user_name) {
            return "chat-mine";
        } else {
            return "chat-other";
        }
    }

    $scope.nameSubject = function() {
        if ($rootScope.subjects != undefined) {
            for (var i = 0; i < $rootScope.subjects.length; i++) {
                if ($state.params.id == $rootScope.subjects[i].id) {
                    return $rootScope.subjects[i].name;
                } else if (i + 1 == $rootScope.subjects.length) {
                    return "Asignatura";
                }
            }
        } else {
            return "Asignatura";
        }
    }

    var validMessage = function(message) {
        if (message != undefined) {
            for (var i = 0; i < message.length; i++) {
                if (message.substring(i, i + 1) != " " && message.substring(i, i + 1) != "") {
                    return true;
                }
            }
        }
        return false;
    }

    $scope.easteregg = function(message) {
        if (message == "docucha") {
            return "¥ El dominio total del mundo! ¥"
        } else if (message == "kawai") {
            return "Σ ◕ ◡ ◕";
        } else if (message == ".l.") {
            return "┌∩┐";
        } else if (message == "-.-") {
            return "ಠ_ಠ";
        } else if (message == "<3_<3") {
            return "♥◡♥";
        } else if (message == "homero_simpsons") {
            return "¿Homero?, ¿Quién es Homero?, mi nombre es Cosme Fulanito!";
        } else if (message == "._.") {
            return "(￣ー￣)";
        } else if (message == "Tengo muchisimo dinero") {
            return "Tendrá todo el dinero del mundo pero hay algo que nunca podrá comprar... un dinosaurio";
        } else if (message == "Suerte gonorreas") {
            return "Suerte gonorreas By: El Brayan";
        } else {
            return message;
        }
    }


});
