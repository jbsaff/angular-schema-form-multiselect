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
