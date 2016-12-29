'use strict';

/* Services */

var identityServices = angular.module('identityServices', ['ngResource']);

identityServices.factory('Identity', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/identity/:identityId', { identityId : '@id'}, {
      query: {method:'GET', params:{}, isArray:false},
      remove: {method:'DELETE', params:{}, isArray:false}
    });
  }]);

identityServices.factory('Attributes', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/names/:attrName?ego=:identityName&record_type=ID_ATTR', {}, {
      query: {method:'GET', params:{}, isArray:false},
      remove: {method:'DELETE', params:{}, isArray:false}
    });
  }]);
identityServices.factory('Credentials', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/names/:attrName?ego=:identityName&record_type=CRED', {}, {
      query: {method:'GET', params:{}, isArray:false},
      remove: {method:'DELETE', params:{}, isArray:false}
    });
  }]);

identityServices.factory('ReverseNames', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/names/zkey?zkey=:zkey', {}, {
      query: {method:'GET', params:{}, isArray:false},
    });
  }]);
identityServices.factory('IdTokenIssuer', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/idp/issue?issuer=:issuer&audience=:audience&requested_attrs=:attributes&expiration=:expiration&nonce=:nonce&requested_verified_attrs=:verified_attributes', {}, {
      issue: {method:'GET', params:{}, isArray:false},
    });
  }]);

identityServices.factory('Grants', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/names/:recordName?ego=:identityName&record_type=ID_TOKEN_METADATA', {}, {
      query: {method:'GET', params:{}, isArray:false},
      remove: {method:'DELETE', params:{}, isArray:false}
    });
  }]);

identityServices.factory('colorService', function(){
    function hashCode(str) { // java String#hashCode
          var hash = 0;
              for (var i = 0; i < str.length; i++) {
                       hash = str.charCodeAt(i) + ((hash << 5) - hash);
                           }
                  return hash;
    }; 
    return {
      intToRGB: function(i) {
        i = hashCode(i);
        var c = (i & 0x00FFFFFF)
                  .toString(16)
                          .toUpperCase();

            return "#" + "00000".substring(0, 6 - c.length) + c;
      }
    };
});

identityServices.factory('jwtService', function(){
  return {
    getJwtForId: function(identity, requestor) {
      // Header
      var oHeader = {alg: 'HS256', typ: 'JWT'};
      // Payload
      var oPayload = {};
      var tNow = KJUR.jws.IntDate.get('now');
      var tEnd = KJUR.jws.IntDate.get('now') + 360;
      oPayload.iss = identity.key;
      oPayload.sub = identity.id;
      oPayload.nbf = tNow;
      oPayload.iat = tNow;
      oPayload.exp = tEnd;
      oPayload.jti = "id123456";
      oPayload.aud = requestor;
      // Sign JWT, password=616161
      var sHeader = JSON.stringify(oHeader);
      var sPayload = JSON.stringify(oPayload);
      // Remove padding equal characters
      var encodedSource = identity.gnuid_token.replace(/=+$/, '');
      
      // Replace characters according to base64url specifications
      //encodedSource = encodedSource.replace(/\+/g, '-');
      //encodedSource = encodedSource.replace(/\//g, '_');
      return encodedSource;
      //return KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "616161");
    }
  };
});
