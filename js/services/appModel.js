// Service for running code in the context of the application being debugged
angular.module('panelApp').factory('appModel', function (chromeExtension, appContext) {

  var _scopeTreeCache = {},
    _scopeCache = {},
    _rootScopeCache = [];


  // clear cache on page refresh
  appContext.watchRefresh(function () {
    _scopeCache = {};
    _rootScopeCache = [];
  });

  return {
    getRootScopes: function (callback) {
      chromeExtension.eval(function (window) {
        if (!window.__ngDebug) {
          return;
        }
        return window.__ngDebug.getRootScopeIds();
      },
      function (data) {
        if (data) {
          _rootScopeCache = data;
        }
        callback(_rootScopeCache);
      });
    },

    // only runs callback if model has changed since last call
    getModel: function (id, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getModel(args.id);
      }, {id: id}, function (tree) {
        if (tree) {
          _scopeCache[id] = tree;
        }
        callback(_scopeCache[id]);
      });
    },

    getScopeTree: function (id, callback) {
      if (!id) {
        return;
      }
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.getScopeTree(args.id);
      }, {id: id}, function (tree) {
        if (tree) {
          _scopeTreeCache[id] = tree;
        }
        callback(_scopeTreeCache[id]);
      });
    },

    getControllerTree: function (callback) {
      chromeExtension.eval(function (window) {
        function createTreeWalker(node) {
          return document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
        }

        var traverse = function (node) {
          // TODO: which to prefer?
          var ngControllerAttr = node.attributes.getNamedItem('ng-controller') || node.attributes.getNamedItem('ng:controller');

          var scope = angular.element(node).scope();
          var tree = {
            name: ngControllerAttr && ngControllerAttr.value,
            scopeId: scope.$id,
            children: []
          };

          var treeWalker = createTreeWalker(node);

          var child = treeWalker.firstChild();
          if (child) {
            do {
              tree.children.push(traverse(child));
            } while (child = treeWalker.nextSibling());
          }

          return tree;
        };

        var tree = traverse(document.body);

        function filterChildren(tree) {
          return tree.children.reduce(function (filtered, child) {
            var children = filterChildren(child);

            if (child.name) {
              // TODO: avoid explicitly listing these properties
              filtered.unshift({
                name: child.name,
                scopeId: child.scopeId,
                children: children
              });
            } else {
              children.forEach(function (child) {
                filtered.unshift(child);
              });
            }

            return filtered;
          }, []);
        }

        tree = filterChildren(tree);

        console.log(JSON.stringify(tree, null, '\t'));

        return tree;
      }, null, callback);
    },

    enableInspector: function (argument) {
      chromeExtension.eval(function (window, args) {
        return window.__ngDebug.enable();
      });
    }
  };
});
