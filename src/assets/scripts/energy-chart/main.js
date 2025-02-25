let data;

function dataIsReady(csv) {
	data = csv;
	update();
}

function prepareData(d) {
	return {
		name: d.name,
		id: d.id,
		hydroelectric: Number.parseFloat(d.hydroelectric),
		nuclear: Number.parseFloat(d.nuclear),
		fossil: Number.parseFloat(d.oilgascoal),
		renewable: Number.parseFloat(d.renewable),
	};
}

// Details with https://d3js.org/d3-fetch#csv
// When the data loads, D3 converts the CSV into an array of objects and calls dataIsReady.

d3.csv("/src/assets/data/chart-data.csv", prepareData).then(dataIsReady);
