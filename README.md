# angular-schema-form-multiselect
bootstrap-multiselect extension for angular-schema-form

====
Provides a decorator for the bootstrap-multiselect (https://github.com/davidstutz/bootstrap-multiselect) library. 
The multiselect is initialized with a default set of options (see angular-multiselect.json). Each form field can be given 
a specific json configuration (see http://davidstutz.github.io/bootstrap-multiselect/#configuration-options for more), 
which extend/override the defaults.

There is also a decorator and form element type called "selectWithDefault" for a single select with a default placeholder.
This decorator will take the value associated with a selectDefault key in the form definition and display it as the first, 
unselectable, empty value option in the list.

Finally, there is a directive extension to schema-validate to clean up the model when elements are $destroyed (such as 
when an ng-if condition is no longer satisfied). The model value is set to null, as a representation of no response.


#Roadmap
* externalized default options for bootstrap-multiselect.
* allow for configuration of the model cleanup, to allow specific behavior to be on a per question basis.

