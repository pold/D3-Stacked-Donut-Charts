var width = 960,
    height = 700,
	radius = 300;
    // radius = Math.min(width, height) / 2;

var svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
  	.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius * radius])
    .value(function(d) { return d.size; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return d.x; })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

var depth1_colors = d3.scale.ordinal()
	.range(["#F89A28", "#F89A28"]);
	
var depth2_colors = d3.scale.category20c();

var politician_colors = d3.scale.ordinal()
	.range(["rgb(92,188,239)", "rgb(255,76,76)", "rgb(150,163,170)"])
	.domain("D","I","R");

d3.json("data.json", function(error, root) {
	var g = svg.datum(root).selectAll("g")
	    .data(partition.nodes)
	    .enter().append("g");
		
	if(root.children[0].value >= root.children[1].value)
		g.attr("transform", "rotate(-90)");
	else
		g.attr("transform", "rotate(90)");
	
	var path = g.append("path")
	    .attr("d", arc)
		.attr("id", function(d, i) { return "path" + i; })
	    .attr("stroke", "#FFF")
	    .attr("fill", function(d, i) {
			if(d.depth == 0)
				return "#000";
			else if(d.depth == 1)
				return depth1_colors(i);
			else if(d.depth == 2)
				return depth2_colors(d.name);
			else
				return politician_colors(d.party);
		})
	    .attr("fill-rule", "evenodd")
		.attr("opacity", function(d) {
			if(d.depth == 0)
				return 0;
			else if(d.depth > 2)
				return 0;
		})
		.on("click", function(d) {
			if(d.depth > 1) {
				var oldD = d;
			
				var paths = d3.selectAll("path").filter(function(d) {
					if(d.parent == oldD) {
						return this;
					}
				})
				.transition()
				.duration(250)
				.attr("opacity", function(d) {
					if(d3.select(this)[0][0].attributes.opacity.value == "0")
						return 1;
					else
						return 0;
				});
			}
		})
	    .each(stash);
	
	var text = g.append("text")
		.attr("font-size", "0.85em")
		.attr("fill", "#FFF")
		.attr("text-anchor", "middle")
		.attr("dy", "2em")
		.attr("transform", function(d) { return "rotate(" + (d.dx * 180)/(2 * Math.PI) + ")"; })
      	.append("textPath")
        .attr("xlink:href", function(d, i) { return "#path" + i; })
		.attr("opacity", function(d) {
			if(d.depth == 0)
				return 0;
			else if(d.depth > 2)
				return 0;
		})
		.text(function(d) { return d.name; });

	// d3.selectAll("input").on("change", function change() {
	// 		var value = this.value === "count"
	// 		    ? function() { return 1; }
	// 		    : function(d) { return d.size; };
	// 
	// 		path.data(partition.value(value).nodes)
	// 			.transition()
	// 		    .duration(1500)
	// 		    .attrTween("d", arcTween);
	// 	});
});

function stash(d) {
	d.x0 = d.x;
	d.dx0 = d.dx;
}

function arcTween(a) {
	var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
	
	return function(t) {
	  var b = i(t);
	
	  a.x0 = b.x;
	  a.dx0 = b.dx;
	
	  return arc(b);
	};
}

d3.select(self.frameElement).style("height", height + "px");