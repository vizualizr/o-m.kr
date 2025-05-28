/**
 * scrollHandler
 * - stores the all necessary coordinates, HTML elements, and events.
 */
function scrollHandler() {
    // if not specified graphics will be nested in Body element.
    let container = d3.select("body");

    // event dispatcher will be initialized inside the scroller function
    // registers two types of event,  active and progress.
    let dispatch = d3.dispatch("active", "progress", "resize");

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

            // d3 v7에서는 .each의 콜백에서 (d, i) 대신 (event, d, i) 또는 (d, i, nodes) 사용
            sections.each(function(d, i) {
                let thisSectionTop = this.getBoundingClientRect().top;
                if (i === 0) {
                    startPos = thisSectionTop;
                }
                _tempArray.push(thisSectionTop - startPos);
            });

            this.allSections = [..._tempArray];
            this.containerStart =
                container.node().getBoundingClientRect().top + window.scrollY;
            dispatch.call("resize", this, this.current, this.progress);
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
            let yPos =
                window.scrollY - 10 - yCoords.containerStart - window.innerHeight / 2;
            // d3.bisect → d3.bisectRight (v7에서 d3.bisect는 제거됨)
            let indexNow = d3.bisectRight(yCoords.allSections, yPos);
            indexNow = Math.min(sections.size() - 1, indexNow);

            if (this.current !== indexNow) {
                this.current = indexNow;
                dispatch.call("active", this, this.current);
            }

            this.current = indexNow;
            this.prev = Math.max(this.current - 1, 0);
            this.progress =
                (yPos - yCoords.allSections[this.prev]) /
                (yCoords.allSections[this.current] - yCoords.allSections[this.prev]);

            dispatch.call("progress", this, this.current, this.progress);
        },
    };

    function scroller(selectedElements) {
        sections = selectedElements;

        // d3 v7에서는 .on의 네임스페이스 구문은 동일하게 동작
        d3.select(window)
            .on("scroll.scroller", updateIndex)
            .on("resize.scroller", updateYCoords);

        updateYCoords();

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
        yCoords.update();
        updateInfo();
    }

    scroller.attachContainer = (...args) => {
        if (args.length === 0) {
            return container;
        }
        container = args[0];
        return scroller;
    };

    scroller.on = (action, callback) => {
        dispatch.on(action, callback);
    };

    function updateInfo() {
        let nowMessage;
        nowMessage = `${yCoords.allSections[index.current] + yCoords.containerStart}, ${index.current}, 
        ${window.scrollY + yCoords.containerStart}, 
        ${yCoords.containerStart + container.node().getBoundingClientRect().height}`;
        nowMessage = index.current;
        d3.select("#info").text(nowMessage);
    }
    return scroller;
}
