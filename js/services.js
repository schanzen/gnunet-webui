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

//"127.0.0.1/credential/issue?attribute=test&subject_key=A0XSAYRCJ0RVMXJD3KH3ZZSH7V6QJVXJ09MPQA1Q3ZCHDMDPKKM0&expiration=1d"
identityServices.factory('CredentialIssuer', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/credential/issue?attribute=:attribute&subject_key=:subject_key&expiration=:expiration', {}, {
      issue: {method:'GET', params:{}, isArray:false},
    });
}]);
//"127.0.0.1:7776/credential/verify?attribute=MMF1Q36DF0MB6RVT05BNQTYFMS2A8T9R0P5Q2203AZTAQ4X199Q0.user&credential=H1Z20XQ56DYDR6R9QM5J8DHF1MMMZ6G9HMM7CW73ZMTCCSFB24E0.mygnunetcreds"
identityServices.factory('CredentialVerifier', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/credential/verfiy?attribute=:attribute&credential=:credential', {}, {
      verify: {method:'GET', params:{}, isArray:false},
    });
}]);

identityServices.factory('Attributes', ['$resource',
  function($resource){
    return $resource('http://localhost:7776/names/:attrName?ego=:identityName&record_type=ID_ATTR', {}, {
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
    return $resource('http://localhost:7776/idp/issue?issuer=:issuer&audience=:audience&requested_attrs=:attributes&expiration=:expiration&nonce=:nonce', {}, {
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
