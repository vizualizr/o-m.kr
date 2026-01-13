
/**
 * ScrollerController
 * 스크롤 위치에 따라 현재 인덱스와 진행률을 계산하는 코어 엔진
 */
export class ScrollerController {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.sectionSelector = options.sectionSelector || 'section';
        this.sections = null;
        this.yCoords = [];
        this.containerStart = 0;
        this.currentIndex = -1;
        this.progress = 0;

        // 이벤트를 외부에서 구독할 수 있도록 콜백 저장소 운영
        this.callbacks = {
            active: [],
            progress: [],
            resize: []
        };

        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    /**
     * 초기화: 섹션을 선택하고 이벤트를 바인딩함
     */
    init() {
        this.sections = this.container.querySelectorAll(this.sectionSelector);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
        this.handleScroll();
    }

    /**
     * 이벤트 리스너 제거
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    /**
     * 섹션들의 절대 위치를 다시 계산
     */
    handleResize() {
        const sectionCoords = [];
        const containerRect = this.container.getBoundingClientRect();
        this.containerStart = containerRect.top + window.scrollY;

        this.sections.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            const top = rect.top + window.scrollY;
            sectionCoords.push(top - this.containerStart);
        });

        this.yCoords = sectionCoords;
        this.trigger('resize', { yCoords: this.yCoords });
    }

    /**
     * 스크롤 시 현재 인덱스와 진행률 계산
     */
    handleScroll() {
        const yPos = window.scrollY - this.containerStart - window.innerHeight / 2;

        // 이진 탐색을 통한 현재 인덱스 찾기 (D3 없이 구현)
        let indexNow = this.bisect(this.yCoords, yPos);
        indexNow = Math.min(this.sections.length - 1, indexNow);

        if (this.currentIndex !== indexNow) {
            this.currentIndex = indexNow;
            this.trigger('active', { index: this.currentIndex });
        }

        // 진행률(Progress) 계산
        const prevIndex = Math.max(this.currentIndex - 1, 0);
        const start = this.yCoords[prevIndex];
        const end = this.yCoords[this.currentIndex];

        if (end !== start) {
            this.progress = (yPos - start) / (end - start);
        } else {
            this.progress = 0;
        }

        this.trigger('progress', { index: this.currentIndex, progress: this.progress });
    }

    /**
     * D3.bisectRight와 유사한 동작을 하는 이진 탐색 함수
     */
    bisect(arr, x) {
        let low = 0;
        let high = arr.length;
        while (low < high) {
            const mid = (low + high) >>> 1;
            if (arr[mid] <= x) low = mid + 1;
            else high = mid;
        }
        return low;
    }

    /**
     * 이벤트 구독
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
        return this;
    }

    /**
     * 이벤트 실행
     */
    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(data));
        }
    }
}
