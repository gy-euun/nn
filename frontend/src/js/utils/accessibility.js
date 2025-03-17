/**
 * 접근성 기능 초기화
 * 
 * 접근성 관련 기능을 초기화합니다.
 */
export function setupA11y() {
  setupSkipLinks();
  setupFocusRing();
  setupTabTrap();
}

/**
 * 건너뛰기 링크 초기화
 * 
 * 건너뛰기 링크가 제대로 작동하도록 설정합니다.
 */
function setupSkipLinks() {
  const skipLinks = document.querySelectorAll('.krds-skip-link');
  
  skipLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus();
        
        // 포커스가 이동한 후 tabindex 제거
        targetElement.addEventListener('blur', function() {
          this.removeAttribute('tabindex');
        }, { once: true });
      }
    });
  });
}

/**
 * 포커스 링 초기화
 * 
 * 키보드 사용자를 위한 포커스 표시 기능을 설정합니다.
 */
function setupFocusRing() {
  // 마우스를 사용할 때는 포커스 링 숨기기, 키보드를 사용할 때는 표시
  document.body.addEventListener('mousedown', function() {
    document.body.classList.add('using-mouse');
  });
  
  document.body.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.remove('using-mouse');
    }
  });
}

/**
 * 탭 트랩 초기화
 * 
 * 모달, 드롭다운 메뉴 등에서 탭 키 이동이 해당 요소 내에서만 이루어지도록 설정합니다.
 */
function setupTabTrap() {
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    
    // 현재 열려있는 모달, 드롭다운 등을 찾아서 처리
    const trapElements = document.querySelectorAll('[data-trap-focus="true"]');
    
    if (trapElements.length === 0) return;
    
    // 가장 최근에 열린 요소(z-index가 가장 높은 요소)만 처리
    const trapElement = trapElements[trapElements.length - 1];
    const focusableElements = trapElement.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable.focus();
    }
  });
} 