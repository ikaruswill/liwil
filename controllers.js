var mod = angular.module('liwil', ['ngRoute']);

function routeConfig($routeProvider) {
	$routeProvider.when('/', {
		controller: 'homeController',
		controllerAs: 'home',
		templateUrl: 'home.html'
	}).when('/login', {
		controller: 'loginController',
		controllerAs: 'login',
		templateUrl: 'login.html'
	}).when('/class', {
		controller: 'classController',
		controllerAs: 'class',
		templateUrl: 'class.html'
	}).when('/detail/:id', {
		controller: 'detailController',
		controllerAs: 'detail',
		templateUrl: 'detail.html'
	})
}
mod.config(routeConfig);

mod.service('util', ['$http', '$window', function($http, $window){
	var apiKey = 'c50ef99c7b4cd1f7dfbcacc1dde89679';
	var storage = $window.localStorage;

	this.login = function(user, pass) {
		var postUrl = 'http://sandbox.graph.hmhco.com/v4/sample_token?';
		postUrl += 'client_id=' + '1b742356-b66a-401c-9632-bfe0c651677e.hmhco.com' + '&';
		postUrl += 'grant_type=' + 'password' + '&';
		postUrl += 'username=' + user + '&';
		postUrl += 'password=' + pass;

		console.log(postUrl);

		return $http({
			method  : 'POST',
			url     : postUrl,
            headers : {
            	'Content-Type': 'application/x-www-form-urlencoded',
            	'Vnd-HMH-Api-Key': apiKey
            },
            data: {}
        }).then(function(object){
        	var data = object.data;
        	storage.token      = JSON.stringify(data);
			console.log('LOGIN OK');
			console.log(data);
        },function(object){
        	console.log('LOGIN ERROR');
        	var data = object.data;
        	console.log(data);
        });
	}

	this.getStudents = function(){
		var reqUrl = 'http://sandbox.graph.hmhco.com/v4/students?facet=summary';
		token = JSON.parse(storage.token);

		return $http({
			method  : 'GET',
			url     : reqUrl,
            headers : {
            	'Vnd-HMH-Api-Key': apiKey,
            	'Authorization': token.access_token,
            	'Accept': 'application/json'
            },
        }).then(function(object){
        	data = object.data;
			console.log('GETSTUDENTS OK');
			console.log(data);
			return data.data;
        }, function(object){
        	data = object.data;
        	console.log('GETSTUDENTS ERROR');
        	console.log(data);
        	return null;
        });
	}

	this.getStudent = function(id){
		var reqUrl = 'http://sandbox.graph.hmhco.com/v4/students/' + id + '?facet=detail';
		token = JSON.parse(storage.token);
		
		return $http({
			method  : 'GET',
			url     : reqUrl,
            headers : {
            	'Vnd-HMH-Api-Key': apiKey,
            	'Authorization': token.access_token,
            	'Accept': 'application/json'
            },
        }).then(function(object){
        	data = object.data;
			console.log('GETSTUDENT OK');
			console.log(data);
			return data.data;
        }, function(object){
        	data = object.data;
        	console.log('GETSTUDENT ERROR');
        	console.log(data);
        	return null;
        });

	};

	this.getDominant = function(id){
		var reqUrl = 'http://ny-liwil.cloudapp.net/ind/dominant?studentId=' + id;

		return $http({
			method  : 'GET',
			url     : reqUrl
        }).then(function(object){
        	dominantTrait = object.data;
			console.log('GETRECCOMENDATIONS OK1');
			console.log(dominantTrait);
			return dominantTrait.charAt(0).toUpperCase() + dominantTrait.slice(1);
        }, function(object){
        	data = object.data;
        	console.log('GETRECCOMENDATIONS ERROR1');
        	console.log(data);
        	return null;
        });
	};

	this.getRecommendations = function(dominantTrait){
		var reqUrl = 'http://ny-liwil.cloudapp.net/ind/recommendation?type=' + dominantTrait;

		return $http({
			method: 'GET',
			url: reqUrl
		}).then(function(object){
			data = object.data;
			console.log('GETRECCOMENDATIONS OK2');
			console.log(object);
			return data.data;
		}, function(object){
			console.log('GETRECCOMENDATIONS ERROR2');
			return null;
		});
	};

	this.upload = function(id){
		//var reqUrl = 'http://ny-liwil.cloudapp.net/load?studentId=' + id;
		var reqUrl = 'http://ny-liwil.cloudapp.net/load';

		return $http({
			method  : 'POST',
			url     : reqUrl,
			headers : {
				'Content-Type': 'application/json'
			},
			data    : {
				'studentId' : id
			}
        }).then(function(object){
        	data = object.data;
			console.log('GETSTUDENT OK');
			console.log(data);
			return data.data;
        }, function(object){
        	data = object.data;
        	console.log('GETSTUDENT ERROR');
        	console.log(data);
        	return null;
        });		
	};
}]);

mod.controller('homeController', ['$location', function($location){
	var vm = this;
	vm.begin = function() {
		$location.path('/login');
	}

}]);

mod.controller('loginController', ['$location', 'util', function($location, util){ 
	var vm = this;
	vm.user = 'gandalf';
	vm.pass = 'password';

	vm.login = function() {
		util.login(vm.user, vm.pass).then(function(){
			$location.path('/class');
		});
	}
}]);

mod.controller('classController', ['$location', 'util', function($location, util){
	var vm = this;

	util.getStudents().then(function(data){
		vm.students = data;
		console.log('CLASSCON:');
		console.log(data);
	});

	vm.detail = function(id){
		$location.path('/detail/' + id);
	}
}]);

mod.controller('detailController', ['$location', '$routeParams', 'util', function($location, $routeParams, util){
	var vm = this;
	vm.id = $routeParams.id;

	util.getStudent(vm.id).then(function(data){
		vm.student = data;
	});

	util.getDominant(vm.id).then(function(trait){
		console.log(trait);
		util.getRecommendations(trait).then(function(data){
			vm.teachingMethods = data['teaching methods'];
		}, function(data){
			console.log('FAIL');
		});
	});

	vm.upload = function(){
		util.upload(vm.id).then(function(data){
			console.log(data);
		});
	};
}]);