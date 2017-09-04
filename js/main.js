$(function() {
	$("#xAxisForDimensionScatter").selectmenu({
		width: 130
	});
	$("#yAxisForDimensionScatter").selectmenu({
		width: 130
	});
	$("button").button();
	$("input[type=button]").button();

});

drawDimensionScatter();

drawRowDataScatter();

drawOriginalCorrelogram();

/**
 * 画维度散点图
 */
function drawDimensionScatter() {
	//画散点图
	const container = d3.select("#dimensionScatter-container");
	const width = 650;
	const height = 510;
	const padding = {
		top: 30,
		right: 30,
		bottom: 30,
		left: 40
	};
// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	var xCat = "mean",
		yCat = "sd";



//初始化比例尺
	var xScale = d3.scale.linear().range([0, plotAreaWidth]).nice();
	var yScale = d3.scale.linear().range([plotAreaHeight, 0]).nice();


	d3.json("json/cars_summary.json", function (error, data) {
		if (error) {
			throw error;
		}
		console.log(data);

		var xMax = d3.max(data, function(d) { return d[xCat]; }) * 1.05,
			xMin = d3.min(data, function(d) { return d[xCat]; }),
			xMin = xMin > 0 ? 0 : xMin,
			yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.05,
			yMin = d3.min(data, function(d) { return d[yCat]; }),
			yMin = yMin > 0 ? 0 : yMin;

		xScale.domain([xMin, xMax]);
		yScale.domain([yMin, yMax]);

		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.tickSize(-plotAreaHeight);

		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.tickSize(-plotAreaWidth);

		var tip = d3.tip()
			.attr("class", "d3-tip")
			.offset([-10, 0])
			.html(function(d) {
				return xCat + ": " + d[xCat] + "<br>" + yCat + ": " + d[yCat];
			});

		var zoomBeh = d3.behavior.zoom()
			.x(xScale)
			.y(yScale)
			.scaleExtent([0, 500])
			.on("zoom", zoom);

		var svg = container.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(' + padding.left +',' + padding.top + ')')
			.call(zoomBeh);

		svg.call(tip);

		svg.append("rect")
			.attr("class", "scatterRect")
			.attr("width", plotAreaWidth)
			.attr("height", plotAreaHeight);

		//画数轴
		svg.append("g")
			.classed("x axis", true)
			.attr("transform", "translate(0," + plotAreaHeight + ")")
			.call(xAxis)
			.append("text")
			.classed("label", true)
			.attr("x", plotAreaWidth)
			.attr("y", padding.bottom - 10)
			.style("text-anchor", "end")
			.text(xCat);

		svg.append("g")
			.classed("y axis", true)
			.call(yAxis)
			.append("text")
			.classed("label", true)
			.attr("transform", "rotate(-90)")
			.attr("y", -padding.left)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(yCat);

		var objects = svg.append("svg")
			.classed("objects", true)
			.attr("width", plotAreaWidth)
			.attr("height", plotAreaHeight);

		objects.append("svg:line")
			.classed("axisLine hAxisLine", true)
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", plotAreaWidth)
			.attr("y2", 0)
			.attr("transform", "translate(0," + plotAreaHeight + ")");

		objects.append("svg:line")
			.classed("axisLine vAxisLine", true)
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", plotAreaHeight);

		//画散点图
		objects.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.classed("dot", true)
			// .attr("r", function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
			.attr("r", 5)
			.attr("transform", transform)
			// .style("fill", function(d) { return color(d[colorCat]); })
			.style("fill", "blue")
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);

		/**
		 * 设置button动作
		 */
		d3.select("#axisChangeButton").on("click", change);

		function change() {
			xCat = "median";
			xMax = d3.max(data, function(d) { return d[xCat]; });
			xMin = d3.min(data, function(d) { return d[xCat]; });

			zoomBeh.x(xScale.domain([xMin, xMax])).y(yScale.domain([yMin, yMax]));

			var svg = container.transition();

			svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

			objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
		}

		function zoom() {
			svg.select(".x.axis").call(xAxis);
			svg.select(".y.axis").call(yAxis);

			svg.selectAll(".dot")
				.attr("transform", transform);
		}
		function transform(d) {
			return "translate(" + xScale(d[xCat]) + "," + yScale(d[yCat]) + ")";
		}
	});
}

/**
 * 原数据散点图
 */
function drawRowDataScatter() {
	const rowDataScatterContainer = d3.select("#rowDataScatter");

	const width = 650;
	const height = 510;
	const padding = {
		top: 30,
		right: 30,
		bottom: 30,
		left: 40
	};

// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	var xCat = "economy",
		yCat = "displacement";

//初始化比例尺
	var xScale = d3.scale.linear().range([0, plotAreaWidth]).nice();
	var yScale = d3.scale.linear().range([plotAreaHeight, 0]).nice();

	d3.json("json/cars.json", function (error, data) {
		if (error) {
			throw error;
		}
		// console.log(data);

		var xMax = d3.max(data, function(d) { return d[xCat]; }) * 1.05,
			xMin = d3.min(data, function(d) { return d[xCat]; }),
			xMin = xMin > 0 ? 0 : xMin,
			yMax = d3.max(data, function(d) { return d[yCat]; }) * 1.05,
			yMin = d3.min(data, function(d) { return d[yCat]; }),
			yMin = yMin > 0 ? 0 : yMin;

		xScale.domain([xMin, xMax]);
		yScale.domain([yMin, yMax]);

		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.tickSize(-plotAreaHeight);

		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.tickSize(-plotAreaWidth);

		var tip = d3.tip()
			.attr("class", "d3-tip")
			.offset([-10, 0])
			.html(function(d) {
				return xCat + ": " + d[xCat] + "<br>" + yCat + ": " + d[yCat];
			});

		var zoomBeh = d3.behavior.zoom()
			.x(xScale)
			.y(yScale)
			.scaleExtent([0, 500])
			.on("zoom", zoom);

		var svg = rowDataScatterContainer.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', 'translate(' + padding.left +',' + padding.top + ')')
			.call(zoomBeh);

		svg.call(tip);

		svg.append("rect")
			.attr("class", "scatterRect")
			.attr("width", plotAreaWidth)
			.attr("height", plotAreaHeight);

		//画数轴
		svg.append("g")
			.classed("x axis", true)
			.attr("transform", "translate(0," + plotAreaHeight + ")")
			.call(xAxis)
			.append("text")
			.classed("label", true)
			.attr("x", plotAreaWidth)
			.attr("y", padding.bottom - 10)
			.style("text-anchor", "end")
			.text(xCat);

		svg.append("g")
			.classed("y axis", true)
			.call(yAxis)
			.append("text")
			.classed("label", true)
			.attr("transform", "rotate(-90)")
			.attr("y", -padding.left)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text(yCat);

		var objects = svg.append("svg")
			.classed("objects", true)
			.attr("width", plotAreaWidth)
			.attr("height", plotAreaHeight);

		objects.append("svg:line")
			.classed("axisLine hAxisLine", true)
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", plotAreaWidth)
			.attr("y2", 0)
			.attr("transform", "translate(0," + plotAreaHeight + ")");

		objects.append("svg:line")
			.classed("axisLine vAxisLine", true)
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", plotAreaHeight);

		//画散点图
		objects.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.classed("dot", true)
			// .attr("r", function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
			.attr("r", 5)
			.attr("transform", transform)
			// .style("fill", function(d) { return color(d[colorCat]); })
			.style("fill", "blue")
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);

		/**
		 * 设置button动作
		 */
		d3.select("#axisChangeButton").on("click", change);

		function change() {
			xCat = "median";
			xMax = d3.max(data, function(d) { return d[xCat]; });
			xMin = d3.min(data, function(d) { return d[xCat]; });

			zoomBeh.x(xScale.domain([xMin, xMax])).y(yScale.domain([yMin, yMax]));

			var svg = rowDataScatterContainer.transition();

			svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

			objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
		}

		function zoom() {
			svg.select(".x.axis").call(xAxis);
			svg.select(".y.axis").call(yAxis);

			svg.selectAll(".dot")
				.attr("transform", transform);
		}
		function transform(d) {
			return "translate(" + xScale(d[xCat]) + "," + yScale(d[yCat]) + ")";
		}
	});
}

/**
 * 原数据相关图
 */
function drawOriginalCorrelogram() {
	const originalCorrelogramContainer = d3.select("#originalCorrelogram-container");
	const width = 600;
	const height = 500;
	const padding = {
		top: 50,
		right: 100,
		bottom: 40,
		left: 50
	};
	const sigLevel = 0.05;

	// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	var svg = originalCorrelogramContainer.append('svg')
		.attr("class", "correlogram")
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + padding.left +',' + padding.top + ')');



	d3.json("json/cars_original_correlation.json", function (error, data) {
		if (error) {
			throw error;
		}
		console.log(data);
		var domain = d3.set(data.map(function(d) {
				return d.row
			})).values();

		var num = Math.sqrt(data.length);

		var	color = d3.scale.linear()
				.domain([-1, 0, 1])
				.range(["#B22222", "#fff", "#000080"]);

		var x = d3.scale
				.ordinal()
				.rangePoints([0, plotAreaWidth])
				.domain(domain),
			y = d3.scale
				.ordinal()
				.rangePoints([0, plotAreaHeight])
				.domain(domain),


			xSpace = x.range()[1] - x.range()[0],
			ySpace = y.range()[1] - y.range()[0];

		var cor = svg.selectAll(".cor")
			.data(data)
			.enter()
			.append("g")
			.attr("class", "cor")
			.attr("transform", function(d) {
				return "translate(" + x(d.row) + "," + y(d.column) + ")";
			});
		// //
		cor.append("rect")
			.attr("width", xSpace)
			.attr("height", ySpace)
			.attr("class", "correlationRect")
			.attr("x", -xSpace / 2)
			.attr("y", -ySpace / 2);

		cor.filter(function(d){
			var ypos = domain.indexOf(d.column);
			var xpos = domain.indexOf(d.row);
			for (var i = (ypos + 1); i < num; i++){
				if (i === xpos || d.p > sigLevel) return false;
			}
			return true;
		})
			.append("text")
			// .attr("x", -5)
			.attr("y", 5)
			.text(function(d) {
				if (d.p > sigLevel) {
					return "";
				} else if (d.row === d.column) {
					return d.row;
				} else {
					return d.r.toFixed(2);
				}
			})
			.style("fill", function(d){
				if (d.r === 1) {
					return "#000";
				} else {
					return color(d.r);
				}
			});

		cor.filter(function(d){
			var ypos = domain.indexOf(d.column);
			var xpos = domain.indexOf(d.row);
			for (var i = (ypos + 1); i < num; i++){
				if (i === xpos) return true;
			}
			return false;
		})
			.append("circle")
			.attr("r", function(d){
				return (plotAreaWidth / (num * 2)) * (Math.abs(d.r) + 0.1);
			})
			.style("fill", function(d){
				if (d.r === 1) {
					return "#000";
				} else {
					return color(d.r);
				}
			});

		//legend
		var aS = d3.scale
			.linear()
			.range([-padding.top + 15, plotAreaHeight + padding.bottom - 10])
			.domain([1, -1]);

		var yA = d3.svg.axis()
			.orient("right")
			.scale(aS)
			.tickPadding(7);

		var aG = svg.append("g")
			.attr("class", "y axis")
			.call(yA)
			.attr("transform", "translate(" + (plotAreaWidth + padding.right / 2) + " ,0)");

		var iR = d3.range(-1, 1.01, 0.01);
		var h = plotAreaHeight / iR.length + 3;
		iR.forEach(function(d){
			aG.append('rect')
				.style('fill',color(d))
				.style('stroke-width', 0)
				.style('stoke', 'none')
				.attr('height', h)
				.attr('width', 10)
				.attr('x', 0)
				.attr('y', aS(d))
		});
	});
}