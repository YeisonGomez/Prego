/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.factory('wallService', function($http, $rootScope) {
    return {

        sendMessage: function(message, group_id, group, callback) {
            firebase.database().ref('chats/' + group_id + '/' + group).push(message).then(function() {
                callback("done", message);
            })
        },

        getMessages: function(limit, group_id, addMessage, callback) {
            try {
                fireBD = firebase.database().ref('chats/' + group_id + '/teacher');
            } catch (err) {
                firebase.initializeApp(config);
                fireBD = firebase.database().ref('chats/' + group_id + '/teacher');
            } finally {
                $rootScope.connections.push(fireBD);
                fireBD.limitToLast(11).orderByChild('time').endAt(limit).on('child_added', function(data) {
                    addMessage({
                        key: data.key,
                        user_name: data.val().name,
                        message: data.val().message,
                        rol: data.val().rol,
                        time: data.val().time
                    });
                    callback(fireBD);
                });
                $rootScope.loadingState = false;
            }
        },

        getRol: function(group_id, callback) {
            try {
                fireBD = firebase.database().ref('group/' + group_id);
            } catch (err) {
                firebase.initializeApp(config);
                fireBD = firebase.database().ref('group/' + group_id);
            } finally {
                fireBD.once('value', function(data) {
                    callback(data.val().member[$rootScope.user.user]);
                });
            }
        }

    }
});
