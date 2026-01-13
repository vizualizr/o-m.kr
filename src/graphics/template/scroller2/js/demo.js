
import { VisualizationBase } from "./VisualizationBase.js";

export class DemoVis extends VisualizationBase {
    onActivate(index) {
        super.onActivate(index);
        const container = this.container.querySelector('p');
        if (container) {
            container.textContent = "현재 인덱스: " + index + " - 시각화 상태 업데이트 중...";
            container.classList.add('animate-pulse');
            setTimeout(() => container.classList.remove('animate-pulse'), 500);
        }
    }
}

// 자동 초기화 (MDX 구문 충돌 방지)
export function initDemo(selector) {
    const runInit = () => new DemoVis(selector);

    if (document.readyState === 'loading') {
        window.addEventListener('load', runInit);
    } else {
        runInit();
    }
}
