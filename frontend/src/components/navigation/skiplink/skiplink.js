/**
 * KRDS 건너뛰기 링크 컴포넌트
 * 
 * 접근성을 위한 건너뛰기 링크 기능을 초기화하고 관리합니다.
 */

// 건너뛰기 링크 컴포넌트 초기화
function initSkipLinks() {
  const skipLinks = document.querySelectorAll('#krds-skip-link a, #krds-skip-link-multiple a, #krds-skip-link-custom a');
  
  if (!skipLinks.length) return;
  
  // 각 건너뛰기 링크에 이벤트 리스너 등록
  skipLinks.forEach(link => {
    link.addEventListener('click', handleSkipLinkClick);
    link.addEventListener('keydown', handleSkipLinkKeydown);
  });
  
  // 새로운 건너뛰기 링크 찾기 (동적으로 추가된 경우)
  observeNewSkipLinks();
}

/**
 * 건너뛰기 링크 클릭 이벤트 처리
 * @param {Event} event - 이벤트 객체
 */
function handleSkipLinkClick(event) {
  const targetId = event.currentTarget.getAttribute('href').substring(1);
  const targetElement = document.getElementById(targetId);
  
  if (targetElement) {
    event.preventDefault();
    
    // 대상 요소에 포커스 가능한 속성 추가 (tabindex="0"이 없는 경우)
    if (!targetElement.hasAttribute('tabindex')) {
      targetElement.setAttribute('tabindex', '-1');
    }
    
    // 대상 요소 포커스
    targetElement.focus();
    
    // URL 해시 업데이트
    if (history.pushState) {
      history.pushState(null, null, '#' + targetId);
    } else {
      location.hash = '#' + targetId;
    }
    
    // 커스텀 이벤트 발생
    const customEvent = new CustomEvent('krds:skiplink:navigated', {
      detail: {
        targetId: targetId,
        targetElement: targetElement
      },
      bubbles: true
    });
    
    event.currentTarget.dispatchEvent(customEvent);
  }
}

/**
 * 건너뛰기 링크 키보드 이벤트 처리
 * @param {KeyboardEvent} event - 키보드 이벤트 객체
 */
function handleSkipLinkKeydown(event) {
  // Enter 키 처리 (기본적으로 링크는 Enter 키로 활성화됨)
  if (event.key === 'Enter') {
    handleSkipLinkClick(event);
  }
}

/**
 * DOM의 변경을 관찰하여 새로운 건너뛰기 링크를 찾아 이벤트를 등록
 */
function observeNewSkipLinks() {
  // MutationObserver가 지원되는지 확인
  if (!window.MutationObserver) return;
  
  // DOM 변경을 관찰하는 옵저버 생성
  const observer = new MutationObserver(mutations => {
    let shouldInit = false;
    
    // 변경된 DOM에서 새로운 건너뛰기 링크를 확인
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 새로 추가된 요소에서 건너뛰기 링크를 찾음
            const newSkipLinks = node.querySelectorAll('#krds-skip-link a, #krds-skip-link-multiple a, #krds-skip-link-custom a');
            if (newSkipLinks.length) {
              shouldInit = true;
            }
          }
        });
      }
    });
    
    // 새로운 건너뛰기 링크가 있으면 초기화
    if (shouldInit) {
      initSkipLinks();
    }
  });
  
  // 문서 전체를 관찰
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * 페이지 로드 시 URL 해시가 있는 경우 해당 요소로 포커스
 */
function handleInitialHash() {
  if (location.hash) {
    const targetId = location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // 애니메이션이 완료된 후 요소에 포커스
      setTimeout(() => {
        // 대상 요소에 포커스 가능한 속성 추가 (tabindex="0"이 없는 경우)
        if (!targetElement.hasAttribute('tabindex')) {
          targetElement.setAttribute('tabindex', '-1');
        }
        
        targetElement.focus();
      }, 100);
    }
  }
}

/**
 * 새로운 건너뛰기 링크 생성 함수
 * @param {string} targetId - 건너뛸 대상 요소의 ID
 * @param {string} text - 링크 텍스트
 * @param {Object} options - 추가 옵션
 * @returns {HTMLElement} - 생성된 건너뛰기 링크 요소
 */
function createSkipLink(targetId, text, options = {}) {
  const skipLinkContainer = document.createElement('div');
  skipLinkContainer.id = options.containerId || 'krds-skip-link';
  skipLinkContainer.className = options.containerClass || '';
  
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = text;
  
  if (options.linkClass) {
    link.className = options.linkClass;
  }
  
  // 이벤트 등록
  link.addEventListener('click', handleSkipLinkClick);
  link.addEventListener('keydown', handleSkipLinkKeydown);
  
  skipLinkContainer.appendChild(link);
  
  return skipLinkContainer;
}

/**
 * 다중 건너뛰기 링크 생성 함수
 * @param {Array} items - 건너뛰기 링크 항목 배열 ({targetId, text} 형태)
 * @param {Object} options - 추가 옵션
 * @returns {HTMLElement} - 생성된 다중 건너뛰기 링크 요소
 */
function createMultipleSkipLinks(items, options = {}) {
  const skipLinkContainer = document.createElement('div');
  skipLinkContainer.id = options.containerId || 'krds-skip-link-multiple';
  skipLinkContainer.className = options.containerClass || '';
  
  const ul = document.createElement('ul');
  
  // 링크 항목 추가
  items.forEach(item => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${item.targetId}`;
    link.textContent = item.text;
    
    if (options.linkClass) {
      link.className = options.linkClass;
    }
    
    // 이벤트 등록
    link.addEventListener('click', handleSkipLinkClick);
    link.addEventListener('keydown', handleSkipLinkKeydown);
    
    li.appendChild(link);
    ul.appendChild(li);
  });
  
  skipLinkContainer.appendChild(ul);
  
  return skipLinkContainer;
}

// DOMContentLoaded 이벤트에서 건너뛰기 링크 초기화
document.addEventListener('DOMContentLoaded', () => {
  initSkipLinks();
  handleInitialHash();
});

// 모듈로 내보내기 (필요한 경우)
export {
  initSkipLinks,
  createSkipLink,
  createMultipleSkipLinks
}; 