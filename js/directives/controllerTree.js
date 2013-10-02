angular.module('panelApp').directive('batControllerTree', function (appContext) {
  return {
    restrict: 'E',
    scope: {
      val: '='
    },
    link: function (scope, element, attrs) {
      var canvas;

      scope.$watch('val', function (val) {
        if (canvas) { canvas.selectAll('*').remove(); }
        if (!val) { return; }

        canvas = d3.select(element[0]).append('svg:svg')
          .attr('width', 1400)
          .attr('height', 1400)
          .append('svg:g')
            .attr('transform', 'translate(25, 25)');

        var tree = d3.layout.tree()
          .size([ 1350, 1350 ]);

        var nodes = tree.nodes(val);
        var links = tree.links(nodes);

        var node = canvas.selectAll('.node')
          .data(nodes)
          .enter()
          .append('svg:g')
          .attr('class', 'node')
          .attr('transform', function (node) {
            return 'translate(' + [node.x, node.y].join(', ') + ')';
          })
          .on('click', function (data) {
            debugger;
            appContext.inspect(data.scopeId);
          });

        node.append('svg:circle')
          .attr('r', 5)
          .attr('fill', 'steelblue');

        node.append('svg:text')
          .text(function (data) {
            return data.name;
          })
          .attr('y', 5)
          .attr('x', 10);

        var diagonal = d3.svg.diagonal();

        canvas.selectAll('.link')
          .data(links)
          .enter()
          .append('svg:path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#888888')
            .attr('d', diagonal);
      });
    }
  };
});
