/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.factory('studentService', function($http, $rootScope) {
    return {

        getMessages: function(limit, group_id, addMessage, callback) {
            try {
                var fireBD2 = firebase.database().ref('chats/' + group_id + '/student');
            } catch (err) {
                firebase.initializeApp(config);
                var fireBD2 = firebase.database().ref('chats/' + group_id + '/student');
            } finally {
                $rootScope.connections.push(fireBD2);
                fireBD2.limitToLast(11).orderByChild('time').endAt(limit).on('child_added', function(data) {
                    addMessage({
                        key: data.key,
                        user_name: data.val().name,
                        message: data.val().message,
                        rol: data.val().rol,
                        time: data.val().time
                    });
                    callback(fireBD2);
                });
                $rootScope.loadingState = false;
            }
        }
    }
});
