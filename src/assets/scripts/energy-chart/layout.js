function getTruncatedLabel (text) {
	return text.length <= 10 ? text : `${text.substring(0, 10)}…`;
}

function getLayout(data) {
	labelHeight = 20;

	// get properties for individual cell
	let cellWidth = config.width / config.totalColumns;
	let cellHeight = cellWidth + labelHeight*2.5;

	// get the maximum radius of the circle inside the cell
	let maxRadius = (cellWidth - config.cellPadding * 2) / 2;

	// a function scales the given date fits to the radius of circle
	let radiusScaler = d3.scaleSqrt([0, 100], [1, maxRadius]);

	// prepares an object of the coordinates of each circles,
	// and the graphical properties
	let layout = data.map((d, i) => {
		let item = {};

		let column = i % config.totalColumns;
		let row = Math.floor(i / config.totalColumns);
		
		item.x = (column * cellWidth) + cellWidth / 2;
		item.y = (row * cellHeight) + cellHeight / 2;
		
		// item.radius = radiusScaler(d.renewable);
		item.renewableRadius = radiusScaler(d.renewable);
		item.fossilRadius = radiusScaler(d.fossil);
		item.hydroelectricRadius = radiusScaler(d.hydroelectric);
		item.nuclearRadius = radiusScaler(d.nuclear);

		// new code to add label
		item.labelText = getTruncatedLabel(d.name);
		item.labelOffset = maxRadius + labelHeight;

		return item;
	});

	config.height =
		(Math.floor(Object.keys(layout).length / config.totalColumns)+1) * cellHeight;
	
	return layout;
}
