angular.module('schemaForm').directive('sfMultiple',
  function() {
    var defaultMultiselectOpts = {
      maxHeight: 305,
      enableCaseInsensitiveFiltering: true,
      inheritClass: false,
      nSelectedText: 'selected.',
      templates: {
        li: '<li class="multiSelectCheckbox"><a href="javascript:void(0);">' +
        '<label></label></a></li>'
      }
    };

    return {
      restrict: 'A',
      require: ['ngModel'],
      scope: {
        ngModel: '=',
        sfMultiple: '=',
        multiselectOpts: '='
      },
      link: function(scope, element, attrs, multiselectOpts) {
        if (!element.multiselect) {
          console.warn('bootstrap-multiselect not present.');
          return;
        }

        scope.$watch(attrs.ngIf, function() {
          console.log('init multiselect');
          element.multiselect(defaultMultiselectOpts)
        });
      }
    };

  });

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
