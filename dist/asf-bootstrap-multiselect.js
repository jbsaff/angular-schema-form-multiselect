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
