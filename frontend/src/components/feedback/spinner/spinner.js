/**
 * KRDS 스피너 컴포넌트
 * 다양한 로딩 상태를 표시하는 컴포넌트
 */

(function() {
  'use strict';

  /**
   * 스피너 초기화
   */
  function initSpinners() {
    // 오버레이 스피너 버튼 이벤트 등록
    const overlayBtn = document.getElementById('show-overlay-spinner');
    if (overlayBtn) {
      overlayBtn.addEventListener('click', function() {
        showSpinnerOverlay('로딩 중입니다...', 3000);
      });
    }

    // 새로운 스피너 감시
    observeNewSpinners();

    // 예제 컨테이너에 스피너 생성 예시 추가
    const exampleContainer = document.querySelector('.example-api');
    if (exampleContainer) {
      // 기본 스피너 생성 버튼
      const createDefaultBtn = document.createElement('button');
      createDefaultBtn.className = 'btn';
      createDefaultBtn.textContent = '기본 스피너 생성';
      createDefaultBtn.addEventListener('click', function() {
        const spinner = createSpinner();
        document.getElementById('api-result').innerHTML = '';
        document.getElementById('api-result').appendChild(spinner);
      });
      
      // 크기 변형 스피너 생성 버튼
      const createSizeBtn = document.createElement('button');
      createSizeBtn.className = 'btn';
      createSizeBtn.textContent = '큰 스피너 생성';
      createSizeBtn.style.marginLeft = '8px';
      createSizeBtn.addEventListener('click', function() {
        const spinner = createSpinner({ size: 'large', color: 'success' });
        document.getElementById('api-result').innerHTML = '';
        document.getElementById('api-result').appendChild(spinner);
      });
      
      // 텍스트 포함 스피너 생성 버튼
      const createTextBtn = document.createElement('button');
      createTextBtn.className = 'btn';
      createTextBtn.textContent = '텍스트 스피너 생성';
      createTextBtn.style.marginLeft = '8px';
      createTextBtn.addEventListener('click', function() {
        const spinner = createSpinnerWithText('데이터 로딩 중...');
        document.getElementById('api-result').innerHTML = '';
        document.getElementById('api-result').appendChild(spinner);
      });
      
      // 바운스 스피너 생성 버튼
      const createBounceBtn = document.createElement('button');
      createBounceBtn.className = 'btn';
      createBounceBtn.textContent = '바운스 스피너 생성';
      createBounceBtn.style.marginLeft = '8px';
      createBounceBtn.addEventListener('click', function() {
        const spinner = createBounceSpinner();
        document.getElementById('api-result').innerHTML = '';
        document.getElementById('api-result').appendChild(spinner);
      });

      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'buttons-container';
      buttonsContainer.style.marginBottom = '16px';
      buttonsContainer.appendChild(createDefaultBtn);
      buttonsContainer.appendChild(createSizeBtn);
      buttonsContainer.appendChild(createTextBtn);
      buttonsContainer.appendChild(createBounceBtn);
      
      exampleContainer.appendChild(buttonsContainer);
      
      const resultContainer = document.createElement('div');
      resultContainer.id = 'api-result';
      resultContainer.style.minHeight = '100px';
      resultContainer.style.display = 'flex';
      resultContainer.style.justifyContent = 'center';
      resultContainer.style.alignItems = 'center';
      resultContainer.style.border = '1px dashed #ccc';
      resultContainer.style.borderRadius = '4px';
      resultContainer.style.padding = '16px';
      
      exampleContainer.appendChild(resultContainer);
    }
  }

  /**
   * 새로운 스피너 요소 감시
   */
  function observeNewSpinners() {
    // MutationObserver를 사용하여 DOM 변경 감시
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // ELEMENT_NODE
              const overlayBtn = node.querySelector('[data-spinner-overlay]');
              if (overlayBtn) {
                overlayBtn.addEventListener('click', function() {
                  const message = this.getAttribute('data-spinner-message') || '로딩 중입니다...';
                  const duration = parseInt(this.getAttribute('data-spinner-duration')) || 0;
                  showSpinnerOverlay(message, duration);
                });
              }
            }
          });
        }
      });
    });

    // 전체 문서 변경 감시 시작
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * 스피너 오버레이 표시
   * @param {string} message - 표시할 메시지
   * @param {number} duration - 자동으로 닫히는 시간 (ms), 0이면 자동으로 닫히지 않음
   * @return {HTMLElement} 생성된 오버레이 요소
   */
  function showSpinnerOverlay(message, duration) {
    // 기존 열린 오버레이가 있으면 제거
    hideSpinnerOverlay();

    // 새 오버레이 생성
    const overlay = document.createElement('div');
    overlay.className = 'krds-spinner-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'spinner-overlay-title');

    // 스피너 생성
    const spinner = createSpinner({ color: 'primary', size: 'large' });
    overlay.appendChild(spinner);

    // 메시지 표시
    if (message) {
      const messageEl = document.createElement('p');
      messageEl.id = 'spinner-overlay-title';
      messageEl.className = 'spinner-text';
      messageEl.textContent = message;
      overlay.appendChild(messageEl);
    }

    // 문서에 추가
    document.body.appendChild(overlay);

    // 오버레이 활성화
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);

    // ESC 키 감지하여 닫기
    const handleKeyDown = function(event) {
      if (event.key === 'Escape') {
        hideSpinnerOverlay();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 자동 닫기
    let timeoutId = null;
    if (duration > 0) {
      timeoutId = setTimeout(() => {
        hideSpinnerOverlay();
      }, duration);
    }

    // 오버레이 객체에 닫기 함수와 타이머 ID 저장
    overlay.close = function() {
      hideSpinnerOverlay();
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    return overlay;
  }

  /**
   * 스피너 오버레이 숨김
   */
  function hideSpinnerOverlay() {
    const overlay = document.querySelector('.krds-spinner-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.parentElement && overlay.parentElement.removeChild(overlay);
      }, 300);
    }
  }

  /**
   * 기본 스피너 생성
   * @param {Object} options - 스피너 옵션
   * @param {string} options.size - 스피너 크기 (small, medium, large)
   * @param {string} options.color - 스피너 색상 (primary, success, warning, error)
   * @return {HTMLElement} 생성된 스피너 요소
   */
  function createSpinner(options = {}) {
    const { size = 'medium', color = 'primary' } = options;

    const spinner = document.createElement('div');
    spinner.className = `krds-spinner ${size !== 'medium' ? size : ''}`;
    if (color !== 'primary') {
      spinner.classList.add(color);
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 50 50');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.classList.add('spinner-circle');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '25');
    circle.setAttribute('cy', '25');
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke-width', '5');

    svg.appendChild(circle);
    spinner.appendChild(svg);

    // 접근성을 위한 스크린 리더 텍스트
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = '로딩 중';
    spinner.appendChild(srText);
    
    return spinner;
  }

  /**
   * 텍스트 포함 스피너 생성
   * @param {string} text - 표시할 텍스트
   * @param {Object} options - 스피너 옵션
   * @param {string} options.size - 스피너 크기 (small, medium, large)
   * @param {string} options.color - 스피너 색상 (primary, success, warning, error)
   * @param {string} options.position - 텍스트 위치 (inline, center)
   * @return {HTMLElement} 생성된 스피너 컨테이너 요소
   */
  function createSpinnerWithText(text, options = {}) {
    const { size = 'medium', color = 'primary', position = 'inline' } = options;

    const container = document.createElement('div');
    container.className = `krds-spinner-container ${position}`;

    const spinner = createSpinner({ size, color });
    container.appendChild(spinner);

    const textEl = document.createElement('span');
    textEl.className = 'spinner-text';
    textEl.textContent = text;
    container.appendChild(textEl);

    return container;
  }

  /**
   * 바운스 스피너 생성
   * @param {string} color - 스피너 색상 (primary, success, warning, error)
   * @return {HTMLElement} 생성된 바운스 스피너 요소
   */
  function createBounceSpinner(color = 'primary') {
    const spinner = document.createElement('div');
    spinner.className = `krds-spinner-bounce ${color !== 'primary' ? color : ''}`;
    
    for (let i = 1; i <= 3; i++) {
      const bounce = document.createElement('div');
      bounce.className = `bounce${i}`;
      spinner.appendChild(bounce);
    }
    
    // 접근성을 위한 스크린 리더 텍스트
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = '로딩 중';
    spinner.appendChild(srText);
    
    return spinner;
  }

  /**
   * 펄스 스피너 생성
   * @param {string} color - 스피너 색상 (primary, success, warning, error)
   * @return {HTMLElement} 생성된 펄스 스피너 요소
   */
  function createPulseSpinner(color = 'primary') {
    const spinner = document.createElement('div');
    spinner.className = `krds-spinner-pulse ${color !== 'primary' ? color : ''}`;
    
    const pulse = document.createElement('div');
    pulse.className = 'pulse';
    spinner.appendChild(pulse);
    
    // 접근성을 위한 스크린 리더 텍스트
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = '로딩 중';
    spinner.appendChild(srText);
    
    return spinner;
  }

  /**
   * 도트 스피너 생성
   * @param {string} color - 스피너 색상 (primary, success, warning, error)
   * @return {HTMLElement} 생성된 도트 스피너 요소
   */
  function createDotsSpinner(color = 'primary') {
    const spinner = document.createElement('div');
    spinner.className = `krds-spinner-dots ${color !== 'primary' ? color : ''}`;
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      spinner.appendChild(dot);
    }
    
    // 접근성을 위한 스크린 리더 텍스트
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = '로딩 중';
    spinner.appendChild(srText);
    
    return spinner;
  }

  // 문서 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpinners);
  } else {
    initSpinners();
  }

  // 전역 객체에 API 노출
  window.KRDSSpinner = {
    create: createSpinner,
    createWithText: createSpinnerWithText,
    createBounce: createBounceSpinner,
    createPulse: createPulseSpinner,
    createDots: createDotsSpinner,
    showOverlay: showSpinnerOverlay,
    hideOverlay: hideSpinnerOverlay
  };
})(); 