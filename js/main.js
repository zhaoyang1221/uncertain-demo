$(function () {
	$("#xAxisForDimensionScatter").selectmenu({
		width: 130
	});
	$("#yAxisForDimensionScatter").selectmenu({
		width: 130
	});
	$("button").button();
	$("input[type=button]").button();

});

var summaryData = [];

// carsAnalyze();
BostonAnalyze();

function carsAnalyze() {
	d3.json("json/cars_summary.json", function (error, data) {
		// console.log(data);
		summaryData = data;
		drawDimensionScatter(data);

	});

	d3.json("json/cars.json", function (error, data) {
		drawRowDataScatter(data);
	});

	d3.json("json/cars_original_correlation.json", function (error, data) {
		drawOriginalCorrelogram(data);
		drawOriginalSchemaBall(data);
	});
	d3.json("json/cars_uncertainty_correlation.json", function (error, data) {
		drawUncertaintyCorrelogram(data);
		drawUncertaintySchemaball(data);

	});
	d3.json("json/cars_original_with_uncertainty.json", function (error, data) {
		drawParallelCoordinates(data);
		drawRowDataTable(data.uncertainty);
	});
}

function BostonAnalyze() {
	d3.json("json/Boston_summary.json", function (error, data) {
		summaryData = data;
		drawDimensionScatter(data);
	});

	d3.json("json/Boston.json", function (error, data) {
		drawRowDataScatter(data);
	});

	d3.json("json/Boston_original_correlation.json", function (error, data) {
		drawOriginalCorrelogram(data);
		drawOriginalSchemaBall(data);
	});
	d3.json("json/Boston_uncertainty_correlation.json", function (error, data) {
		drawUncertaintyCorrelogram(data);
		drawUncertaintySchemaball(data);
	});
	d3.json("json/Boston_original_with_uncertainty.json", function (error, data) {
		drawParallelCoordinates(data);
		drawRowDataTable(data.uncertainty);
	});
}



/**
 * 画维度散点图
 */
function drawDimensionScatter(data) {
	//画散点图
	const container = d3.select("#dimensionScatter-container");
	const width = 700;
	const height = 510;
	const padding = {
		top: 30,
		right: 30,
		bottom: 60,
		left: 90
	};
	var clickDotNames = 0;
// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	var xCat = "mean",
		yCat = "sd",
		rCat = "uncertainty";


//初始化比例尺
// 	var xScale = d3.scale.log().range([0, plotAreaWidth]).nice();
// 	var yScale = d3.scale.log().range([plotAreaHeight, 0]).nice();
	var xScale = d3.scale.linear().range([0, plotAreaWidth]).nice();
	var yScale = d3.scale.linear().range([plotAreaHeight, 0]).nice();
	var rScale = d3.scale.linear().range([8, 20]);


	// d3.json("json/cars_summary.json", function (error, data) {
	// 	if (error) {
	// 		throw error;
	// 	}
	// 	console.log(data);

	var xMax = d3.max(data, function (d) {
			return d[xCat];
		}) / 3,
		xMin = d3.min(data, function (d) {
			return d[xCat];
		}),
		xMin = xMin > 0 ? 0 : xMin,
		yMax = d3.max(data, function (d) {
			return d[yCat];
		}) / 3,
		yMin = d3.min(data, function (d) {
			return d[yCat];
		}),
		yMin = yMin > 0 ? 0 : yMin;

	xScale.domain([xMin, xMax]);
	yScale.domain([yMin, yMax]);
	rScale.domain(d3.extent(data, function (d) {
		return d[rCat];
	}));

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
		.html(function (d) {
			return "<h2>" + d["_row"] + "</h2>"
				+ "mean" + ": " + d["mean"] + "<br>"
				+ "sd" + ": " + d["sd"] + "<br>"
				+ "median" + ": " + d["median"] + "<br>"
				+ "min" + ": " + d["min"] + "<br>"
				+ "max" + ": " + d["max"] + "<br>"
				+ "uncertainty" + ": " + d["uncertainty"] + "<br>";
		});

	var zoomBeh = d3.behavior.zoom()
		.x(xScale)
		.y(yScale)
		.scaleExtent([0, 500])
		.on("zoom", zoom);

	var svg = container.append('svg')
		.attr("id", "dimensionScatterSvg")
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
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
	var dot = objects.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.classed("dot", true)
		// .attr("r", function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
		.attr("r", function (d) {
			return rScale(d[rCat]);
		})
		.attr("transform", transform)
		// .style("fill", function(d) { return color(d[colorCat]); })
		.style("fill", "blue")
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.on("click", function (d) {
			clickDot(d)
		});
	// for (var i = 0; i < dot.length; i++) {
	// 	dot[i].onclick = function (d) {
	// 		console.log(d)
	// 			clickDot(d)
	// 		};
	// 	console.log(dot[i]);
	// }

	// console.log(dot);
	/**
	 * 设置button动作
	 */
	d3.select("#axisChangeButton").on("click", change);
	d3.select("#clearCount").on("click", clearCount);

	function change() {
		xCat = $("#xAxisForDimensionScatter").val();
		yCat = $("#yAxisForDimensionScatter").val();

		xMax = d3.max(data, function (d) {
			return d[xCat];
		});
		xMin = d3.min(data, function (d) {
			return d[xCat];
		});

		yMax = d3.max(data, function (d) {
			return d[yCat];
		});
		yMin = d3.min(data, function (d) {
			return d[yCat];
		});

		zoomBeh.x(xScale.domain([xMin, xMax])).y(yScale.domain([yMin, yMax]));

		var svg = container.transition();

		svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);
		svg.select(".y.axis").duration(750).call(yAxis).select(".label").text(yCat);

		objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
	}

	function clearCount() {
		clickDotNames = 0;
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

	function clickDot(d) {
		var x = d3.select(this).style();
		var y = $(this);
		console.log(y);
		if (clickDotNames === 0) {

			$("#xLabelForRowDataScatter").val(d["_row"]);
			console.log(clickDotNames);
		}
		if (clickDotNames === 1) {
			$("#yLabelForRowDataScatter").val(d["_row"]);
			console.log(clickDotNames);
		}
		clickDotNames++;
		console.log(d["_row"]);

	}

	// });
}

/**
 * 原数据散点图
 */
function drawRowDataScatter(data) {
	const rowDataScatterContainer = d3.select("#rowDataScatter-container");

	const width = 700;
	const height = 510;
	const padding = {
		top: 30,
		right: 30,
		bottom: 60,
		left: 80
	};

// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	var names = Object.keys(data[0]);
	console.log(names);
	var dimensionName = [];
	for (var i = 0; i < names.length; i++ ) {
		dimensionName[i] = names[i];
	}
	console.log(dimensionName);
	var xCat = names[0],
		yCat = names[1];

	$("#xLabelForRowDataScatter").val(xCat);
	$("#yLabelForRowDataScatter").val(yCat);

//初始化比例尺
	var xScale = d3.scale.linear().range([0, plotAreaWidth]).nice();
	var yScale = d3.scale.linear().range([plotAreaHeight, 0]).nice();

	// d3.json("json/cars.json", function (error, data) {
	// 	if (error) {
	// 		throw error;
	// 	}
	// console.log(data);

	var xMax = d3.max(data, function (d) {
			return d[xCat];
		}) * 1.05,
		xMin = d3.min(data, function (d) {
			return d[xCat];
		}),
		xMin = xMin > 0 ? 0 : xMin,
		yMax = d3.max(data, function (d) {
			return d[yCat];
		}) * 1.05,
		yMin = d3.min(data, function (d) {
			return d[yCat];
		}),
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
		.html(function (d) {
		    var html = "";
		    // console.log(dimensionName);
		    for (var i in dimensionName) {
		        var name = dimensionName[i];
		        html +=  name + ": " + d[name] + "<br>";
                // console.log(name);
            }
			// return xCat + ": " + d[xCat] + "<br>" + yCat + ": " + d[yCat];
            return html;
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
		.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
		.call(zoomBeh);

	svg.call(tip);

	svg.append("rect")
		.attr("class", "scatterRect")
		.attr("width", plotAreaWidth)
		.attr("height", plotAreaHeight);

	//画数轴
	svg.append("g")
		.classed("xForRowData axis", true)
		.attr("transform", "translate(0," + plotAreaHeight + ")")
		.call(xAxis)
		.append("text")
		.classed("label", true)
		.attr("x", plotAreaWidth)
		.attr("y", padding.bottom - 10)
		.style("text-anchor", "end")
		.text(xCat);

	svg.append("g")
		.classed("yForRowData axis", true)
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
	d3.select("#rowScatterChangeButton").on("click", change);

	function change() {
		xCat = $("#xLabelForRowDataScatter").val();
		yCat = $("#yLabelForRowDataScatter").val();

		xMax = d3.max(data, function (d) {
			return d[xCat];
		});
		xMin = d3.min(data, function (d) {
			return d[xCat];
		});

		yMax = d3.max(data, function (d) {
			return d[yCat];
		});
		yMin = d3.min(data, function (d) {
			return d[yCat];
		});

		zoomBeh.x(xScale.domain([xMin, xMax])).y(yScale.domain([yMin, yMax]));

		var svg = rowDataScatterContainer.transition();

		svg.select(".xForRowData.axis").duration(750).call(xAxis).select(".label").text(xCat);
		svg.select(".yForRowData.axis").duration(750).call(yAxis).select(".label").text(yCat);

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

	// });
}

/**
 * 原数据表格
 * @param data
 */
function drawRowDataTable(data) {
	var columns = Object.keys(data[0]);
	console.log(columns);

	const rowDataTableContainer = d3.select("#rowDataTable-container");
	const width= 1300;
	const height = 510;

	var table = rowDataTableContainer.append("table");
	var thead = table.append("thead");
	var tbody = table.append("tbody");


	thead.append("tr")
		.selectAll("th")
		.data(columns).enter()
		.append("th")
		.text(function (column) {
			return column;
		});

	var rows = tbody.selectAll("tr")
		.data(data)
		.enter()
		.append("tr");

	var cells = rows.selectAll("td")
		.data(function (row) {
			return columns.map(function (column) {
				return {column: column, value: row[column]};
			});
		})
		.enter()
		.append("td")
		.text(function (d) {
			return d.value;
		})
}

/**
 * 标签切换
 * @param name
 * @param cursel
 * @param n
 */
function setTab(name,cursel,n){
    for(var i=1;i<=n;i++){
        var menu=document.getElementById(name+i);
        var con=document.getElementById("con_"+name+"_"+i);
        menu.className=i==cursel?"hover":"";
        con.style.display=i==cursel?"block":"none";
    }
}
function setCorrelationTab(name,cursel,n) {
    console.log(name);
    for(var i=1;i<=n;i++){
        var menu=document.getElementById(name+i);
        var correlation=document.getElementById("con_"+name+"_"+i);
        menu.className=i==cursel?"hover":"";
        correlation.style.display=i==cursel?"block":"none";
    }
}
/**
 * 原数据相关图
 */
function drawOriginalCorrelogram(data) {
	const originalCorrelogramContainer = d3.select("#originalCorrelogram-container");
	const width = 700;
	const height = 500;
	const padding = {
		top: 50,
		right: 120,
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
		.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');


	// d3.json("json/cars_original_correlation.json", function (error, data) {
	// 	if (error) {
	// 		throw error;
	// 	}
	// 	console.log(data);
	var domain = d3.set(data.map(function (d) {
		return d.row
	})).values();

	var num = Math.sqrt(data.length);

	var color = d3.scale.linear()
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
		.attr("transform", function (d) {
			return "translate(" + x(d.row) + "," + y(d.column) + ")";
		});
	//
	cor.append("rect")
		.attr("width", xSpace)
		.attr("height", ySpace)
		.attr("class", "correlationRect")
		.attr("x", -xSpace / 2)
		.attr("y", -ySpace / 2);

	cor.filter(function (d) {
		var ypos = domain.indexOf(d.column);
		var xpos = domain.indexOf(d.row);
		for (var i = (ypos + 1); i < num; i++) {
			if (i === xpos || d.p > sigLevel) return false;
		}
		return true;
	})
		.append("text")
		// .attr("x", -5)
		.attr("y", 5)
		.text(function (d) {
			if (d.p > sigLevel) {
				return "";
			} else if (d.row === d.column) {
				return d.row;
			} else {
				return d.r.toFixed(2);
			}
		})
        .classed("rowLabel", true)
		.style("fill", function (d) {
			if (d.r === 1) {
				return "#000";
			} else {
				return color(d.r);
			}
		});

	cor.filter(function (d) {
		var ypos = domain.indexOf(d.column);
		var xpos = domain.indexOf(d.row);
		for (var i = (ypos + 1); i < num; i++) {
			if (i === xpos || d.p > sigLevel) return true;
		}
		return false;
	})
		.append("circle")
		.attr("r", function (d) {
			if (d.p > sigLevel) {
				return "";
			} else {
				return (plotAreaWidth / (num * 2)) * (Math.abs(d.r) + 0.1);
			}
		})
		.style("fill", function (d) {
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
	iR.forEach(function (d) {
		aG.append('rect')
			.style('fill', color(d))
			.style('stroke-width', 0)
			.style('stoke', 'none')
			.attr('height', h)
			.attr('width', 10)
			.attr('x', 0)
			.attr('y', aS(d))
	});
	// });
}

/**
 * 不确定性数据相关图
 */
function drawUncertaintyCorrelogram(data) {
	const uncertaintyCorrelogramContainer = d3.select("#uncertaintyCorrelogram-container");
	const width = 700;
	const height = 550;
	const padding = {
		top: 50,
		right: 120,
		bottom: 40,
		left: 50
	};
	const sigLevel = 0.05;

	// inner chart dimensions, where the dots are plotted
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;

	var svg = uncertaintyCorrelogramContainer.append('svg')
		.attr("class", "correlogram")
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');


	// d3.json("json/cars_uncertainty_correlation.json", function (error, data) {
	// 	if (error) {
	// 		throw error;
	// 	}
	// console.log(data);

	var domain = d3.set(data.map(function (d) {
		return d.row
	})).values();

	var num = Math.sqrt(data.length);

	var color = d3.scale.linear()
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
		.attr("transform", function (d) {
			return "translate(" + x(d.row) + "," + y(d.column) + ")";
		});
	// //
	cor.append("rect")
		.attr("width", xSpace)
		.attr("height", ySpace)
		.attr("class", "correlationRect")
		.attr("x", -xSpace / 2)
		.attr("y", -ySpace / 2);

	cor.filter(function (d) {
		var ypos = domain.indexOf(d.column);
		var xpos = domain.indexOf(d.row);
		for (var i = (ypos + 1); i < num; i++) {
			if (i === xpos || d.p > sigLevel) return false;
		}
		return true;
	})
		.append("text")
		// .attr("x", -5)
		.attr("y", 5)
		.text(function (d) {
			if (d.p > sigLevel) {
				return "";
			} else if (d.row === d.column) {
				return d.row;
			} else {
				return d.r.toFixed(2);
			}
		})
        .classed("rowLabel", true)
		.style("fill", function (d) {
			if (d.r === 1) {
				return "#000";
			} else {
				return color(d.r);
			}
		});

	cor.filter(function (d) {
		var ypos = domain.indexOf(d.column);
		var xpos = domain.indexOf(d.row);
		for (var i = (ypos + 1); i < num; i++) {
			if (i === xpos) return true;
		}
		return false;
	})
		.append("circle")
		.attr("r", function (d) {
			if (d.p > sigLevel) {
				return "";
			} else {
				return (plotAreaWidth / (num * 2)) * (Math.abs(d.r) + 0.1);
			}
		})
		.style("fill", function (d) {
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
	iR.forEach(function (d) {
		aG.append('rect')
			.style('fill', color(d))
			.style('stroke-width', 0)
			.style('stoke', 'none')
			.attr('height', h)
			.attr('width', 10)
			.attr('x', 0)
			.attr('y', aS(d))
	});
	// });
}

/**
 * 平行坐标图
 * @param data
 */
function drawParallelCoordinates(data) {
	const parallelCoordinates = d3.select("#parallelCoordinates-container");
	const width = 1420,
		height = 520;

	const padding = {top: 80, right: 10, bottom: 10, left: 10};
	const plotAreaWidth = width - padding.left - padding.right;
	const plotAreaHeight = height - padding.top - padding.bottom;


	// d3.json("json/cars_original_with_uncertainty.json", function (error, data) {
	// 	if (error) {
	// 		throw error;
	// 	}
	// 	console.log(data);
	// drawUncertainty(data);
	drawOriginal(data);

	// });
	function drawOriginal(data) {
		var x = d3.scale.ordinal().rangePoints([0, width], 1),
			y = {};

		var line = d3.svg.line(),
			axis = d3.svg.axis().orient("left"),
			background,
			foreground;

		y = {};
		var dragging = {};
		background = null;
		foreground = null;

		var svgForOriginal = parallelCoordinates.append("svg")
			.attr("id", "svgForOriginal")
			// .attr("visibility", "hidden")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + padding.left + "," + padding.top + ")");

		x.domain(dimensions = d3.keys(data.original[0]));
		dimensions.forEach(function (d) {
			var domain = d3.extent(data.original, function (p) {
				return p[d];
			});
			// console.log(domain);
			y[d] = d3.scale.linear().domain(domain).range([plotAreaHeight, 0]);
			return y[d];
		});
		// Add grey background lines for context.
		background = svgForOriginal.append("g")
			.attr("class", "background")
			.selectAll("path")
			.data(data.original)
			.enter()
			.append("path")
			.attr("d", path);

		// Add blue foreground lines for focus.
		foreground = svgForOriginal.append("g")
			.attr("class", "foreground")
			.selectAll("path")
			.data(data.original)
			.enter().append("path")
			.attr("d", path);

		// Add a group element for each dimension.
		var g = svgForOriginal.selectAll(".dimension")
			.data(dimensions)
			.enter().append("g")
			.attr("class", "dimension")
			.attr("transform", function (d) {
				return "translate(" + x(d) + ")";
			})
			.call(d3.behavior.drag()
				.origin(function (d) {
					return {x: x(d)};
				})
				.on("dragstart", function (d) {
					dragging[d] = x(d);
					background.attr("visibility", "hidden");
				})
				.on("drag", function (d) {
					dragging[d] = Math.min(plotAreaWidth, Math.max(0, d3.event.x));
					foreground.attr("d", path);
					dimensions.sort(function (a, b) {
						return position(a) - position(b);
					});
					x.domain(dimensions);
					g.attr("transform", function (d) {
						return "translate(" + position(d) + ")";
					})
				})
				.on("dragend", function (d) {
					delete dragging[d];
					transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
					transition(foreground).attr("d", path);
					background
						.attr("d", path)
						.transition()
						.delay(500)
						.duration(0)
						.attr("visibility", null);
				}));

		// Add an axis and title.
		g.append("g")
			.attr("class", "parallelAxis")
			.each(function (d) {
				d3.select(this).call(axis.scale(y[d]));
			})
			.append("text")
			.style("text-anchor", "middle")
			.classed("label", true)
			.attr("y", -25)
			.text(function (d) {
				return d;
			});



		// Add and store a brush for each axis.
		g.append("g")
			.attr("class", "brush")
			.each(function (d) {
				d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
			})
			.selectAll("rect")
			.attr("x", -8)
			.attr("width", 16);

		function position(d) {
			var v = dragging[d];
			return v == null ? x(d) : v;
		}

		function transition(g) {
			return g.transition().duration(500);
		}

// Returns the path for a given data point.
		function path(d) {
			return line(dimensions.map(function (p) {
				return [position(p), y[p](d[p])];
			}));
		}

		function brushstart() {
			d3.event.sourceEvent.stopPropagation();
		}

// Handles a brush event, toggling the display of foreground lines.
		function brush() {
			var actives = dimensions.filter(function (p) {
					return !y[p].brush.empty();
				}),
				extents = actives.map(function (p) {
					return y[p].brush.extent();
				});
			foreground.style("display", function (d) {
				return actives.every(function (p, i) {
					return extents[i][0] <= d[p] && d[p] <= extents[i][1];
				}) ? null : "none";
			});
		}


	}

	function drawUncertainty(data) {
		var x = d3.scale.ordinal().rangePoints([0, width], 1),
			y = {};

		var line = d3.svg.line(),
			axis = d3.svg.axis().orient("left"),
			background,
			foreground;
		var dragging = {};
		background = null;
		foreground = null;

		var svgForUncertainty = parallelCoordinates.append("svg")
			.attr("id", "svgForUncertainty")
			.attr("width", width)
			.attr("height", height)
			.append("g")
			.attr("transform", "translate(" + padding.left + "," + padding.top + ")");

		x.domain(dimensions = d3.keys(data.uncertainty[0]));
		dimensions.forEach(function (d) {
			var domain = d3.extent(data.uncertainty, function (p) {
				return p[d];
			});
			// console.log(domain);
			y[d] = d3.scale.linear().domain(domain).range([plotAreaHeight, 0]);
			return y[d];
		});
		// Add grey background lines for context.
		background = svgForUncertainty.append("g")
			.attr("class", "background")
			.selectAll("path")
			.data(data.uncertainty)
			.enter()
			.append("path")
			.attr("d", path);

		// Add blue foreground lines for focus.
		foreground = svgForUncertainty.append("g")
			.attr("class", "foreground")
			.selectAll("path")
			.data(data.uncertainty)
			.enter().append("path")
			.attr("d", path);

		// Add a group element for each dimension.
		var g = svgForUncertainty.selectAll(".dimension")
			.data(dimensions)
			.enter().append("g")
			.attr("class", "dimension")
			.attr("transform", function (d) {
				return "translate(" + x(d) + ")";
			})
			.call(d3.behavior.drag()
				.origin(function (d) {
					return {x: x(d)};
				})
				.on("dragstart", function (d) {
					dragging[d] = x(d);
					background.attr("visibility", "hidden");
				})
				.on("drag", function (d) {
					dragging[d] = Math.min(plotAreaWidth, Math.max(0, d3.event.x));
					foreground.attr("d", path);
					dimensions.sort(function (a, b) {
						return position(a) - position(b);
					});
					x.domain(dimensions);
					g.attr("transform", function (d) {
						return "translate(" + position(d) + ")";
					})
				})
				.on("dragend", function (d) {
					delete dragging[d];
					transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
					transition(foreground).attr("d", path);
					background
						.attr("d", path)
						.transition()
						.delay(500)
						.duration(0)
						.attr("visibility", null);
				}));

		// Add an axis and title.
		g.append("g")
			.attr("class", "parallelAxis")
			.each(function (d) {
				d3.select(this).call(axis.scale(y[d]));
			})
			.append("text")
			.style("text-anchor", "middle")
			.attr("y", -9)
			.text(function (d) {
				return d;
			});

		// Add and store a brush for each axis.
		g.append("g")
			.attr("class", "brush")
			.each(function (d) {
				d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
			})
			.selectAll("rect")
			.attr("x", -8)
			.attr("width", 16);

		function position(d) {
			var v = dragging[d];
			return v == null ? x(d) : v;
		}

		function transition(g) {
			return g.transition().duration(500);
		}

// Returns the path for a given data point.
		function path(d) {
			return line(dimensions.map(function (p) {
				return [position(p), y[p](d[p])];
			}));
		}

		function brushstart() {
			d3.event.sourceEvent.stopPropagation();
		}

// Handles a brush event, toggling the display of foreground lines.
		function brush() {
			var actives = dimensions.filter(function (p) {
					return !y[p].brush.empty();
				}),
				extents = actives.map(function (p) {
					return y[p].brush.extent();
				});
			foreground.style("display", function (d) {
				return actives.every(function (p, i) {
					return extents[i][0] <= d[p] && d[p] <= extents[i][1];
				}) ? null : "none";
			});
		}

	}

}

function drawOriginalSchemaBall(data) {
    var schemaBall = echarts.init(document.getElementById("schemaBall-container"));

    //结点数据处理
    var uncertaintyScale = d3.scale.linear().range([12,40]);
    var colorScale = d3.scale.category20();
    // console.log(summaryData);
    var domain = d3.extent(summaryData, function (d) {
        return d["uncertainty"];
    });
    uncertaintyScale.domain(domain);
    // console.log(domain);

    var nodes = [];
    summaryData.forEach(function (d, i) {
        var t = {
            name: d["_row"],
            symbolSize: uncertaintyScale(d["uncertainty"]),
            itemStyle: {
                normal: {
                    color: colorScale(i)
                }
            }

        };
        nodes.push(t);

    });
    // console.log(nodes);

    //连线处理
    console.log(data);
    var links = [];
    var sigLevel = 0.05;
    var linkColors = [ "#b21b26", "#1E23B2" ];
    var lineScale = d3.scale.linear().range([1.0, 6.0]);
    var lineDomain =  d3.extent(data, function (d) {
        return Math.abs(d.r);
    });
    lineScale.domain(lineDomain);
    // console.log(lineDomain);
    data.forEach(function (d) {
        console.log(d.p);

        if ( d.p !== null && d.p < sigLevel) {
            var color;
            if (d.r > 0) {
                color = linkColors[1];
            } else {
                color = linkColors[0];
            }
            var t = {
                source: d.row,
                target: d.column,
                name: '',
                tooltip: {
                    trigger: 'item',
                    formatter: function(params, ticket, callback) {
                        return params.data.name;
                    }
                },
                symbolSize: [4, 20],
                label: {
                    normal: {
                        formatter: function(params, ticket, callback) {
                            params.name = params.data.name;
                            return params.name;
                        },
                        show: true
                    }
                },
                lineStyle: {
                    normal: {
                        width: lineScale(Math.abs(d.r)),
                        curveness: 0.2,
                        opacity: 0.3,
                        color: color
                    }
                }
            };

            links.push(t);
        }
    });

    var option = {
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',

        // dataRange: {
        //     min: 0,
        //     max: 100,
        //     y: '60%',
        //     calculable: true,
        //     color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua']
        // },

        series: [{
            type: 'graph',
            tooltip: {},
            ribbonType: true,
            layout: 'circular',

            circular: {
                rotateLabel: true
            },
            symbolSize: 30,
            roam: true,
            focusNodeAdjacency: true,

            label: {
                normal: {
                    position: 'center',
                    fontWeight: 'bold',
                    formatter: '{b}',
                    normal: {
                        textStyle: {

                            fontFamily: '宋体'
                        }
                    }
                }
            },

            edgeSymbol: ['circle'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 13,
                        fontWeight: 'bold',
                        fontFamily: '宋体'
                    }
                }
            },

            itemStyle: {
                normal: {
                    label: {
                        rotate: true,
                        show: true,
                        textStyle: {
                            color: '#333',
                            fontWeight: 'bold'
                        }
                    },
                    color: ["#393f51", "#393f51", "#393f51", "#393f51", "#393f51", "#393f51", "#393f51", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7"] /* 内的颜色#393f51，外的颜色#85d6f7 */
                },
                emphasis: {
                    label: {
                        show: true
                        // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                    }
                }
            },

            data : nodes,
            links : links


        }]
    };

    schemaBall.setOption(option);

}

function drawUncertaintySchemaball(data) {
    var schemaBall = echarts.init(document.getElementById("uncertaintySchemaBall-container"));

    //结点数据处理
    var uncertaintyScale = d3.scale.linear().range([12,40]);
    var colorScale = d3.scale.category20();
    // console.log(summaryData);
    var domain = d3.extent(summaryData, function (d) {
        return d["uncertainty"];
    });
    uncertaintyScale.domain(domain);
    // console.log(domain);

    var nodes = [];
    summaryData.forEach(function (d, i) {
        var t = {
            name: d["_row"],
            symbolSize: uncertaintyScale(d["uncertainty"]),
            itemStyle: {
                normal: {
                    color: colorScale(i)
                }
            }

        };
        nodes.push(t);

    });
    // console.log(nodes);

    //连线处理
    console.log(data);
    var links = [];
    var sigLevel = 0.05;
    var linkColors = [ "#b21b26", "#1E23B2" ];
    var lineScale = d3.scale.linear().range([1.0, 6.0]);
    var lineDomain =  d3.extent(data, function (d) {
        return Math.abs(d.r);
    });
    lineScale.domain(lineDomain);
    // console.log(lineDomain);
    data.forEach(function (d) {
        console.log(d.p);

        if ( d.p !== null && d.p < sigLevel) {
            var color;
            if (d.r > 0) {
                color = linkColors[1];
            } else {
                color = linkColors[0];
            }
            var t = {
                source: d.row,
                target: d.column,
                name: '',
                tooltip: {
                    trigger: 'item',
                    formatter: function(params, ticket, callback) {
                        return params.data.name;
                    }
                },
                symbolSize: [4, 20],
                label: {
                    normal: {
                        formatter: function(params, ticket, callback) {
                            params.name = params.data.name;
                            return params.name;
                        },
                        show: true
                    }
                },
                lineStyle: {
                    normal: {
                        width: lineScale(Math.abs(d.r)),
                        curveness: 0.2,
                        opacity: 0.3,
                        color: color
                    }
                }
            };

            links.push(t);
        }
    });

    var option = {
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',

        // dataRange: {
        //     min: 0,
        //     max: 100,
        //     y: '60%',
        //     calculable: true,
        //     color: ['#ff3333', 'orange', 'yellow', 'lime', 'aqua']
        // },

        series: [{
            type: 'graph',
            tooltip: {},
            ribbonType: true,
            layout: 'circular',

            circular: {
                rotateLabel: true
            },
            symbolSize: 30,
            roam: true,
            focusNodeAdjacency: true,

            label: {
                normal: {
                    position: 'center',
                    fontWeight: 'bold',
                    formatter: '{b}',
                    normal: {
                        textStyle: {

                            fontFamily: '宋体'
                        }
                    }
                }
            },

            edgeSymbol: ['circle'],
            edgeSymbolSize: [4, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 13,
                        fontWeight: 'bold',
                        fontFamily: '宋体'
                    }
                }
            },

            itemStyle: {
                normal: {
                    label: {
                        rotate: true,
                        show: true,
                        textStyle: {
                            color: '#333',
                            fontWeight: 'bold'
                        }
                    },
                    color: ["#393f51", "#393f51", "#393f51", "#393f51", "#393f51", "#393f51", "#393f51", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7", "#85d6f7"] /* 内的颜色#393f51，外的颜色#85d6f7 */
                },
                emphasis: {
                    label: {
                        show: true
                        // textStyle: null      // 默认使用全局文本样式，详见TEXTSTYLE
                    }
                }
            },

            data : nodes,
            links : links


        }]
    };

    schemaBall.setOption(option);

}