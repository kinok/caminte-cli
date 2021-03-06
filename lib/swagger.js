/**
 * Created by Alex on 8/23/2016.
 */
var inflection = require('./inflection');
var fs = require('fs');
var path = require('path');

var schema = {
    define: function (model, fields, ind) {
        ind = ind || {};
        var inst = {
            model: model,
            fields: fields,
            primaryKeys: ind.primaryKeys || [],
            indexes: ind.indexes || {},
            validated: [],
            validate: function (field, callback, params) {
                "use strict";
                // todo:
            },
            validateAsync: function (field, callback, params) {
                "use strict";
                // todo:
            },
            validatesLengthOf: function (name, params) {
                "use strict";
                // todo:
            },
            validatesInclusionOf: function (name, params) {
                "use strict";
                // todo:
            },
            validatesExclusionOf: function (name, params) {
                "use strict";
                // todo:
            },
            validatesNumericalityOf: function (name, params) {
                "use strict";
                // todo:
            },
            validatesUniquenessOf: function (name, params) {
                "use strict";
                // todo:
            }
        };
        inst.validatesPresenceOf = function () {
            "use strict";
            for (var a in arguments) {
                if(typeof arguments[a] === 'string') {
                    inst.validated.push(arguments[a]);
                }
            }
        };
        inst.prototype = Object.prototype;
        return inst;
    }
};

schema.prototype = Object.prototype;

schema.Text = function Text() {
};
schema.JSON = schema.Json = function JSON() {
};
schema.Float = function Float() {
};
schema.Real = schema.Double = function Real() {
};
schema.Int = schema.Integer = function Integer() {
};
schema.UUID = schema.Uuid = function UUID() {
};
schema.TimeUUID = schema.TimeUuid = function TimeUUID() {
};
schema.CounterColumn = function CounterColumn() {
};
schema.Blob = schema.Bytes = function Blob() {
};

schema.Date = schema.Timestamp = Date;
schema.Boolean = schema.Tinyint = Boolean;
schema.Number = Number;
schema.String = schema.Varchar = String;

var models = {};
var defaultSwagger = {
    'swagger': '2.0',
    'info': {
        'title': 'Service API',
        'description': 'Service API',
        'version': '1.0.0',
        'termsOfService': 'http://example.com/terms/',
        'contact': {
            'email': 'api@example.com'
        },
        'license': {
            'name': 'Apache 2.0',
            'url': 'http://www.apache.org/licenses/LICENSE-2.0.html'
        }
    },
    'host': 'api.example.com',
    'schemes': [
        'http'
    ],
    'basePath': '/v1',
    'produces': [
        'application/json' // , 'application/xml'
    ],
    'paths': {},
    'definitions': {
        'Error': {
            'type': 'object',
            'properties': {
                'code': {
                    'type': 'integer',
                    'format': 'int32'
                },
                'message': {
                    'type': 'string'
                },
                'fields': {
                    'type': 'string'
                }
            }
        },
        'Count': {
            'type': 'object',
            'properties': {
                'count': {
                    'type': 'integer',
                    'format': 'int32'
                }
            }
        }
    }
};

module.exports.createSwagger = function (dstpath) {

    var modelDir = path.resolve(dstpath + 'models');
    var modelList = fs.readdirSync(modelDir);

    for (var m = 0; m < modelList.length; m++) {
        var modelFileName = modelList[m];
        if (/Model\.js$/i.test(modelFileName)) {
            var modelPath = modelDir + '/' + modelFileName;
            var modelName = modelFileName.replace(/Model\.js$/i, '');
            var modelLower = modelName.toString().toLowerCase();
            var modelPlural = modelLower.pluralize();
            var apiPath = '/' + modelPlural;
            models[modelName] = require(modelPath)(schema);

            defaultSwagger.definitions[modelName] = {
                'type': 'object',
                'properties': {}
            };

            defaultSwagger.paths[apiPath] = {
                'post': {
                    'summary': 'Save ' + modelName,
                    'description': 'Description for collection ' + modelName,
                    'operationId': 'save' + modelName,
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '201': {
                            'description': 'Operation create successful',
                            'schema': {
                                '$ref': '#/definitions/' + modelName
                            }
                        },
                        '405': {
                            'description': modelName + ' validation exception',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        '400': {
                            'description': 'Invalid parameters supplied',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                },
                'get': {
                    'summary': modelName.pluralize() + ' List',
                    'description': 'Description for collection ' + modelName,
                    'operationId': 'find' + modelPlural.camelize(),
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [
                        {
                            "name": "skip",
                            "type": "integer",
                            "in": "query",
                            "description": "Skip number of rows from ordered list",
                            "format": "int32"
                        },
                        {
                            "name": "limit",
                            "type": "integer",
                            "in": "query",
                            "description": "Select number of rows from ordered list",
                            "format": "int32"
                        },
                        {
                            "name": "search",
                            "type": "string",
                            "in": "query",
                            "description": "Search condition "
                        }
                    ],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '200': {
                            'description': 'An array of ' + modelLower.pluralize(),
                            'schema': {
                                'type': 'array',
                                'items': {
                                    '$ref': '#/definitions/' + modelName
                                }
                            }
                        },
                        '400': {
                            'description': 'Invalid parameters supplied',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                }
            };

            defaultSwagger.paths[apiPath + '/truncate'] = {
                'delete': {
                    'summary': 'Truncate all of ' + modelPlural,
                    'description': 'Description for collection ' + modelName,
                    'operationId': 'truncate' + modelPlural.camelize(),
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '204': {
                            'description': 'Successful operation'
                        },
                        '400': {
                            'description': 'Invalid parameters supplied',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                }
            };

            defaultSwagger.paths[apiPath + '/{id}'] = {
                'get': {
                    'summary': 'Get ' + modelLower + ' by ID',
                    'description': 'Returns a single ' + modelLower,
                    'operationId': 'get' + modelName + 'ById',
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [
                        {
                            'name': 'id',
                            'in': 'path',
                            'description': 'ID of ' + modelLower + ' to return',
                            'required': true,
                            'type': 'integer',
                            'format': 'int64'
                        }
                    ],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '200': {
                            'description': 'Successful operation',
                            'schema': {
                                '$ref': '#/definitions/' + modelName
                            }
                        },
                        '404': {
                            'description': modelName + ' not found',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        '400': {
                            'description': 'Invalid ID supplied',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                },
                'put': {
                    'summary': 'Update an existing ' + modelLower,
                    'description': 'Returns updated ' + modelLower,
                    'operationId': 'update' + modelName + 'ById',
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [
                        {
                            'name': 'id',
                            'in': 'path',
                            'description': 'ID of ' + modelLower + ' to update',
                            'required': true,
                            'type': 'integer',
                            'format': 'int64'
                        }
                    ],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '200': {
                            'description': 'Successful operation',
                            'schema': {
                                '$ref': '#/definitions/' + modelName
                            }
                        },
                        '405': {
                            'description': modelName + ' validation exception',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        '404': {
                            'description': modelName + ' not found',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        '400': {
                            'description': 'Invalid ID supplied',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                },
                'delete': {
                    'summary': 'Delete ' + modelLower + ' by ID',
                    'description': 'Returns a single ' + modelLower,
                    'operationId': 'delete' + modelName + 'ById',
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [
                        {
                            'name': 'id',
                            'in': 'path',
                            'description': 'ID of ' + modelLower + ' to delete',
                            'required': true,
                            'type': 'integer',
                            'format': 'int64'
                        }
                    ],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '204': {
                            'description': 'Successful operation'
                        },
                        '404': {
                            'description': modelName + ' not found',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        '400': {
                            'description': 'Invalid ID supplied',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                }
            };

            defaultSwagger.paths[apiPath + '/new'] = {
                'get': {
                    'summary': 'Create empty ' + modelLower,
                    'description': 'Returns a single ' + modelLower,
                    'operationId': 'create' + modelName + '',
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '200': {
                            'description': 'Successful operation',
                            'schema': {
                                '$ref': '#/definitions/' + modelName
                            }
                        },
                        '400': {
                            'description': 'Invalid parameters to create',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                }
            };

            defaultSwagger.paths[apiPath + '/count'] = {
                'get': {
                    'summary': 'Get amount of ' + modelLower,
                    'description': 'Returns a count of ' + modelLower,
                    'operationId': 'count' + modelPlural.camelize() + '',
                    'produces': [
                        'application/json' // , 'application/xml'
                    ],
                    'parameters': [],
                    'tags': [
                        modelPlural
                    ],
                    'responses': {
                        '200': {
                            'description': 'Successful operation',
                            'schema': {
                                '$ref': '#/definitions/Count'
                            }
                        },
                        '400': {
                            'description': 'Invalid params to count',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        },
                        'default': {
                            'description': 'Unexpected error',
                            'schema': {
                                '$ref': '#/definitions/Error'
                            }
                        }
                    }
                }
            };

            defaultSwagger.paths[apiPath].get.parameters.push({
                'name': 'id',
                'type': 'integer',
                'format': 'int64',
                'in': 'query',
                'description': 'The unique identifier for a ' + modelName
            });

            for (var field in models[modelName].fields) {
                var fullField = models[modelName].fields[field];
                if (fullField.type) {
                    var type = (fullField.type.name || 'string').toString().toLowerCase();
                    var fullParam = {
                        'name': field,
                        'type': type,
                        'in': 'formData',
                        'description': 'Description for field ' + field
                    };
                    var defField = {
                        'description': 'Description for field ' + field
                    };
                    defField.type = type;

                    switch (type) {
                        case 'number':
                            fullParam.type = 'integer';
                            fullParam.format = (fullField.limit && fullField.limit > 11) ? 'int64' : 'int32';
                            defField.format = (fullField.limit && fullField.limit > 11) ? 'int64' : 'int32';
                            break;
                        case 'float':
                        case 'double':
                        case 'real':
                            fullParam.type = 'number';
                            fullParam.format = type === 'real' ? 'double' : type;
                            defField.format = type === 'real' ? 'double' : type;
                            break;
                        case 'bool':
                        case 'boolean':
                            fullParam.type = 'boolean';
                            break;
                        case 'date':
                            fullParam.type = 'string';
                            fullParam.format = 'date';
                            defField.type = 'string';
                            defField.format = 'date';
                            break;
                        case 'json':
                            fullParam.type = 'string';
                            fullParam.format = 'object';
                            defField.type = 'string';
                            defField.format = 'object';
                            break;
                        default:
                            fullParam.type = 'string';
                            defField.type = 'string';

                    }

                    var validated = models[modelName].validated;
                    if (validated.indexOf(field) !== -1) {
                        fullParam.required = true;
                    }
                    if (fullField.limit && '|string|'.indexOf(type) !== -1) {
                        fullParam.maxLength = fullField.limit;
                    }
                    // if (fullField.limit && '|number|float|real|double|'.indexOf(type)) {
                    //     fullParam.maximum = fullField.limit;
                    // }
                    if(defField.default && '|string|number|float|real|double|boolean|'.indexOf(type) !== -1) {
                        fullParam.default = defField.default;
                    }
                    defaultSwagger.paths[apiPath].post.parameters.push(fullParam);
                    defaultSwagger.paths[apiPath + '/{id}'].put.parameters.push(fullParam);
                    defaultSwagger.definitions[modelName].properties[field] = defField;
                }
            }

        }
    }

    fs.writeFileSync(dstpath + 'swagger.json', JSON.stringify(defaultSwagger, null, 4), 'utf8');
    console.log('generated ' + dstpath + 'swagger.json')

};
