/**
 * KRDS 토글 스위치 컴포넌트
 * 
 * 토글 스위치 컴포넌트의 기능을 초기화하고 관리합니다.
 */

// 토글 스위치 컴포넌트 초기화
function initToggleSwitches() {
  const toggles = document.querySelectorAll('.krds-form-toggle-switch input[type="checkbox"]');
  
  if (!toggles.length) return;
  
  // 각 토글 스위치에 이벤트 리스너 등록
  toggles.forEach(toggle => {
    // 이벤트 리스너 추가
    toggle.addEventListener('change', handleToggleChange);
    toggle.addEventListener('keydown', handleToggleKeydown);
    
    // 초기 상태 설정
    updateAriaAttributes(toggle);
  });
  
  // 새로운 토글 스위치 감지 (동적으로 추가된 경우)
  observeNewToggleSwitches();
}

/**
 * 토글 스위치 변경 이벤트 처리
 * @param {Event} event - 이벤트 객체
 */
function handleToggleChange(event) {
  const toggle = event.target;
  
  // ARIA 속성 업데이트
  updateAriaAttributes(toggle);
  
  // 커스텀 이벤트 발생
  const customEvent = new CustomEvent('krds:toggle:change', {
    detail: {
      checked: toggle.checked,
      element: toggle
    },
    bubbles: true
  });
  
  toggle.dispatchEvent(customEvent);
}

/**
 * 토글 스위치 키보드 이벤트 처리
 * @param {KeyboardEvent} event - 키보드 이벤트 객체
 */
function handleToggleKeydown(event) {
  const toggle = event.target;
  
  // Space 키로 토글 활성화 (기본 동작)
  if (event.key === ' ' || event.key === 'Spacebar') {
    // 기본 동작이므로 특별한 처리 없음
  }
  
  // Enter 키로도 토글 활성화
  if (event.key === 'Enter') {
    event.preventDefault();
    toggle.checked = !toggle.checked;
    toggle.dispatchEvent(new Event('change'));
  }
}

/**
 * 토글 스위치의 ARIA 속성 업데이트
 * @param {HTMLElement} toggle - 토글 스위치 요소
 */
function updateAriaAttributes(toggle) {
  // 상태 관련 ARIA 속성 설정
  toggle.setAttribute('aria-checked', toggle.checked);
  
  // 비활성화 상태 ARIA 속성 설정
  if (toggle.disabled) {
    toggle.setAttribute('aria-disabled', 'true');
  } else {
    toggle.removeAttribute('aria-disabled');
  }
  
  // 토글 스위치의 역할 설정 (없는 경우)
  if (!toggle.hasAttribute('role')) {
    toggle.setAttribute('role', 'switch');
  }
}

/**
 * DOM의 변경을 관찰하여 새로운 토글 스위치를 찾아 이벤트를 등록
 */
function observeNewToggleSwitches() {
  // MutationObserver가 지원되는지 확인
  if (!window.MutationObserver) return;
  
  // DOM 변경을 관찰하는 옵저버 생성
  const observer = new MutationObserver(mutations => {
    let shouldInit = false;
    
    // 변경된 DOM에서 새로운 토글 스위치를 확인
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 새로 추가된 요소에서 토글 스위치를 찾음
            const newToggles = node.querySelectorAll('.krds-form-toggle-switch input[type="checkbox"]');
            if (newToggles.length) {
              shouldInit = true;
            }
          }
        });
      }
    });
    
    // 새로운 토글 스위치가 있으면 초기화
    if (shouldInit) {
      initToggleSwitches();
    }
  });
  
  // 문서 전체를 관찰
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * 토글 스위치 요소 생성 함수
 * @param {Object} options - 옵션 객체
 * @returns {HTMLElement} - 생성된 토글 스위치 요소
 */
function createToggleSwitch(options = {}) {
  // 기본 옵션
  const defaults = {
    id: `toggle-${Math.random().toString(36).substr(2, 9)}`,
    label: '토글 스위치',
    checked: false,
    disabled: false,
    size: '', // small, large, 또는 기본값(빈 문자열)
    color: '', // success, warning, danger, 또는 기본값(빈 문자열)
    labelPosition: '', // label-left, 또는 기본값(빈 문자열)
    withStatus: false,
    statusTextOn: 'ON',
    statusTextOff: 'OFF',
    onToggleChange: null
  };
  
  // 옵션 병합
  const settings = { ...defaults, ...options };
  
  // 토글 스위치 컨테이너 생성
  const container = document.createElement('div');
  container.className = 'krds-form-toggle-switch';
  
  // 크기 클래스 추가
  if (settings.size) {
    container.classList.add(settings.size);
  }
  
  // 색상 클래스 추가
  if (settings.color) {
    container.classList.add(settings.color);
  }
  
  // 라벨 위치 클래스 추가
  if (settings.labelPosition) {
    container.classList.add(settings.labelPosition);
  }
  
  // 상태 텍스트 클래스 추가
  if (settings.withStatus) {
    container.classList.add('with-status');
  }
  
  // 체크박스 요소 생성
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = settings.id;
  input.checked = settings.checked;
  input.disabled = settings.disabled;
  input.setAttribute('role', 'switch');
  input.setAttribute('aria-checked', settings.checked);
  
  if (settings.disabled) {
    input.setAttribute('aria-disabled', 'true');
  }
  
  // 라벨 요소 생성
  const label = document.createElement('label');
  label.setAttribute('for', settings.id);
  
  // 토글 UI 생성
  const switchToggle = document.createElement('span');
  switchToggle.className = 'switch-toggle';
  
  const toggleIndicator = document.createElement('i');
  switchToggle.appendChild(toggleIndicator);
  
  // 상태 텍스트 추가 (옵션)
  if (settings.withStatus) {
    const statusTextOn = document.createElement('span');
    statusTextOn.className = 'status-text on';
    statusTextOn.textContent = settings.statusTextOn;
    switchToggle.appendChild(statusTextOn);
    
    const statusTextOff = document.createElement('span');
    statusTextOff.className = 'status-text off';
    statusTextOff.textContent = settings.statusTextOff;
    switchToggle.appendChild(statusTextOff);
    
    const labelText = document.createElement('span');
    labelText.className = 'label-text';
    labelText.textContent = settings.label;
    
    label.appendChild(switchToggle);
    label.appendChild(labelText);
  } else {
    label.appendChild(switchToggle);
    label.appendChild(document.createTextNode(settings.label));
  }
  
  // 이벤트 리스너 추가
  input.addEventListener('change', event => {
    // ARIA 속성 업데이트
    updateAriaAttributes(input);
    
    // 콜백 함수 실행 (있는 경우)
    if (typeof settings.onToggleChange === 'function') {
      settings.onToggleChange(input.checked, input);
    }
    
    // 커스텀 이벤트 발생
    const customEvent = new CustomEvent('krds:toggle:change', {
      detail: {
        checked: input.checked,
        element: input
      },
      bubbles: true
    });
    
    input.dispatchEvent(customEvent);
  });
  
  // 키보드 이벤트 리스너 추가
  input.addEventListener('keydown', handleToggleKeydown);
  
  // 요소 조립
  container.appendChild(input);
  container.appendChild(label);
  
  return container;
}

// DOMContentLoaded 이벤트에서 토글 스위치 초기화
document.addEventListener('DOMContentLoaded', () => {
  initToggleSwitches();
});

// 모듈로 내보내기 (필요한 경우)
export {
  initToggleSwitches,
  createToggleSwitch
}; 