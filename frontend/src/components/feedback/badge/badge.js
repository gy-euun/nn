/**
 * 배지 컴포넌트 자바스크립트
 * 배지의 제거 기능 및 카운터 업데이트를 관리합니다.
 */

/**
 * 배지 초기화 함수
 * 모든 제거 가능한 배지에 이벤트 리스너를 추가합니다.
 */
const initBadges = () => {
  // 제거 가능한 배지 초기화
  initDismissibleBadges();
};

/**
 * 제거 가능한 배지 초기화 함수
 * 닫기 버튼이 있는 배지에 이벤트 리스너를 추가합니다.
 */
const initDismissibleBadges = () => {
  const closeButtons = document.querySelectorAll('.krds-badge-close');
  
  closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      
      const badge = button.closest('.krds-badge');
      if (badge) {
        // 배지 제거 이벤트 발생
        const removeEvent = new CustomEvent('krds-badge-remove', {
          bubbles: true,
          detail: { badge }
        });
        badge.dispatchEvent(removeEvent);
        
        // 배지 숨기기 (애니메이션 후 제거)
        badge.style.opacity = '0';
        badge.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
          badge.remove();
        }, 200);
      }
    });
  });
};

/**
 * 카운터 배지 업데이트 함수
 * @param {HTMLElement} badge - 카운터 배지 요소
 * @param {number} count - 업데이트할 카운트 값
 * @param {Object} options - 추가 옵션
 */
const updateCounter = (badge, count, options = {}) => {
  if (!badge || !badge.classList.contains('krds-badge-counter')) return;
  
  const { 
    maxCount = 99, // 최대 표시 가능한 카운트
    animate = true // 애니메이션 적용 여부
  } = options;
  
  // 카운트 값 설정
  const displayValue = count > maxCount ? `${maxCount}+` : count.toString();
  
  if (animate) {
    // 애니메이션 적용
    badge.style.transform = 'translate(50%, -50%) scale(1.2)';
    setTimeout(() => {
      badge.textContent = displayValue;
      badge.style.transform = 'translate(50%, -50%) scale(1)';
    }, 100);
  } else {
    badge.textContent = displayValue;
  }
  
  // 카운트 값에 따라 배지 숨김 처리
  if (count <= 0) {
    badge.style.opacity = '0';
    badge.style.transform = 'translate(50%, -50%) scale(0.8)';
    setTimeout(() => {
      badge.style.display = 'none';
    }, 200);
  } else if (badge.style.display === 'none') {
    badge.style.display = 'inline-flex';
    setTimeout(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translate(50%, -50%) scale(1)';
    }, 10);
  }
  
  // 이벤트 발생
  const updateEvent = new CustomEvent('krds-badge-update', {
    bubbles: true,
    detail: { badge, count, displayValue }
  });
  badge.dispatchEvent(updateEvent);
};

/**
 * 새 배지 생성 함수
 * @param {string} text - 배지에 표시할 텍스트
 * @param {Object} options - 배지 옵션
 * @returns {HTMLElement} 생성된 배지 요소
 */
const createBadge = (text, options = {}) => {
  const {
    type = '', // 'primary', 'secondary', 'success', 'danger', 'warning', 'info' 등
    pill = false, // 둥근 모서리 배지 여부
    size = '', // 'sm', 'lg' 등
    isDismissible = false, // 제거 가능 여부
    isCounter = false, // 카운터 배지 여부
    isLight = false, // 라이트 색상 여부
    isOutline = false // 아웃라인 스타일 여부
  } = options;
  
  // 배지 요소 생성
  const badge = document.createElement('span');
  badge.className = 'krds-badge';
  
  // 타입 및 스타일 클래스 추가
  if (type) {
    if (isLight) {
      badge.classList.add(`krds-badge-${type}-light`);
    } else if (isOutline) {
      badge.classList.add(`krds-badge-outline-${type}`);
    } else {
      badge.classList.add(`krds-badge-${type}`);
    }
  }
  
  // 추가 클래스 적용
  if (pill) badge.classList.add('krds-badge-pill');
  if (size) badge.classList.add(`krds-badge-${size}`);
  if (isCounter) badge.classList.add('krds-badge-counter');
  if (isDismissible) badge.classList.add('krds-badge-dismissible');
  
  // 내용 설정
  badge.textContent = text;
  
  // 제거 가능한 배지인 경우 닫기 버튼 추가
  if (isDismissible) {
    const closeButton = document.createElement('button');
    closeButton.className = 'krds-badge-close';
    closeButton.setAttribute('aria-label', '배지 제거');
    closeButton.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // 닫기 버튼에 이벤트 리스너 추가
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      
      // 배지 제거 이벤트 발생
      const removeEvent = new CustomEvent('krds-badge-remove', {
        bubbles: true,
        detail: { badge }
      });
      badge.dispatchEvent(removeEvent);
      
      // 배지 숨기기 (애니메이션 후 제거)
      badge.style.opacity = '0';
      badge.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        badge.remove();
      }, 200);
    });
    
    badge.appendChild(closeButton);
  }
  
  return badge;
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initBadges);

// 외부로 공개할 API
window.krdsBadge = {
  init: initBadges,
  create: createBadge,
  updateCounter: updateCounter
}; 