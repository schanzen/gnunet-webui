'use strict';

/* Controllers */

var identityControllers = angular.module('identityControllers', []);


identityControllers.controller('IdentityListCtrl', ['$scope', 'Identity', 'colorService', 'jwtService', '$location', '$window', 'Grants', 'ReverseNames',
                               function($scope, Identity, colorService, jwtService, $location, $window, Grants, ReverseNames) {
                                 Identity.query(function(data) {
                                   $scope.identities = data.data;
                                 });
                                 $scope.orderProp = 'age';
                                 $scope.intToRGB = function(i) { return colorService.intToRGB(i); };
                                 $scope.new_identity = new Identity();
                                 $scope.new_identity.data = new Object();
                                 $scope.new_identity.data.id = "";
                                 $scope.new_identity.data.attributes = new Object();
                                 $scope.new_identity.data.type = "ego";
                                 $scope.new_identity.data.attributes.name = "";
                                 $scope.id_request = $location.search().r;
                                 if (undefined !== $scope.id_request)
                                 {
                                   var params = $scope.id_request.split("?")[1].split("&");
                                   var i;
                                   for (i = 0; i < params.length; i++)
                                   {
                                     var keyval = params[i].split("=");
                                     if ("client_id" === keyval[0]) {
                                       $scope.client_id = keyval[1];
                                       $scope.selectIdentity = keyval[1];
                                     } else if ("requested_attrs" === keyval[0]) {
                                       $scope.requested_attrs = keyval[1];
                                     } else if ("requested_verified_attrs" === keyval[0]) {
                                       $scope.requested_verified_attrs = keyval[1];
                                     } else if ("redirect_uri" === keyval[0]) {
                                       $scope.redirect_uri = keyval[1];
                                     } else if ("issue_type" === keyval[0]) {
                                       $scope.issue_type = keyval[1];
                                     } else if ("nonce" === keyval[0]) {
                                       $scope.nonce = keyval[1];
                                     }
                                     $scope.goToIdentity = function (identity) {
                                       $window.location.href = "/index.html#/identities/"
                                         +identity.id
                                         +"?redirect_uri="+$scope.redirect_uri
                                         +"&issue_type="+$scope.issue_type
                                         +"&requested_attrs="+$scope.requested_attrs
                                         +"&requested_verified_attrs="+$scope.requested_verified_attrs
                                         +"&client_id="+$scope.client_id
                                         +"&nonce="+$scope.nonce;
                                       return;
                                     }
                                     ReverseNames.query({zkey:$scope.client_id}).$promise.then (function(data) {
                                       if (data.data.length === 1) {
                                         $scope.selectIdentity = data.data[0].attributes.name;
                                       }
                                     });
                                 }
                                 }
                                 $scope.addIdentity = function() {

                                   Identity.save($scope.new_identity).$promise.then (function(result) {
                                     Identity.query(function(data) {
                                       $scope.identities = data.data;
                                       $scope.new_identity.data.attributes.name = "";
                                     });
                                   });
                                 };
                                 $scope.removeIdentity = function(identity) {
                                   Identity.remove({ identityId: identity.id }).$promise.then (function(result) {
                                     Identity.query(function(data) {
                                       $scope.identities = data.data;
                                     });
                                   });
                                 };
                               }]);
identityControllers.controller('IdentityDetailCtrl', ['$scope', 'storage','$routeParams', 'Identity', 'Attributes', 'Grants', '$location', 'IdTokenIssuer', '$window', 'colorService', 'ReverseNames', 'Credentials', 'SaveCredentials',
                               function($scope, storage, $routeParams, Identity, Attributes, Grants, $location, IdTokenIssuer, $window, colorService, ReverseNames, Credentials, SaveCredentials) {
                                 $scope.selectedRelExpiration = "1d";
                                 

                                 $scope.intToRGB = function(i) { return colorService.intToRGB(i); };

                                 Identity.get({identityId: $routeParams.identityId}, function (data) {}).$promise.then (function (result) {
                                   $scope.identity = result.data[0];
                                   $scope.identityName = $scope.identity.attributes.name;
                                   $scope.isCollapsed = 'false';
                                   $scope.attrs = [];
                                   $scope.newCredName="";
                                   $scope.missingAttrs = [];
                                   $scope.req_attribute_values = {};
                                   $scope.requestedInfos = [];
                                   $scope.client_id = $location.search().client_id;
                                   $scope.nonce = $location.search().nonce;
                                   $scope.requested_attrs = $location.search().requested_attrs;
                                   $scope.requested_verified_attrs = $location.search().requested_verified_attrs;
                                   $scope.creds = decodeURIComponent($location.search().credential);
                                   $scope.new_credential = JSON.parse($scope.creds);
                                    storage.clearAll();
                                    // storage.bind($scope, ['sampleData', 'credID', 'credAttribute', 'credIssuer', 'credExp'], {
                                    //     defaultValue: []
                                    // });
                                    storage.bind($scope, 'sampleData', {
                                        defaultValue: []
                                    });
                                    storage.bind($scope, 'credID', {
                                        defaultValue: []
                                    });
                                    storage.bind($scope, 'credAttribute', {
                                        defaultValue: []
                                    });
                                    storage.bind($scope, 'credIssuer', {
                                        defaultValue: []
                                    });
                                    storage.bind($scope, 'credExp', {
                                        defaultValue: []
                                    });
                                    $scope.getNewCred = function() {
                                        var new_credential = $scope.new_credential;
                                        console.log(JSON.stringify(new_credential));
                                        var credential_attribute = $scope.new_credential["data"][0]["id"].split(".")["1"];
                                        var credential_ID = $scope.new_credential["data"][0]["id"];
                                        var credential_issuer = $scope.new_credential["data"][0]["attributes"]["credential"]["issuer"];
                                        var credential_expiration = $scope.new_credential["data"][0]["attributes"]["credential"]["expiration"];

                                        if ($scope.sampleData.indexOf(JSON.stringify(new_credential)) === -1) {
                                            $scope.sampleData.push(new_credential);
                                            $scope.credID.push(JSON.stringify(credential_ID));
                                            $scope.credAttribute.push(JSON.stringify(credential_attribute));
                                            $scope.credIssuer.push(JSON.stringify(credential_issuer));
                                            $scope.credExp.push(JSON.stringify(credential_expiration));
                                        }
                                    };
                                    $scope.saveCredentialName = function(btnID, newName) {
                                        var subject_key = JSON.stringify($scope.new_credential["data"][0]["attributes"]["credential"]["subject"]);
                                        var signature = JSON.stringify($scope.new_credential["data"][0]["attributes"]["credential"]["signature"]);
                                        var editItems = [];
                                        editItems.push({
                                            "data": [{
                                                "id": newName,
                                                "type": "record",
                                                "attributes": {
                                                    "record": [{
                                                        "record_type": "CRED",
                                                        "value": JSON.parse($scope.credID) + " -> " +
                                                            subject_key.replace(/"/g, '') + " | " +
                                                            signature.replace(/"/g, '') + " | " +
                                                            $scope.credExp + ' ',
                                                        "expiration": "1 day"
                                                    }]
                                                }
                                            }]
                                        });
                                      
                                      
                                      var saveNameValue = {data: editItems};
                                      console.log("saveNameValue:  "+  JSON.stringify(saveNameValue.data));
                                      
                                      SaveCredentials.save({
                                          ego: $scope.identity.attributes.name
                                      }, {
                                          data: saveNameValue.data
                                      }).$promise.then(function(result) {
                                          // var index = $scope.credID.indexOf(btnID);
                                          // $scope.credID.splice(index, 1);
                                      });
                                    };   
                                   if (undefined !== $scope.requested_attrs) {
                                     $scope.requestedInfos = $scope.requested_attrs.split(",");
                                   }
                                   if (undefined !== $scope.requested_verified_attrs) {
                                     $scope.requestedVerifiedAttrs = $scope.requested_verified_attrs.split(",");
                                   }
                                   $scope.getVerifiedAttrs = function() {
                                     return $scope.requestedVerifiedAttrs;
                                   }
                                   $scope.redirect_uri = decodeURIComponent($location.search().redirect_uri);
                                   $scope.issue_type = $location.search().issue_type;
                                   $scope.selectIdentity = $scope.client_id;

                                   
                                   $scope.saved = localStorage.getItem ('default_identities');
                                   $scope.audiences = 
                                     (localStorage.getItem ('default_identities')!==null) ?
                                     JSON.parse ($scope.saved) : [];
                                   localStorage.setItem ('default_identities', JSON.stringify ($scope.audiences));
                                   
                                   if (undefined != $scope.client_id) {
                                     ReverseNames.query({zkey:$scope.client_id}).$promise.then (function(data) {
                                       if (data.data.length === 1) {
                                         $scope.selectIdentity = data.data[0].attributes.name;
                                       }
                                     });
                                   }

                                   for (var i = 0; i < $scope.requestedInfos.length; i++) {
                                     $scope.req_attribute_values[$scope.requestedInfos[i]] = [];
                                   }
                                   $scope.updateAttrs = function (attributes) {
                                     $scope.attrs = [];
                                     if (attributes.data instanceof Array) {
                                       for (var i = 0; i < attributes.data.length; i++)
                                       {
                                         $scope.attrs.push(attributes.data[i].id);
                                       }
                                     } else {
                                       $scope.attrs.push(attributes.data.id);
                                     }
                                     $scope.missingAttrs = [];
                                     for (var i = 0; i < $scope.requestedInfos.length; i++) {
                                       if (-1 == $scope.attrs.indexOf($scope.requestedInfos[i])) {
                                         $scope.missingAttrs.push($scope.requestedInfos[i]);
                                       }
                                     }
                                   }
                                   $scope.attributes = Attributes.get({identityName: $scope.identity.attributes.name}, function(attributes) {
                                     $scope.updateAttrs(attributes);
                                   });
                                   $scope.credentials = Credentials.query({identityName: $scope.identity.attributes.name}, function(credentials) {
                                     
                                   });
                                   $scope.getAttrs = function () {
                                     if (undefined == $scope.attributes.data) {
                                       return [];
                                     }
                                     if ($scope.attributes.data instanceof Array) {
                                       return $scope.attributes.data;
                                     } else {
                                       return [$scope.attributes.data];
                                     }
                                   }
                                   $scope.getCreds = function () {
                                     if (undefined == $scope.credentials) {
                                       return [];
                                     }
                                     return $scope.credentials.data;
                                   }
                                   $scope.getAttributeName = function(cred) {
                                      return cred.attributes.record[0].value.split("->")[0].split(".")[1];
                                   }
                                   $scope.getCredExpiration = function(cred) {
                                     var arr = cred.attributes.record[0].value.split("|");
                                     return $scope.toDate(arr[arr.length-1]);
                                   }
                                   $scope.getIssuer = function(cred) {
                                     return cred.attributes.record[0].value.split(".")[0];
                                   }

                                   $scope.audRealNames = {};
                                   $scope.grants = Grants.get({identityName: $scope.identity.attributes.name}).$promise.then (function(attributes) {
                                     //Get real names for audiences
                                     if (null == attributes.data)
                                     {
                                       return;
                                     }
                                     for (var i = 0; i < attributes.data.length; i++) {
                                       var aud = $scope.getSubjectForGrant(attributes.data[i]);
                                       ReverseNames.query({zkey:aud}).$promise.then (function(data) {
                                         $scope.audRealNames[aud] = aud;
                                         $scope.audRealNames[data.data.id] = data.data.attributes.name;
                                       });
                                     }
                                     $scope.grants = attributes;
                                   });
                                   $scope.getSubjectForGrant = function(grant) {
                                     return grant.attributes.record[0].value.split(";")[1];
                                     //return JSON.parse(atob(grant.record[0].value.split(".")[1])).aud;
                                   };
                                   $scope.getRealNameForAud = function (grant) {
                                     var aud = $scope.getSubjectForGrant(grant);
                                     if (null !== $scope.audRealNames[aud])
                                       return $scope.audRealNames[aud];
                                     else
                                       return aud;
                                   };
                                   $scope.decodeGrantToken = function (grant) {
                                     //var parts = grant.record[0].value.split(".");
                                     //var res = {header:atob(parts[0]), content:atob(parts[1]), signature:parts[2]};
                                     return {};//JSON.parse(res.content);
                                   };

                                   $scope.new_attribute = new Attributes();
                                   $scope.new_attribute.data = new Object();
                                   $scope.new_attribute.data.id = "";
                                   $scope.new_attribute.data.type = "record";
                                   $scope.new_attribute.data.attributes = new Object();
                                   $scope.new_attribute.data.attributes.record = [];

                                   $scope.addAttribute = function() {
                                     var attrs_to_save = $scope.new_attribute_values.split(",");
                                     for (var i = 0; i<attrs_to_save.length; i++) {
                                       var rec = new Object();
                                       rec["expiration"] = "never";
                                       rec["record_type"] = "ID_ATTR";
                                       rec["value"] = attrs_to_save[i];
                                       $scope.new_attribute.data.attributes.record.push(rec);
                                     }


                                     Attributes.save({identityName: $scope.identity.attributes.name}, $scope.new_attribute).$promise.then (function(result) {
                                       $scope.attributes = Attributes.get({identityName: $scope.identity.attributes.name}, function(attributes) {
                                         $scope.updateAttrs(attributes);
                                         $scope.new_attribute.data.record = [];
                                         $scope.new_attribute.data.id = "";
                                         $scope.new_attribute_values = "";

                                       });

                                     });
                                   };
                                   $scope.addRequestedAttribute = function(requestedAttribute) {
                                     var new_attribute = new Attributes();
                                     new_attribute.data = new Object();
                                     new_attribute.data.type = "record";
                                     new_attribute.data.record = [];
                                     new_attribute.data.id = requestedAttribute;
                                     var attrs_to_save = $scope.req_attribute_values[requestedAttribute].split(",");
                                     for (var i = 0; i<attrs_to_save.length; i++) {
                                       var rec = new Object();
                                       rec["expiration"] = "never";
                                       rec["record_type"] = "ID_ATTR";
                                       rec["value"] = attrs_to_save[i];
                                       new_attribute.data.record.push(rec);
                                     }

                                     Attributes.save({identityName: $scope.identity.attributes.name}, new_attribute).$promise.then (function(result) {
                                       $scope.attributes = Attributes.get({identityName: $scope.identity.attributes.name}, function(attributes) {
                                         $scope.updateAttrs(attributes);
                                       });

                                     });
                                   };

                                   $scope.removeAttribute = function(attr) {
                                     Attributes.remove({ identityName: $scope.identity.attributes.name, attrName: attr.id}).$promise.then (function(result) {
                                       $scope.attributes = Attributes.get({identityName: $scope.identity.attributes.name}, function(attributes) {
                                         $scope.updateAttrs(attributes);
                                         $scope.new_attribute.data.record = [];
                                         $scope.new_attribute.data.id = "";
                                         $scope.new_attribute_values = "";

                                       });
                                     });
                                   };

                                   Date.prototype.yyyymmdd = function() {
                                     var yyyy = this.getFullYear().toString();
                                     var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
                                     var dd  = this.getDate().toString();
                                     var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
                                     var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
                                     var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
                                     return yyyy + "/" + (mm[1]?mm:"0"+mm[0])+ "/" + (dd[1]?dd:"0"+dd[0]) + " " + hh + ":" + min + ":" + ss; // padding
                                   };
                                   Date.prototype.gnunetdate = function() {
                                     var yyyy = this.getFullYear().toString();
                                     var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
                                     var dd  = this.getDate().toString();
                                     var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
                                     var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
                                     var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
                                     return yyyy + "-" + (mm[1]?mm:"0"+mm[0])+ "-" + (dd[1]?dd:"0"+dd[0]) + " " + hh + ":" + min + ":" + ss; // padding
                                   };
                                   $scope.toDate = function (unixtime) {
                                     return (new Date(unixtime / 1000)).yyyymmdd();
                                   };
                                   $scope.isExpired = function (grant) {
                                     return ("true" === grant.attributes.record[0].expired);
                                   }
                                   $scope.getAttrsInGrant = function (grant) {
                                     /*var decoded = $scope.decodeGrantToken(grant);
                                       var ret = [];
                                       for (var key in decoded) {
                                       if (key !== "sub" && key !== "iat" && key !== "iss" && key !== "exp" && key !== "nbf" && key !== "aud" && key !== "rnl")
                                       ret.push(key);
                                       }*/
                                     return grant.attributes.record[0].value.split(";")[2].split(",");
                                   }
                                   $scope.removeGrant = function(grant) {
                                     var dec_token = $scope.decodeGrantToken(grant);
                                     Grants.remove({ identityName: $scope.identity.attributes.name, recordName: grant.id }).$promise.then (function(result) {
                                       $scope.grants = Grants.get({identityName: $scope.identity.attributes.name}, function(attributes) {});

                                     });
                                   };

                                   $scope.getMissingAttrs = function () {
                                     var i = 0;
                                     var ret = [];
                                     for (var i = 0; i < $scope.requestedInfos.length; i++) {
                                       if ($scope.attrs.indexOf($scope.requestedInfos[i]) == -1) {
                                         ret.push($scope.requestedInfos[i]);
                                       }
                                     }
                                     return ret;
                                   }

                                   $scope.requestedAttributeMissing = function() {
                                     var i = 0;
                                     for (var i = 0; i < $scope.requestedInfos.length; i++) {
                                       if ($scope.attrs.indexOf($scope.requestedInfos[i]) == -1) {
                                         return true;
                                       }
                                     }
                                     return false;
                                   };
                                   $scope.notRequestedAttributeShared = function() {
                                     var i = 0;
                                     for (var i = 0; i < $scope.attrs.length; i++) {
                                       if ($scope.requestedInfos.indexOf($scope.attrs[i]) == -1) {
                                         return true;
                                       }
                                     }
                                     return false;
                                   };


                                   $scope.isDefaultForAudience = function () {
                                     var i = 0;
                                     for (i = 0; i < $scope.audiences.length; i++)
                                     {
                                       if ($scope.audiences[0].aud === $scope.client_id &&
                                           $scope.audiences[0].iss === $scope.identity.attributes.name)
                                       {
                                         return true;
                                       }
                                     }
                                     return false;
                                   };
                                   $scope.setAsDefaultForAudience = function() {
                                     var saved = localStorage.getItem ('default_identities');
                                     $scope.audiences.push({
                                       aud: $scope.client_id,
                                       iss: $scope.identity.attributes.name
                                     });
                                     localStorage.setItem('default_identities', JSON.stringify($scope.audiences));
                                   };

                                   $scope.acceptRequest = function() {
                                     //Get GNUid Token
                                     var requestor = $scope.client_id;
                                     var exp = $scope.selectedRelExpiration;

                                     IdTokenIssuer.issue ({issuer: $scope.identityName, audience: requestor, attributes: $scope.attrs, expiration: exp, nonce: $scope.nonce, verified_attributes: $scope.requested_verified_attrs}).$promise.then (function (tokenData) {
                                       if ('ticket' === $scope.issue_type) {
                                         $window.location.href = $scope.redirect_uri
                                           +"?ticket="+tokenData.data[0].attributes.ticket
                                       } else if ('direct' === $scope.issue_type) {
                                         $window.location.href = $scope.redirect_uri +
                                           "#token="+encodeURIComponent(tokenData.data[0].attributes.token)
                                       }
                                     });
                                   }

                                 });

                               }]);