/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.controller('studentCtrl', function($scope, $ionicPopup, studentService, $cordovaNetwork, $rootScope, $state, $cordovaSQLite) {

    $rootScope.conversationStudent = [];
    $scope.mostConversationStudent = true;
    $scope.limitMessageStudent = 0;
    $rootScope.loading(10);
    var ultimo_mensaje = 9999999999999;
    var ultimo = 0;
    var cont = 1;

    var contMostMessage = 0;
    var setMessage = function(data) {
        if (data.time != ultimo_mensaje) {
            if($scope.new_message){
                $scope.new_message = false;
                cont += 2;
            }
            contMostMessage = 0;
            var rol = $scope.classRol(data);
            $rootScope.conversationStudent.push({
                id: data.key,
                user_name: (rol == 'chat-mine') ? "Yo:" : data.user_name,
                message: data.message,
                class: rol,
                time: data.time
            });
            $scope.saveMessage(data, 'chatstudent');
        } else {
            contMostMessage++;
            if (contMostMessage >= $rootScope.conversationStudent.length) {
                $scope.mostConversationStudent = false;
            } else {
                $scope.mostConversationStudent = true;
            }
        }
    }

    $scope.getMessagess = function() {
        if ($cordovaNetwork.isOnline()) {
            $rootScope.loading(6, $scope.notConnect, { group: 'chatstudent', addChat: addChat });
            studentService.getMessages(ultimo_mensaje, $state.params.id, setMessage, function(sock) {
                $rootScope.loadingState = false;
                if ($scope.mostMessagesStudent == undefined) {
                    $scope.mostMessagesStudent = function() { //Agregar mas mensajes a la vista
                        ultimo_mensaje = $rootScope.conversationStudent[ultimo].time;
                        $scope.limitMessageStudent += 10;
                        ultimo = ($scope.limitMessageStudent == 0)? 0 : $scope.limitMessageStudent + cont;
                        $scope.getMessagess();
                    }
                }
            }, function() {
                $scope.notConnect({ group: 'chatstudent', addChat: addChat });
                $rootScope.loadingState = false;
            });
        } else {
            $rootScope.messageNotification("No tienes conexion a internet");
            $scope.notConnect({ group: 'chatstudent', addChat: addChat });
            $rootScope.loadingState = false;
        }
    }

    var addChat = function(message) {
        $rootScope.conversationStudent.push(message);
    }

    $scope.getMessagess();
});
