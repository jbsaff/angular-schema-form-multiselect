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
