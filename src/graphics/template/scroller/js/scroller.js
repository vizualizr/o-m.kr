/**
 * scrollHandler
 * - stores the all necessary coordinates, HTML elements, and events.
 */
function scrollHandler() {
	// if not specified graphics will be nested in Body element.
	let container = d3.select("body");

	// event dispatcher will be initialized inside the scroller function
	// registers two types of event,  active and progress.
	let dispatch = d3.dispatch("active", "progress");

	// d3 selection of all HTML elements with
	// enclosing text sections
	// where user will scroll through.
	// Probably an array of <section> element
	let sections = null;

	/**
	 * yCoords
	 * - An object collects and updates all the y coordinates required
	 * to decide current index and user's progress of scroll
	 */
	let yCoords = {
		// yCoords.allSections stores
		// all y coordinates of each HTML elements
		allSections: [],
		// yCoords.containerStart stores
		// the y coordinates of the beginning of sections.
		containerStart: 0,
		update: function () {
			let startPos;
			let _tempArray = [];

			// Get more details on
			// how get an array of y coordinates
			// from the link below.
			// https://vallandingham.me/scroller.html#a-reusable-scroller
			sections.each(function (d, i) {
				let thisSectionTop = this.getBoundingClientRect().top;
				if (i === 0) {
					startPos = thisSectionTop;
				}
				_tempArray.push(thisSectionTop - startPos);
			});

			this.allSections = [..._tempArray];
			this.containerStart =
				// selection.node() returns
				// the DOM object of the selected element.
				container.node().getBoundingClientRect().top + window.scrollY;
		},
	};

	/**
	 * index
	 * - An object collects and updates the current index and the progress within the index progress is int over 0 and below 1, e.g. 0.8
	 */
	let index = {
		current: -1,
		prev: undefined,
		progress: undefined,
		update: function () {
			let yPos = window.scrollY - 10 - yCoords.containerStart;
			let indexNow = d3.bisect(yCoords.allSections, yPos);
			indexNow = Math.min(sections.size() - 1, indexNow);

			if (this.current !== indexNow) {
				this.current = indexNow;
				// if scrolled position enters a new index
				// broadcast the event "active"
				dispatch.call("active", this, this.current);
			}

			this.current = indexNow;
			this.prev = Math.max(this.current - 1, 0);
			this.progress =
				(yPos - yCoords.allSections[this.prev]) /
				(yCoords.allSections[this.current] - yCoords.allSections[this.prev]);

			// Dispatch the graphics for this.current proceeds
			// its animation based on this.progress
			dispatch.call("progress", this, this.current, this.progress);
		},
	};

	/**
	 * scroller - constructor function.
	 * This is a sole agent that
	 * broadcasts event to activate
	 * which index and graphic
	 *
	 * @param selectedElements - The selected elements by d3.
	 * selectAll which will be scrolled through by user.
	 * E.g. d3.selectAll(".step")
	 */

	function scroller(selectedElements) {
		sections = selectedElements;

		// when window is scrolled
		// call updateIndex.
		// When window is resized
		// call updateYCoords.
		d3.select(window)
			.on("scroll.scroller", updateIndex)
			.on("resize.scroller", updateYCoords);

		// As an constructor it is necessary
		// to init the y coordinates by calling updateYCoords()
		updateYCoords();

		// @v4 timer no longer stops if you
		// return true at the end of the callback
		// function - so here we stop it explicitly.
		let timer = d3.timer(() => {
			updateIndex();
			timer.stop();
		});
	}

	function updateIndex() {
		index.update();
		updateInfo();
	}

	function updateYCoords() {
		// formerly resize()
		yCoords.update();
		updateInfo();
	}

	/**
	 * attachContainer - get/set the parent element
	 * of the sections. Useful for if the
	 * scrolling doesn't start at the very top
	 * of the page.
	 *
	 * @param ...args - the new container value
	 */
	scroller.attachContainer = (...args) => {
		if (args.length === 0) {
			return container;
		}
		container = args[0];
		return scroller;
	};

	// @v4 There is now no d3.rebind, so this implements
	// a .on method to pass in a callback to the dispatcher.
	scroller.on = (action, callback) => {
		dispatch.on(action, callback);
	};

	function updateInfo() {
		d3.select("#info").text(
			`${yCoords.allSections[index.current]}, ${window.scrollY}`,
		);
	}
	return scroller;
}
