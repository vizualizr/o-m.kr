
/**
 * VisualizationBase.js (Example Template)
 * Scroller2와 연동되는 D3 시각화를 작성할 때 참고할 베이스 구조
 */
export class VisualizationBase {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.svg = null;
        this.width = 0;
        this.height = 0;
        this.activeIndex = -1;

        if (this.container) {
            this.init();
            this.bindEvents();
        }
    }

    init() {
        // 기본 SVG 설정 등의 초기화 로직
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;

        // d3 등을 여기서 사용 가능
        // this.svg = d3.select(this.container).append('svg')...
    }

    bindEvents() {
        // Scroller2가 발생하는 이벤트를 수신
        const scrollerRoot = this.container.closest('[data-scroller2]');
        if (scrollerRoot) {
            scrollerRoot.addEventListener('scroller:active', (e) => {
                this.onActivate(e.detail.index);
            });
            scrollerRoot.addEventListener('scroller:progress', (e) => {
                this.onProgress(e.detail.index, e.detail.progress);
            });
        }
    }

    // 상속받아 구현할 메서드들
    onActivate(index) {
        console.log(`Switched to step ${index}`);
        this.activeIndex = index;
        // 시각화 업데이트 로직 (transition 등)
    }

    onProgress(index, progress) {
        // 스크롤 진행률에 따른 세밀한 애니메이션 처리
    }
}
