'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]).service('api',['$http','Base64',function ($http,Base64) {

    this.call=function (obj,api) {
        var authData="Basic "+Base64.encode(api.clientId+":"+api.clientSecret);
        var endpoint;
        console.log(obj);
        if(typeof obj.paths!=="undefined"){
            var str=obj.url;
            angular.forEach(obj.pathValue,function (val,key) {
                str=str.replace(":"+key,obj.pathValue[key]);
            });
            endpoint=str;
        }
        else endpoint=obj.url;

        if(obj.method=='GET'){
            return $http({
                url:api.baseUrl+endpoint,
                method: obj.method,
                headers: {
                    authorization: authData
                    //Origin: 'http://localhost'
                },
                params:obj.input
            });
        }

        if(obj.method=='POST'){
            return $http({
                url:api.baseUrl+endpoint,
                method: obj.method,
                headers: {
                    authorization: authData
                },
                data:obj.input
            });
        }
    };
    /*Upload file via angular js*/
    this.upload=function (obj,api,file) {

        var authData="Basic "+Base64.encode(api.clientId+":"+api.clientSecret);
        var endpoint;

        if(typeof obj.paths!=="undefined"){
            var str=obj.url;
            angular.forEach(obj.pathValue,function (val,key) {
                endpoint=str.replace(":"+key,obj.pathValue[key]);
            });
        }
        else endpoint=obj.url;

        if(obj.method=='UPLOAD'){
            console.log(obj);

            var form=new FormData();

            angular.forEach(obj.input,function (val,key) {
                    form.append(key,val);
            });
            /*Attached files*/
            angular.forEach(obj.params,function (val,key) {
                if(val=='file') {
                    if(typeof file !=='undefined'){
                        form.append(key, file[0]);
                    }
                }
            });
            //form.append('image', file[0]);
            console.log(form);

            return $http.post(api.baseUrl+endpoint,form,{
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    authorization: authData
                }
            });
        }
    }
}]).factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

}).controller('BaseController',['$scope','$rootScope','$http','api',function ($scope,$rootScope,$http,api) {

    $rootScope.$on("ApiData",function () {
        $scope.api=$rootScope.api;
    });

  $scope.apiResource=$('body').attr('data-url');

  $scope.endpoints= function (obj) {
      return Object.keys(obj).length;
  };

    $scope.LoadApi=function () {
        $scope.api=null;
        $http.get($scope.apiResource).then(function (result) {
            console.log(result.data);
            $scope.api=result.data;
        });
    };
    /*Deprecated with directive*/
    $scope.filesChanged=function (elm) {
        console.log(elm);
        $scope.files=elm.files;
        $scope.$apply();
        console.log($scope.files);
    };

  $scope.MakeRequest=function (obj) {

      if(obj.method!='UPLOAD') {
          api.call(obj, $scope.api).then(function (result) {
              obj.result = result;
              obj.status = false;
          },function (error) {
              obj.result = error;
          });
      }

      /*When a file upload occurs*/

      else{
          console.log(obj);
          var file = obj.uploadData;//$scope.files[0];
          //console.log($scope.files);
          api.upload(obj,$scope.api,file).then(function (result) {
              obj.result = result;
              obj.status = false;
          },function (error) {
              obj.result = error;
          });
      }
  };

  $scope.RequestResponse=function (json) {
      return JSON.stringify(json, undefined, 2);
  }
}]).directive('fileInput', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            element.bind('change', function(){
                $parse(attrs.fileInput)
                .assign(scope,element[0].files);
                scope.$apply();
            });
        }
    }
}]);
