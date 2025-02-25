// a function to create an empty group element for each country
// this group is a container for the respective country's data
function initializeGroup(g) {

	g.classed("country", true);

	g.append("circle").classed("renewable", true);
	g.append("circle").classed("nuclear", true);
	g.append("circle").classed("hydroelectric", true);
	g.append("circle").classed("fossil", true);
	g.append("text").classed("label", true);
}

// a function to update the group first

function updateGroup(d, i) {
	let g = d3.select(this);

	if (g.selectAll("*").empty()) {
		initializeGroup(g);
	}
	g.attr("transform", `translate(${d.x}, ${d.y})`);

	g.select(".renewable").attr("r", d.renewableRadius);
	g.select(".fossil").attr("r", d.fossilRadius);
	g.select(".nuclear").attr("r", d.nuclearRadius);
	g.select(".hydroelectric").attr("r", d.hydroelectricRadius);

	g.select(".label").attr("y", d.labelOffset).text(d.labelText);
}

function update() {
	// get visual properties to render the data
	let layoutData = getLayout(data);

	//
	d3.select("g.chart")
    .selectAll('g')
    .data(layoutData)
    .join('g')
    .each(updateGroup);


	d3.select("#frame").attr("height", config.height);
	d3.select("#frame").attr("width", config.width);

	console.log("width; ", config.width);
}
