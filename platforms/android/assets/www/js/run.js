/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.run(['$ionicPlatform', '$cordovaSQLite', function($ionicPlatform, $cordovaSQLite) {

    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        if (cordova.platformId == 'android') {
            StatusBar.backgroundColorByHexString("#3F51B5");
        }

        if (window.cordova) { //Android
            db = $cordovaSQLite.openDB({ name: 'prego.db' });
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS subject (id integer primary key, name text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS members (member_id integer primary key autoincrement, group_id integer, id text, name text, rol text)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS chateacher (chateacher_id integer primary key autoincrement, chat_id text, group_id text, user integer, message text, userol text, time integer)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS chatstudent (chatstudent_id integer primary key autoincrement, chat_id text, group_id text, user integer, message text, userol text, time integer)");
            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS grades (grades_id text primary key, group_id text, student_id text, nameActivity text, grade text)");
        } else { //Navegador
            db = window.openDatabase("prego.db", '1', 'prego', 1024 * 1024 * 100); // browser

        }
    });
}])

.run(["$rootScope", "$auth", "$state", function($rootScope, $auth, $state) {
    $rootScope.connections = [];
    $rootScope.$on('$stateChangeStart', function(event, toState) {

        if (toState.name === "login") {
            if ($auth.isAuthenticated() && $auth.getPayload() !== undefined && $auth.getPayload().name.length > 3) {
                event.preventDefault();
                $state.go('main.subjects');
            }
        } else { // Cuando esta dentro de la app

            if (!$auth.isAuthenticated()) { //No existe un token el localStorage
                event.preventDefault();
                $state.go('login');
            } else {
                if ($auth.getPayload() !== undefined) {

                    var user = $auth.getPayload();
                    if (user.name.length > 3 && user.program.length > 3 && user.user.length > 2) {
                        //Todo esta bien
                        if(toState.name == "main.subjects"){
                            for (var i = 0; i < $rootScope.connections.length; i++) {
                                $rootScope.connections[i].off();
                            }
                        }
                    } else {
                        event.preventDefault();
                        $state.go('login');
                    }
                } else { // cuando el token no existe
                    $rootScope.user = undefined;
                    event.preventDefault();
                    $state.go('login');
                }

            }
        }
    });

}]);
