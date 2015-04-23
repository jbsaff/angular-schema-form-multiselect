angular.module('schemaForm').directive('sfMultiple', ['$http',
  function($http) {

    var defaultMultiselectOpts = {
      maxHeight: 305,
      enableCaseInsensitiveFiltering: true,
      inheritClass: true,
      nSelectedText: 'selected.',
      templates: {
        li: '<li class="multiSelectCheckbox"><a href="javascript:void(0);">' +
        '<label></label></a></li>'
      }
    };
    var multiselectOptions = {};

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

        if (attrs.multiselectOpts) {
          angular.extend(multiselectOptions, defaultMultiselectOpts ,
                         JSON.parse(attrs.multiselectOpts));
        } else {
          multiselectOptions = defaultMultiselectOpts;
        }

        console.log(defaultMultiselectOpts);
        console.log(multiselectOptions);

        scope.$watch(attrs.ngIf, function() {
          console.log('init multiselect');
          element.multiselect(multiselectOptions)
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
