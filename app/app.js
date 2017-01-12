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
        //console.log(api);
        //console.log(obj.pathValue);
        if(typeof obj.paths!=="undefined"){
            var str=obj.url;
            //console.log(typeof str);
            angular.forEach(obj.pathValue,function (val,key) {
                endpoint=str.replace(":"+key,obj.pathValue[key]);
            });
            //console.log(obj.url);
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

    /* jshint ignore:end */
}).filter('ParseJson',['$sce',function ($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
/*To be fixed*/
}]).filter('Prettify',['$sce',function ($sce) {
    return function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    };

    return $sce.trustAsHtml(syntaxHighlight);
}]).controller('BaseController',['$scope','$rootScope','$http','api',function ($scope,$rootScope,$http,api) {
    $rootScope.$on("ApiData",function () {
        $scope.api=$rootScope.api;
    });
  $scope.apiResource='http://path/to/api';

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
  $scope.MakeRequest=function (obj) {
      api.call(obj,$scope.api).success(function (result) {
          obj.result=result;
          obj.status=false;
      }).error(function (error) {
          obj.result=error;
      });
      //var input=$()
      //alert('make request');
  };
  $scope.RequestResponse=function (json) {
      //return JSON.stringify(json, undefined, 2);
      // JSON.stringify(obj, null, 2);
      json = typeof json !== 'undefined' ? json : {};

      if (typeof json != 'string') {
          json = JSON.stringify(json, undefined, 2);
      }
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
          var cls = 'number';
          if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                  cls = 'key';
              } else {
                  cls = 'string';
              }
          } else if (/true|false/.test(match)) {
              cls = 'boolean';
          } else if (/null/.test(match)) {
              cls = 'null';
          }
          return '<span class="' + cls + '">' + match + '</span>';
      });
  }
}]);
