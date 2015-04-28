angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/multiselect/multiselect.html","<div class=\"form-group {{form.htmlClass}} schema-form-multiselect\"\n     ng-class=\"{\'has-error\': hasError(), \'has-success\': hasSuccess(), \'has-feedback\': form.feedback !== false}\">\n    <label class=\"control-label\" ng-show=\"showTitle()\">{{form.title}}</label>\n    <select ng-model=\"$$value$$\"\n          ng-model-options=\"form.ngModelOptions\"\n          multiple=\"multiple\"\n          sf-multiple=\"form.multiple\"\n          ng-disabled=\"form.readonly\"\n          sf-changed=\"form\"\n          class=\"form-control {{form.fieldHtmlClass}}\"\n          schema-validate=\"form\"\n          ng-options=\"item.value as item.name group by item.group for item in form.titleMap\"\n          ng-required=\"form.required\"\n          name=\"{{form.key.slice(-1)[0]}}\"\n          multiselect-config=\"{{form.multiselectConfig}}\">\n    </select>\n\n    <div class=\"help-block\" sf-message=\"form.description\"></div>\n</div>");
$templateCache.put("directives/decorators/bootstrap/multiselect/selectWithDefault.html","<div class=\"form-group {{form.htmlClass}} schema-form-select\"\n     ng-class=\"{\'has-error\': form.disableErrorState !== true && hasError(), \'has-success\': form.disableSuccessState !== true && hasSuccess(), \'has-feedback\': form.feedback !== false}\">\n  <label class=\"control-label {{form.labelHtmlClass}}\" ng-show=\"showTitle()\">\n    {{form.title}}\n  </label>\n  <select ng-model=\"$$value$$\"\n          ng-model-options=\"form.ngModelOptions\"\n          ng-disabled=\"form.readonly\"\n          sf-changed=\"form\"\n          class=\"form-control {{form.fieldHtmlClass}}\"\n          schema-validate=\"form\"\n          ng-options=\"item.value as item.name group by item.group for item in form.titleMap\"\n          ng-required=\"form.required\"\n          name=\"{{form.key.slice(-1)[0]}}\">\n      <option value=\"\" disabled selected hidden>{{form.selectDefault || \'Select ...\'}}</option>\n  </select>\n  <div class=\"help-block\" sf-message=\"form.description\"></div>\n</div>\n");}]);
angular.module('schemaForm').directive('sfMultiple', ['$http',
  function($http) {

    var defaultMultiselectConfig = {
      maxHeight: 305,
      enableCaseInsensitiveFiltering: true,
      inheritClass: false,
      nSelectedText: 'selected.',
      templates: {
        li: '<li class="multiSelectCheckbox"><a href="javascript:void(0);">' +
        '<label></label></a></li>'
      }
    };
    var multiselectConfig = {};

    return {
      restrict: 'A',
      require: ['ngModel'],
      scope: {
        ngModel: '='
      },
      link: function(scope, element, attrs) {
        if (!element.multiselect) {
          console.warn('bootstrap-multiselect not present.');
          return;
        }

        if (attrs.multiselectConfig) {
          angular.extend(multiselectConfig, defaultMultiselectConfig,
              JSON.parse(attrs.multiselectConfig));
        } else {
          multiselectConfig = defaultMultiselectConfig;
        }

        //console.log(defaultMultiselectConfig);
        //console.log(multiselectConfig);

        scope.$watch(attrs.ngIf, function() {
          console.log('init multiselect');
          element.multiselect(multiselectConfig)
        });
      }
    };

  }]);

angular.module('schemaForm')
    .directive('schemaValidate', ['sfUnselect', function(sfUnselect) {
      return {
        // We want the link function to be *after* the main schema-validate directive.
        priority: 600,
        link: function(scope, element, attrs) {

          var DEFAULT_DESTROY_STRATEGY;
          if (scope.options && scope.options.formDefaults) {
            var formDefaultDestroyStrategy = scope.options.formDefaults.destroyStrategy;
            var isValidFormDefaultDestroyStrategy = (formDefaultDestroyStrategy === undefined ||
            formDefaultDestroyStrategy === '' ||
            formDefaultDestroyStrategy === null ||
            formDefaultDestroyStrategy === 'retain');
            if (isValidFormDefaultDestroyStrategy) {
              DEFAULT_DESTROY_STRATEGY = formDefaultDestroyStrategy;
            } else {
              console.warn('Unrecognized formDefaults.destroyStrategy: \'%s\'. ' +
                  'Used undefined instead.', formDefaultDestroyStrategy);
              DEFAULT_DESTROY_STRATEGY = undefined;
            }
          }

          // Clean up the model when the corresponding form field is $destroy-ed.
          // Default behavior can be supplied as a formDefault, and behavior
          // can be overridden in the form definition.
          scope.$on('$destroy', function() {
            var form = scope.$eval(attrs.schemaValidate);
            // Either set in form definition, or as part of formDefaults.
            var destroyStrategy = form.destroyStrategy;
            var schemaType = getSchemaType();

            if (destroyStrategy && destroyStrategy !== 'retain') {
              // Don't recognize the strategy, so give a warning.
              console.warn('Unrecognized destroyStrategy: \'%s\'. Used default instead.',
                      destroyStrategy);
              destroyStrategy = DEFAULT_DESTROY_STRATEGY;
            } else if (schemaType !== 'string' && destroyStrategy === '') {
              // Only 'string' type fields can have an empty string value as a valid option.
              console.warn('Attempted to use empty string destroyStrategy on ' +
                      'non-string form type. Used default instead.');
              destroyStrategy = DEFAULT_DESTROY_STRATEGY;
            }

            if (destroyStrategy === 'retain') {
              return; // Valid option to avoid destroying data in the model.
            }

            destroyUsingStrategy(destroyStrategy);

            function destroyUsingStrategy(strategy) {
              var strategyIsDefined = (strategy === null ||
                        strategy === '' ||
                        typeof strategy == undefined);
              if (!strategyIsDefined) {
                strategy = DEFAULT_DESTROY_STRATEGY;
              }
              sfUnselect(scope.form.key, scope.model, strategy);
            }

            function getSchemaType() {
              if (form.schema) {
                schemaType = form.schema.type;
              } else {
                schemaType = null;
              }
            }
          });
        }
      };
    }]);

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
      function(schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {

        var multiselect = function(name, schema, options) {
          if (schema.type === 'string' && schema.multiple === 'multiple' &&
              schema.items && schema.items['enum']) {
            var f = stdFormObj(name, schema, options);
            f.key = options.path;
            f.type = 'multiselect';
            if (!f.titleMap) {
              f.titleMap = enumToTitleMap(schema.items['enum']);
            }
            options.lookup[sfPathProvider.stringify(options.path)] = f;
            return f;
          }
        };
        schemaFormProvider.defaults.string.unshift(multiselect);

        //Add to the bootstrap directive
        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'multiselect',
            'directives/decorators/bootstrap/multiselect/multiselect.html'
        );
        schemaFormDecoratorsProvider.createDirective(
            'multiselect',
            'directives/decorators/bootstrap/multiselect/multiselect.html'
        );
      }
    ]
);

angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
      function(schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {

        var selectWithDefault = function(name, schema, options) {
          if (schema.type === 'string' && schema['enum']) {
            var f = stdFormObj(name, schema, options);
            f.key  = options.path;
            f.type = 'selectWithDefault';
            if (!f.titleMap) {
              f.titleMap = enumToTitleMap(schema['enum']);
            }
            options.lookup[sfPathProvider.stringify(options.path)] = f;
            return f;
          }
        };

        schemaFormProvider.defaults.string.unshift(selectWithDefault);

        //Add to the bootstrap directive
        schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'selectWithDefault',
            'directives/decorators/bootstrap/multiselect/selectWithDefault.html'
        );
        schemaFormDecoratorsProvider.createDirective(
            'selectWithDefault',
            'directives/decorators/bootstrap/multiselect/selectWithDefault.html'
        );
      }
    ]
);

angular.module('schemaForm').factory('sfUnselect', ['sfPath', function(sfPath) {
  var numRe = /^\d+$/;

  /**
   * @description
   * Utility method to clear deep properties without
   * throwing errors when things are not defined.
   * DOES NOT create objects when they are missing.
   *
   * Based on sfSelect.
   *
   * ex.
   * var foo = Unselect('address.contact.name',obj, null)
   * var bar = Unselect('address.contact.name',obj, undefined)
   * Unselect('address.contact.name',obj,'')
   *
   * @param {string} projection A dot path to the property you want to set
   * @param {object} obj   (optional) The object to project on, defaults to 'this'
   * @param {Any}    unselectValue   The value to set; if parts of the path of
   *                 the projection is missing empty objects will NOT be created.
   * @returns {Any|undefined} returns the value at the end of the projection path
   *                          or undefined if there is none.
   */
  return function(projection, obj, unselectValue) {
    if (!obj) {
      obj = this;
    }
    //Support [] array syntax
    var parts = typeof projection === 'string' ? sfPath.parse(projection) : projection;
    //console.log(parts);

    if (parts.length === 1) {
      //Special case, just setting one variable

      //console.log('Only 1 variable in parts');
      obj[parts[0]] = unselectValue;
      return obj;
    }

    if (typeof obj[parts[0]] === 'undefined') {
      // If top-level part isn't defined.
      var isArray = numRe.test(parts[1]);
      if (isArray) {
        //console.info('Expected array as top-level part, but is already undefined. Returning.');
        return undefined;
      } else if (parts.length > 2) {
        obj[parts[0]] = {};
      }
    }

    var value = obj[parts[0]];
    for (var i = 1; i < parts.length; i++) {
      // Special case: We allow JSON Form syntax for arrays using empty brackets
      // These will of course not work here so we exit if they are found.
      if (parts[i] === '') {
        return undefined;
      }

      var tmp = value[parts[i]];
      if (i === parts.length - 1) {
        //End of projection; setting the value

        //console.log('Value set using destroyStrategy.');
        value[parts[i]] = unselectValue;
        return unselectValue;
      } else {
        // Make sure to NOT create new objects on the way if they are not there.
        // We need to look ahead to check if array is appropriate.
        // Believe that if an array/object isn't present/defined, we can return.

        //console.log('Processing part %s', parts[i]);
        if (typeof tmp === 'undefined' || tmp === null) {
          //console.log('Part is undefined; returning.');
          return undefined;
        }
        value = tmp;
      }
    }
    return value;
  };
}]);
