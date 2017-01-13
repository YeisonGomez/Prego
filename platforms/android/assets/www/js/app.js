/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app = angular.module('prego', ['ionic', 'satellizer', 'ngCordova', 'ngx$httpTimeoutModule', 'ngCordovaOauth']);
var db = null;
//var api_url = "http://localhost:8099";
var api_url = "http://104.236.225.92:8099";
//var api_url = "https://dd317f36.ngrok.io";
 
var config = {
    apiKey: "AIzaSyBzwyeWXxkopoRIlOeCgAuD2MPvY-EeTsU",
    authDomain: "prego-22e63.firebaseapp.com",
    databaseURL: "https://prego-22e63.firebaseio.com",
    storageBucket: "prego-22e63.appspot.com"
};
try {
    firebase.initializeApp(config);
    var fireDB = firebase.database();
} catch (er) {
    if(fireDB !== undefined){
        fireDB.ref("disconnectmessage").onDisconnect().set("I disconnected!");
    }
}

app.config(function($stateProvider, $urlRouterProvider, $authProvider, ngx$httpTimeoutProvider) {
    ngx$httpTimeoutProvider.config.timeout = 80000;
    $authProvider.loginUrl = api_url + '/user/login';
    $authProvider.tokenName = 'token';
    $authProvider.tokenPrefix = '';
    $authProvider.storageType = 'localStorage';

    $stateProvider 

        .state('login', {
        url: '/login',
        templateUrl: 'templates/user/login/view_login.html',
        controller: 'loginCtrl'
    })

    .state('main', {
        url: '',
        abstract: true,
        templateUrl: 'templates/main/view_main.html',
        controller: 'mainCtrl'
    })

    .state('main.subjects', {
        url: '/subjects',
        views: {
            'menuContent': {
                templateUrl: 'templates/subjects/view_subjects.html',
                controller: 'subjectsCtrl'
            }
        }
    })

    .state('main.wall', {
        url: '/:id/wall',
        views: {
            'menuContent': {
                templateUrl: 'templates/wall/view_wall.html',
                controller: 'wallCtrl'
            }
        }
    });

    var url = window.location.hash.split("/");
    if (url[0] === "") {
        if (localStorage.token === undefined) {
            $urlRouterProvider.otherwise('/login');
        } else {

            $urlRouterProvider.otherwise('/subjects');
        }
    } else {
        $urlRouterProvider.otherwise('/login');
    }
});
