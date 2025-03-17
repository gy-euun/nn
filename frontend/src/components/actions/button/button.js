/**
 * KRDS 버튼 컴포넌트 JavaScript
 * 이 모듈은 버튼 컴포넌트의 동작을 처리합니다.
 */

/**
 * 버튼 초기화 함수
 * 페이지 내의 모든 KRDS 버튼에 이벤트 핸들러를 연결합니다.
 */
export function initButtons() {
  // 로딩 상태 버튼 초기화
  initLoadingButtons();
  
  // 클릭 이벤트에 리플 효과 추가
  initRippleEffect();
  
  // 버튼 접근성 향상
  enhanceButtonAccessibility();
}

/**
 * 로딩 상태 버튼 초기화
 * 로딩 상태를 제어하는 메서드 추가
 */
function initLoadingButtons() {
  const buttons = document.querySelectorAll('.krds-button');
  
  buttons.forEach(button => {
    // 버튼에 로딩 상태 시작 메서드 추가
    button.startLoading = function() {
      if (!this.classList.contains('krds-button--loading')) {
        // 기존 disabled 상태 저장
        this.dataset.wasDisabled = this.disabled;
        
        // 로딩 클래스 추가 및 비활성화
        this.classList.add('krds-button--loading');
        this.disabled = true;
        
        // 로딩 인디케이터가 없으면 추가
        if (!this.querySelector('.krds-button__loading')) {
          const loader = document.createElement('span');
          loader.className = 'krds-button__loading';
          this.insertBefore(loader, this.firstChild);
        }
      }
    };
    
    // 버튼에 로딩 상태 종료 메서드 추가
    button.stopLoading = function() {
      if (this.classList.contains('krds-button--loading')) {
        // 로딩 클래스 제거
        this.classList.remove('krds-button--loading');
        
        // 이전 disabled 상태로 복원
        if (this.dataset.wasDisabled === 'false' || !this.dataset.hasOwnProperty('wasDisabled')) {
          this.disabled = false;
        }
        
        // 로딩 인디케이터 제거
        const loader = this.querySelector('.krds-button__loading');
        if (loader) {
          loader.remove();
        }
      }
    };
  });
}

/**
 * 버튼에 리플 효과 추가
 */
function initRippleEffect() {
  const buttons = document.querySelectorAll('.krds-button');
  
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // 버튼이 비활성화 상태이거나 이미 로딩 중이면 리플 효과 생략
      if (this.disabled || this.classList.contains('krds-button--loading')) {
        return;
      }
      
      // 리플 효과 요소 생성
      const ripple = document.createElement('span');
      ripple.className = 'krds-button__ripple';
      
      // 리플 스타일 설정
      const size = Math.max(this.offsetWidth, this.offsetHeight);
      ripple.style.width = ripple.style.height = `${size}px`;
      
      // 클릭 위치 계산
      const rect = this.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left - (size / 2)}px`;
      ripple.style.top = `${e.clientY - rect.top - (size / 2)}px`;
      
      // DOM에 추가
      this.appendChild(ripple);
      
      // 애니메이션 완료 후 제거
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // 리플 효과 스타일 추가
  addRippleStyle();
}

/**
 * 동적으로 리플 효과 스타일 추가
 */
function addRippleStyle() {
  if (!document.getElementById('krds-button-ripple-style')) {
    const style = document.createElement('style');
    style.id = 'krds-button-ripple-style';
    style.textContent = `
      .krds-button {
        position: relative;
        overflow: hidden;
      }
      .krds-button__ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
      }
      @keyframes ripple-animation {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 버튼 접근성 향상
 */
function enhanceButtonAccessibility() {
  const buttons = document.querySelectorAll('.krds-button');
  
  buttons.forEach(button => {
    // 키보드 탐색 지원
    button.addEventListener('keydown', function(e) {
      // 스페이스바 또는 엔터 키 누를 때 클릭 이벤트 발생
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.click();
      }
    });
    
    // 아이콘만 있는 버튼은 aria-label 속성이 있는지 확인
    if (button.classList.contains('krds-button--icon') && !button.hasAttribute('aria-label')) {
      console.warn('아이콘 버튼에는 aria-label 속성이 필요합니다:', button);
    }
  });
}

// 문서 로드 완료 시 버튼 초기화
document.addEventListener('DOMContentLoaded', initButtons);

// 비동기적으로 추가되는 버튼에 대한 처리
export function initDynamicButtons(container = document) {
  const buttons = container.querySelectorAll('.krds-button:not(.krds-button-initialized)');
  
  buttons.forEach(button => {
    button.classList.add('krds-button-initialized');
    
    // 로딩 메서드 추가
    button.startLoading = function() { /* ... */ };
    button.stopLoading = function() { /* ... */ };
    
    // 리플 효과 이벤트 리스너 추가
    button.addEventListener('click', function(e) { /* ... */ });
    
    // 접근성 이벤트 리스너 추가
    button.addEventListener('keydown', function(e) { /* ... */ });
  });
} 