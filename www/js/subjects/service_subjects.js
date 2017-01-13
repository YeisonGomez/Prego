/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.factory('subjectService', function($http) {

    return {

        getSubject: function() {
            return $http.post(api_url + '/user/subjects');
        }

    }
});
