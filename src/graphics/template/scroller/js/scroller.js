/**
 * scroller - handles the details
 * of figuring out which section
 * the user is currently scrolled
 * to.
 *
 */
function scroller() {
	let container = d3.select("body");
	// event dispatcher has two events,
	// 'active' and 'progress'
	let dispatch = d3.dispatch("active", "progress");

	// d3 selection of all the
	// text sections that will
	// be scrolled through
	let sections = null;

	// array that will hold the
	// y coordinate of each section
	// that is scrolled through
	let sectionYCoords = [];
	let currentSectionIndex = -1;
	// y coordinate of
	let containerStart = 0;

	let index = {
		current: -1,
		prev: undefined,
		progress: undefined,
		update: function () {
			let yPos = window.scrollY - 10 - containerStart;
			let newIndex = d3.bisect(sectionYCoords, yPos);
			newIndex = Math.min(sections.size() - 1, newIndex);

			if (currentSectionIndex !== newIndex) {
				this.current = newIndex;
				// dispatch.call("active", this, currentSectionIndex);
			}

			this.current = newIndex;
			this.prev = Math.max(currentSectionIndex - 1, 0);
			this.progress =
				(yPos - sectionYCoords[this.prev]) /
				(sectionYCoords[this.current] - sectionYCoords[this.prev]);
		},
	};

	let yCoords = {
		allSections: [],
		containerStart: 0,
		update: function () {
			let startPos;
			let _tempArray = [];
			// console.log(sections);
			sections.each(function (d, i) {
				let thisSectionTop = this.getBoundingClientRect().top;
				if (i === 0) {
					startPos = thisSectionTop;
				}
				_tempArray.push(thisSectionTop - startPos);
			});

			this.allSections = [..._tempArray];
			this.containerStart =
				container.node().getBoundingClientRect().top + window.scrollY;
			console.log(containerStart);
		},
	};

	/**
	 * scroll - constructor function.
	 * Sets up scroller to monitor
	 * scrolling of els selection.
	 *
	 * @param selectedElements - d3 selection of
	 *  elements that will be scrolled
	 *  through by user.
	 */

	function scroll(selectedElements) {
		// 	scroll(d3.selectAll(".step")); in section.js file.
		sections = selectedElements;

		// when window is scrolled
		// call getCurrentSectionIndex.
		// When it is resized
		// call resize.
		d3.select(window)
			.on("scroll.scroller", updateSectionIndex)
			.on("resize.scroller", resize);

		// At the start, call resize()
		// to setup scroller.
		resize();

		index.update();
		yCoords.update();

		// hack to get position
		// to be called once for
		// the scroll position on
		// load.
		// @v4 timer no longer stops if you
		// return true at the end of the callback
		// function - so here we stop it explicitly.
		let timer = d3.timer(() => {
			updateSectionIndex();
			timer.stop();
		});
	}

	/**
	 * resize - called initially and
	 * also when page is resized.
	 * Resets the sectionYCoords
	 *
	 */
	function resize() {
		// sectionYCoords will be each sections
		// starting position relative to the top
		// of the first section.
		sectionYCoords = [];
		let startPos;
		sections.each(function (d, i) {
			//
			let thisSectionTop = this.getBoundingClientRect().top;
			if (i === 0) {
				startPos = thisSectionTop;
			}
			sectionYCoords.push(thisSectionTop - startPos);
		});
		containerStart =
			container.node().getBoundingClientRect().top + window.scrollY;

		updateInfo();
	}

	/**
	 * updateSectionIndex - get the current index
	 * based on the user's position.
	 * if user has scrolled to new section,
	 * dispatch active event with new section
	 * index.
	 *
	 */
	function updateSectionIndex() {
		// get the current y coordinates.
		let yPos = window.scrollY - 10 - containerStart;
		let newIndex = d3.bisect(sectionYCoords, yPos);
		newIndex = Math.min(sections.size() - 1, newIndex);

		// if the index has changed to a new one
		if (currentSectionIndex !== newIndex) {
			// @v4 you now `.call` the dispatch callback
			currentSectionIndex = newIndex;
			dispatch.call("active", this, currentSectionIndex);
		}

		let prevIndex = Math.max(currentSectionIndex - 1, 0);
		let prevTop = sectionYCoords[prevIndex];
		let progress =
			(yPos - prevTop) / (sectionYCoords[currentSectionIndex] - prevTop);

		// @v4 you now `.call` the dispatch callback
		dispatch.call("progress", this, currentSectionIndex, progress);

		updateInfo();
	}

	/**
	 * container - get/set the parent element
	 * of the sections. Useful for if the
	 * scrolling doesn't start at the very top
	 * of the page.
	 *
	 * @param value - the new container value
	 */
	scroll.container = (...args) => {
		if (args.length === 0) {
			return container;
		}
		container = args[0];
		return scroll;
	};

	// @v4 There is now no d3.rebind, so this implements
	// a .on method to pass in a callback to the dispatcher.
	scroll.on = (action, callback) => {
		dispatch.on(action, callback);
	};

	function updateInfo() {
		index.update();
		yCoords.update();
		d3.select("#info").text(yCoords.allSections[index.current]);
	}
	return scroll;
}
