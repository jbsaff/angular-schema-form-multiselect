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
      transclude: true,
      scope: {
        ngModel: '='
      },
      link: function(scope, element, attrs) {
        if (!element.multiselect) {
          console.warn('bootstrap-multiselect not present.');
          return;
        }

        if (attrs.multiselectConfig) {
          angular.extend(multiselectConfig, defaultMultiselectConfig ,
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
    .directive('schemaValidate', ['sfSelect', function(sfSelect) {
      return {
        link: function(scope, element, attrs) {
          scope.$on('$destroy', function() {
            sfSelect(scope.form.key, scope.model, null);
          });
        }
      };
    }]);
