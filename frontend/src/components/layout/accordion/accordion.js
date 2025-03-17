/**
 * 아코디언 컴포넌트 자바스크립트
 * 아코디언 패널의 확장/축소 기능을 관리합니다.
 */

/**
 * 아코디언 초기화 함수
 * 모든 아코디언 요소에 이벤트 리스너를 추가합니다.
 */
const initAccordions = () => {
  const accordions = document.querySelectorAll('.krds-accordion');
  
  accordions.forEach(accordion => {
    const buttons = accordion.querySelectorAll('.krds-accordion-button');
    
    // 단일 확장 아코디언 여부 확인
    const isSingleExpand = accordion.classList.contains('krds-accordion-single');
    
    // 각 버튼에 클릭 이벤트 추가
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const panelId = button.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);
        
        // 단일 확장 아코디언일 경우 다른 모든 패널 닫기
        if (isSingleExpand && !isExpanded) {
          buttons.forEach(otherButton => {
            if (otherButton !== button) {
              collapseAccordion(otherButton);
            }
          });
        }
        
        // 현재 상태와 반대로 전환
        if (isExpanded) {
          collapseAccordion(button);
        } else {
          expandAccordion(button);
        }
        
        // 확장/축소 이벤트 발생
        const event = new CustomEvent('krds-accordion-toggle', {
          bubbles: true,
          detail: {
            accordion,
            button,
            panel,
            isExpanded: !isExpanded
          }
        });
        button.dispatchEvent(event);
      });
      
      // 키보드 접근성 추가
      button.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'ArrowDown':
            // 다음 버튼으로 포커스 이동
            focusNextButton(button, buttons);
            event.preventDefault();
            break;
          case 'ArrowUp':
            // 이전 버튼으로 포커스 이동
            focusPrevButton(button, buttons);
            event.preventDefault();
            break;
          case 'Home':
            // 첫 번째 버튼으로 포커스 이동
            buttons[0].focus();
            event.preventDefault();
            break;
          case 'End':
            // 마지막 버튼으로 포커스 이동
            buttons[buttons.length - 1].focus();
            event.preventDefault();
            break;
        }
      });
    });
  });
  
  // 초기 상태 설정 (필요한 경우 여기에 추가)
};

/**
 * 아코디언 확장 함수
 * @param {HTMLElement} button - 아코디언 버튼 요소
 */
const expandAccordion = (button) => {
  const panelId = button.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);
  
  if (!panel) return;
  
  // 상태 업데이트
  button.setAttribute('aria-expanded', 'true');
  panel.removeAttribute('hidden');
  
  // 애니메이션 적용
  animateExpand(panel);
};

/**
 * 아코디언 축소 함수
 * @param {HTMLElement} button - 아코디언 버튼 요소
 */
const collapseAccordion = (button) => {
  const panelId = button.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);
  
  if (!panel) return;
  
  // 상태 업데이트
  button.setAttribute('aria-expanded', 'false');
  
  // 애니메이션 적용
  animateCollapse(panel, () => {
    panel.setAttribute('hidden', '');
  });
};

/**
 * 확장 애니메이션 함수
 * @param {HTMLElement} panel - 아코디언 패널 요소
 */
const animateExpand = (panel) => {
  // 애니메이션을 위해 높이 계산
  const panelContent = panel.querySelector('.krds-accordion-content');
  if (!panelContent) return;
  
  // 높이 계산을 위해 일시적으로 높이를 auto로 설정
  panel.style.height = 'auto';
  const height = panel.offsetHeight;
  
  // 애니메이션을 위해 초기 높이를 0으로 설정
  panel.style.height = '0';
  
  // 리플로우 강제
  panel.offsetHeight; // 이 코드는 리플로우를 강제로 발생시킵니다
  
  // 애니메이션 적용
  panel.style.transition = 'height 0.3s ease';
  panel.style.height = height + 'px';
  
  // 애니메이션 완료 후 처리
  panel.addEventListener('transitionend', function handler() {
    panel.style.height = 'auto';
    panel.removeEventListener('transitionend', handler);
  }, { once: true });
};

/**
 * 축소 애니메이션 함수
 * @param {HTMLElement} panel - 아코디언 패널 요소
 * @param {Function} callback - 애니메이션 완료 후 실행할 콜백 함수
 */
const animateCollapse = (panel, callback) => {
  // 현재 높이 계산
  const height = panel.offsetHeight;
  
  // 명시적으로 높이 설정
  panel.style.height = height + 'px';
  
  // 리플로우 강제
  panel.offsetHeight;
  
  // 애니메이션 적용
  panel.style.transition = 'height 0.3s ease';
  panel.style.height = '0';
  
  // 애니메이션 완료 후 처리
  panel.addEventListener('transitionend', function handler() {
    panel.style.transition = '';
    if (callback) callback();
    panel.removeEventListener('transitionend', handler);
  }, { once: true });
};

/**
 * 다음 버튼으로 포커스 이동 함수
 * @param {HTMLElement} currentButton - 현재 포커스된 버튼
 * @param {NodeList} buttons - 모든 버튼 목록
 */
const focusNextButton = (currentButton, buttons) => {
  const currentIndex = Array.from(buttons).indexOf(currentButton);
  const nextIndex = (currentIndex + 1) % buttons.length;
  buttons[nextIndex].focus();
};

/**
 * 이전 버튼으로 포커스 이동 함수
 * @param {HTMLElement} currentButton - 현재 포커스된 버튼
 * @param {NodeList} buttons - 모든 버튼 목록
 */
const focusPrevButton = (currentButton, buttons) => {
  const currentIndex = Array.from(buttons).indexOf(currentButton);
  const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
  buttons[prevIndex].focus();
};

/**
 * 모든 아코디언 닫기 함수
 * @param {HTMLElement} accordion - 아코디언 컨테이너 요소
 */
const collapseAll = (accordion) => {
  const buttons = accordion.querySelectorAll('.krds-accordion-button');
  buttons.forEach(button => {
    collapseAccordion(button);
  });
};

/**
 * 모든 아코디언 열기 함수
 * @param {HTMLElement} accordion - 아코디언 컨테이너 요소
 */
const expandAll = (accordion) => {
  const buttons = accordion.querySelectorAll('.krds-accordion-button');
  buttons.forEach(button => {
    expandAccordion(button);
  });
};

/**
 * 특정 아코디언 열기 함수
 * @param {string} id - 아코디언 버튼 또는 패널의 ID
 */
const openAccordion = (id) => {
  let button;
  
  // ID가 버튼의 ID인지 패널의 ID인지 확인
  button = document.getElementById(id);
  if (!button || !button.classList.contains('krds-accordion-button')) {
    // 패널 ID로 버튼을 찾음
    const panel = document.getElementById(id);
    if (panel) {
      const buttonId = panel.getAttribute('aria-labelledby');
      button = document.getElementById(buttonId);
    }
  }
  
  if (button) {
    expandAccordion(button);
    button.focus();
  }
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initAccordions);

// 외부로 공개할 API
window.krdsAccordion = {
  init: initAccordions,
  expand: expandAccordion,
  collapse: collapseAccordion,
  expandAll: expandAll,
  collapseAll: collapseAll,
  open: openAccordion
}; 