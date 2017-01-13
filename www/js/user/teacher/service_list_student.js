/*Copyright (c) <2016> <Yeison Gomez Rodriguez, Brayan Stiven Tovar Claros>*/
app.factory('listStudentService', function($http) {
    return {

        saveCalification: function(group_id, nameActivity, student_id, student_name, grade, callback) {
            firebase.database().ref('grades/' + group_id + '/' + student_id).push({
                nameActivity: nameActivity,
                grade: grade
            }).then(function(key) {
                firebase.database().ref('grades/' + group_id + "/activitys").once('value', function(snapshot) {
                    //Guarda el estudiante
                    if (snapshot.val() != null) {
                        firebase.database().ref('grades/' + group_id + '/activitys/' + nameActivity + '/' + student_id).update({
                            student_name: student_name,
                            grade: grade
                        });
                        callback(key.path.o[3]);
                    } else {
                        //Crear la actividad y guarda el estudiante
                        firebase.database().ref('grades/' + group_id + '/activitys/' + nameActivity).set().then(function(k) {
                            firebase.database().ref('grades/' + group_id + '/activitys/' + nameActivity + '/' + student_id).update({
                                student_name: student_name,
                                grade: grade
                            });
                            callback(key.path.o[3]);
                        });
                    }
                });
            });
        },

        getCalification: function(group_id, student_id, callback) {
            firebase.database().ref('grades/' + group_id + "/" + student_id).once('value', function(snapshot) {
                if (snapshot.val() != null) {
                    var grades = [];
                    snapshot.forEach(function(data) {
                        grades.push({ key: data.key, val: data.val() });
                    });
                    callback(grades);
                } else {
                    callback("No tiene notas actualmente");
                }
            });
        },

        getActivitys: function(group_id, callback) {
            firebase.database().ref('grades/' + group_id + '/activitys').once('value', function(snapshot) {
                var activitys = [];
                snapshot.forEach(function(data) {
                    var students = [];
                    for (var key in data.val()) {
                        students.push({id: key, name: data.val()[key].student_name, grade: data.val()[key].grade});
                    }
                    activitys.push({nameActivity: data.key, students: students});
                });
                callback(activitys);
            });
        }
    }
});
