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
