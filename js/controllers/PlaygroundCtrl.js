angular.module('panelApp').controller('PlaygroundCtrl', function PlaygroundCtrl($scope, appContext, appModel) {

  // debugger;

  console.log('test');
  appModel.getControllerTree(function (tree) {
    console.log(JSON.stringify(tree, null, '\t'));

    $scope.tree = {
      name: 'App',
      children: tree
    };
    $scope.$apply();
  });

});
