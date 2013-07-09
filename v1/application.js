d3.json('data.json', function(errors, data) {
	var yeas = [];
	var nays = [];
	var yea_influence_total = 0;
	var nay_influence_total = 0;

	for(var i = 0; i < data.industries.length; i++) {
		var yea_temp = {};
		var nay_temp = {};
		var yea_c = data.industries[i].yea_contribution;
		var nay_c = data.industries[i].nay_contribution;
		
		yeas.push({ value: yea_c.d_influence, party: 'D', name: data.industries[i].name });
		yeas.push({ value: yea_c.i_influence, party: 'I', name: data.industries[i].name });
		yeas.push({ value: yea_c.r_influence, party: 'R', name: data.industries[i].name });
		
		nays.push({ value: nay_c.d_influence, party: 'D', name: data.industries[i].name });
		nays.push({ value: nay_c.i_influence, party: 'I', name: data.industries[i].name });
		nays.push({ value: nay_c.r_influence, party: 'R', name: data.industries[i].name });
		
		yea_influence_total += yea_c.total;
		nay_influence_total += nay_c.total;
	}
	
	console.log(yeas);
	console.log(nays);

	var width = 800,
	    height = 600,
		padding = 40,
	    radius = Math.min(width-150, height-150)/2;
		
	var oldPieData = [];

	var svg = d3.select('#graph').append('svg')
	    .attr('width', width + padding)
	    .attr('height', height + padding);
	
	var divider = svg.append('line')
		.attr('x1', 0)
		.attr('x2', width+padding)
		.attr('y1', "50%")
		.attr('y2', "50%")
		.attr("stroke", "rgb(0,0,0)")
		.attr("stroke-width", 1)
		.attr("fill", "none");
		
	var tooltip = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
	
	var yea_group = svg.append('g')
		.attr('transform', 'translate(' + (width/2+(padding/2)) + ', ' + (height/2+(padding/2)) + ')');
	
	var nay_group = svg.append('g')
		.attr('transform', 'translate(' + (width/2+(padding/2)) + ', ' + (height/2+(padding/2)) + ')');
		
	var arc = d3.svg.arc()
		.innerRadius(radius-60)
		.outerRadius(radius);
		
	var yea_pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.value; })
		.startAngle(-Math.PI/2)
		.endAngle(Math.PI/2);
		
	var nay_pie = d3.layout.pie()
		.sort(null)
		.value(function(d) { return d.value; })
		.startAngle(Math.PI/2)
		.endAngle(Math.PI+Math.PI/2);
	
	var color = d3.scale.ordinal()
		.range(['rgb(92,188,239)', 'rgb(150,163,170)', 'rgb(255,76,76)']);
		
	var yeas_industry = yea_group.selectAll('.arc')
		.data(yea_pie(yeas))
		.enter().append('g')
		.attr('class', 'arc');
		
	yeas_industry.append('path')
		.attr('d', arc)
		.style('fill', function(d, i) { return color(i); })
		.style('fill-opacity', 0.5)
		.style('stroke', '#FFF')
		.style('stroke-width', '1px')
		.on('mouseover', function() {
			var elem = d3.select(this).transition()
				.duration(250)
		    	.style('fill-opacity', 1);
			tooltip.html("<b>" + elem[0][0].__data__.data.name + "</b><br>$" + addCommas(elem[0][0].__data__.data.value))
				.transition()
                	.duration(250)
                	.style("opacity", 1);
		})
		.on('mouseout', function() {
			d3.select(this).transition()
				.duration(250)
		    	.style('fill-opacity', 0.5);
			tooltip.transition()     
                .duration(250)      
                .style("opacity", 0);
		})
		.on('mousemove', function() {
			tooltip
				.style("left", (d3.event.pageX + 10) + "px")     
                .style("top", (d3.event.pageY - 75) + "px");
		})
		.transition()
			.duration(500)
			.attrTween("d", pieTween);
			
	var nays_industry = nay_group.selectAll('.arc')
		.data(nay_pie(nays))
		.enter().append('g')
		.attr('class', 'arc');

	nays_industry.append('path')
		.attr('d', arc)
		.style('fill', function(d, i) { return color(i); })
		.style('fill-opacity', 0.5)
		.style('stroke', '#FFF')
		.style('stroke-width', '1px')
		.on('mouseover', function() {
			var elem = d3.select(this).transition()
				.duration(250)
		    	.style('fill-opacity', 1);
			tooltip.html("<b>" + elem[0][0].__data__.data.name + "</b><br>$" + addCommas(elem[0][0].__data__.data.value))
				.transition()
                	.duration(250)
                	.style("opacity", 1);
		})
		.on('mouseout', function() {
			d3.select(this).transition()
				.duration(250)
		    	.style('fill-opacity', 0.5);
			tooltip.transition()     
                .duration(250)      
               	.style("opacity", 0);
		})
		.on('mousemove', function() {
			tooltip
				.style("left", (d3.event.pageX + 10) + "px")     
                .style("top", (d3.event.pageY - 75) + "px");
		})
		.transition()
			.duration(500)
			.attrTween("d", pieTween);

	var title = svg.append("text")
		.text(data.info.name)
		.attr("x", padding/2)
		.attr("y", padding)
		.attr("font-size", "24px")
		.attr("font-weight", "300")
		.attr("fill", "black");
		
	var subtitle = svg.append("text")
		.text(data.info.chamber + " - " + data.info.type)
		.attr("x", padding/2)
		.attr("y", padding + 25)
		.attr("font-size", "14px")
		.attr("font-weight", "700")
		.attr("fill", "black");
		
	var yea_title = svg.append("text")
		.text("Yeas")
		.attr("x", padding/2)
		.attr("y", "48%")
		.attr("font-size", "18px")
		.attr("font-weight", "300")
		.attr("fill", "black");
		
	var nea_title = svg.append("text")
		.text("Nays")
		.attr("x", padding/2)
		.attr("y", "54%")
		.attr("font-size", "18px")
		.attr("font-weight", "300")
		.attr("fill", "black");
		
	var yea_amount = svg.append("text")
		.text(Math.round(parseFloat(data.info.yeas/data.info.total_votes)*100) + "% (" + data.info.yeas + " votes)")
		.attr("x", width+(padding/2))
		.attr("y", "48%")
		.attr("text-anchor", "end")
		.attr("font-size", "18px")
		.attr("font-weight", "300")
		.attr("fill", "black");
		
	var nay_amount = svg.append("text")
		.text(Math.round(parseFloat(data.info.nays/data.info.total_votes)*100) + "% (" + data.info.nays + " votes)")
		.attr("x", width+(padding/2))
		.attr("y", "54%")
		.attr("text-anchor", "end")
		.attr("font-size", "18px")
		.attr("font-weight", "300")
		.attr("fill", "black");
		
	var yea_influence = svg.append("text")
		.text("$" + addCommas(yea_influence_total))
		.attr("x", "50%")
		.attr("y", "40%")
		.attr("text-anchor", "middle")
		.attr("font-size", "24px")
		.attr("font-weight", "700")
		.attr("fill", "black");
		
	var nay_influence = svg.append("text")
		.text("$" + addCommas(nay_influence_total))
		.attr("x", "50%")
		.attr("y", "62%")
		.attr("text-anchor", "middle")
		.attr("font-size", "24px")
		.attr("font-weight", "700")
		.attr("fill", "black");
		
	function pieTween(d, i) {
		var s0;
		var e0;

		if(oldPieData[i]) {
			s0 = oldPieData[i].startAngle;
		    e0 = oldPieData[i].endAngle;
		}
		else if(!(oldPieData[i]) && oldPieData[i-1]) {
		    s0 = oldPieData[i-1].endAngle;
		    e0 = oldPieData[i-1].endAngle;
		}
		else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
		    s0 = oldPieData[oldPieData.length-1].endAngle;
		    e0 = oldPieData[oldPieData.length-1].endAngle;
		}
		else {
		    s0 = 0;
		    e0 = 0;
		}

		var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
		
		return function(t) {
		    var b = i(t);
		    return arc(b);
		};
	}
	
	function addCommas(nStr) {
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? '.' + x[1] : '';
		
		var rgx = /(\d+)(\d{3})/;
		
		while (rgx.test(x1))
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
			
		return x1 + x2;
	}
});