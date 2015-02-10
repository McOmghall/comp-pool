/**
 * Created by srgago on 31/01/2015.
 */
function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1/++count)
            result = prop;
    return result;
};

function millisecondsToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
};

var selectRandomLink = function(hal_object) {
    console.log("Getting link from %s", Object.keys(hal_object.data._links).length);
    var href = hal_object.data._links;
    delete href.self;
    href = href[pickRandomProperty(href)].href;

    console.log("Return link %s", href);

    return href;
};

var app = angular.module("SemprebetaApp", []);

app.controller("JobsCtrl", function($scope, $http, $interval) {
    // GET A RANDOM JOB LINK
    $scope.getARandomJobLink = function(data_from_jobs_root) {
        console.log("GOT JOBS LINKS");
        return $http.get(selectRandomLink(data_from_jobs_root));
    };

    // GET A JOB OBJECT
    $scope.getAJob = function(data_from_job_link) {
        console.log("GOT A JOB");
        $scope.job = data_from_job_link.data;

        // GET THE VARIABLES LINK
        var href = data_from_job_link.data._links;
        href = href['variables'].href;

        $scope.variablesBaseUri = href;

        return $http.get(href);
    };

    $scope.getARandomVariableLink = function(data_from_job_variables_root) {
        console.log("GOT VARIABLES LINKS");
        return $http.get(selectRandomLink(data_from_job_variables_root));
    };

    $scope.setupAndCompute = function(data) {
        console.log("GOT A VARIABLE");
        $scope.variable = data.data.variable;

        console.log("GOT A FUNCTION OBJECT");
        var funct = $scope.job.execute_function;
        $scope.funct = new Function("variable, context", funct);

        console.log("Compute a new result");
        $scope.result = $scope.funct.call(null, $scope.variable, {}).toString(16);
        $scope.variable.hash = $scope.result;
        $scope.result_count = ($scope.result_count || 0) + 1;
        $scope.in_time = ((new Date()).getTime() - $scope.startTime) / 1000;
        $scope.results_per_second = $scope.result_count / $scope.in_time;

        $http({
            method: 'POST',
            url: $scope.variablesBaseUri,
            data: $scope.variable,
            headers: {'Content-Type': 'application/json'}
        });
    };

    /////////////////////////////////////////////////////////////////
    // DO actual Job
    // HAL (HATEOAS) traversal
    // It's long, so true apps should avoid doing this by hand and try to use a HAL traversal helper
    // from jobs API ROOT
    //////////////////////////////////////////////////////////////////
    $scope.startTime = (new Date()).getTime();
    $scope.results_per_second = 0;

    console.log("IN JOBS ROOT");
    $http.get('/jobs')
        .then($scope.getARandomJobLink)
        .then($scope.getAJob)
        .then($scope.getARandomVariableLink)
        .then($scope.setupAndCompute);


    $interval(function (){
        $http.get($scope.variablesBaseUri)
            .then($scope.getARandomVariableLink)
            .then($scope.setupAndCompute);
    }, 500);
});