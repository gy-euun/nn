/**
 * KRDS 툴팁 컴포넌트
 * 사용자에게 추가 정보를 제공하는 작은 팝업 요소
 */

(function() {
  'use strict';

  // 툴팁 인스턴스 저장용 맵
  const tooltipInstances = new Map();
  
  // 전역 설정값
  const defaults = {
    position: 'top',          // 툴팁 위치 (top, right, bottom, left)
    theme: 'dark',            // 툴팁 테마 (light, dark, success, warning, error)
    size: 'medium',           // 툴팁 크기 (small, medium, large)
    trigger: 'hover',         // 트리거 방식 (hover, click, focus)
    animation: 'fade',        // 애니메이션 효과 (fade, scale, slide)
    interactive: false,       // 인터랙티브 여부
    delayShow: 200,           // 표시 지연 시간 (ms)
    delayHide: 200,           // 숨김 지연 시간 (ms)
    zIndex: 1000,             // z-index 값
    appendTo: 'body',         // 툴팁이 추가될 부모 요소
    hideOnEsc: true,          // ESC 키로 숨김 여부
    hideOnClickOutside: true, // 외부 클릭 시 숨김 여부
    offset: 8                 // 타겟으로부터의 거리 (px)
  };

  /**
   * 초기화 함수
   */
  function initTooltips() {
    // 기존 툴팁 엘리먼트 초기화
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(createTooltipFromElement);
    
    // 예제용 템플릿 기반 HTML 툴팁 초기화
    const htmlTooltipBtn = document.getElementById('html-tooltip-btn');
    const htmlTooltipTemplate = document.getElementById('html-tooltip-template');
    
    if (htmlTooltipBtn && htmlTooltipTemplate) {
      const content = htmlTooltipTemplate.content.cloneNode(true);
      createTooltip({
        target: htmlTooltipBtn,
        content: content, 
        position: 'bottom',
        theme: 'light',
        size: 'large',
        interactive: true,
        animation: 'scale',
        delayHide: 300
      });
    }
    
    // API 예제 초기화
    setupApiExample();
    
    // DOM에 새로 추가되는 툴팁 요소 감시
    observeNewTooltips();
  }
  
  /**
   * 예제용 API 초기화
   */
  function setupApiExample() {
    const apiTarget = document.getElementById('api-target');
    const createBtn = document.getElementById('create-tooltip');
    const showBtn = document.getElementById('show-tooltip');
    const hideBtn = document.getElementById('hide-tooltip');
    const destroyBtn = document.getElementById('destroy-tooltip');
    
    if (apiTarget && createBtn && showBtn && hideBtn && destroyBtn) {
      // 툴팁 생성 버튼
      createBtn.addEventListener('click', () => {
        createTooltip({
          target: apiTarget,
          content: 'API로 생성된 툴팁입니다.',
          position: 'top',
          theme: 'success'
        });
      });
      
      // 툴팁 표시 버튼
      showBtn.addEventListener('click', () => {
        const tooltip = tooltipInstances.get(apiTarget);
        if (tooltip) {
          tooltip.show();
        }
      });
      
      // 툴팁 숨김 버튼
      hideBtn.addEventListener('click', () => {
        const tooltip = tooltipInstances.get(apiTarget);
        if (tooltip) {
          tooltip.hide();
        }
      });
      
      // 툴팁 제거 버튼
      destroyBtn.addEventListener('click', () => {
        const tooltip = tooltipInstances.get(apiTarget);
        if (tooltip) {
          tooltip.destroy();
        }
      });
    }
  }
  
  /**
   * DOM에 새로 추가되는 툴팁 요소 감시
   */
  function observeNewTooltips() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element 노드인 경우
              // 추가된 요소에 툴팁 데이터 속성이 있는지 확인
              if (node.hasAttribute && node.hasAttribute('data-tooltip')) {
                createTooltipFromElement(node);
              }
              
              // 추가된 요소의 하위에 툴팁 요소가 있는지 확인
              const childTooltips = node.querySelectorAll ? node.querySelectorAll('[data-tooltip]') : [];
              childTooltips.forEach(createTooltipFromElement);
            }
          });
        }
      });
    });
    
    // body의 모든 변경 감시
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * 툴팁 엘리먼트로부터 툴팁 생성
   * @param {HTMLElement} element - 툴팁을 가진 엘리먼트
   */
  function createTooltipFromElement(element) {
    // 이미 툴팁이 생성된 경우 중복 생성 방지
    if (tooltipInstances.has(element)) {
      return;
    }
    
    const content = element.getAttribute('data-tooltip');
    const position = element.getAttribute('data-tooltip-position') || defaults.position;
    const theme = element.getAttribute('data-tooltip-theme') || defaults.theme;
    const size = element.getAttribute('data-tooltip-size') || defaults.size;
    const trigger = element.getAttribute('data-tooltip-trigger') || defaults.trigger;
    const animation = element.getAttribute('data-tooltip-animation') || defaults.animation;
    const interactive = element.getAttribute('data-tooltip-interactive') === 'true';
    const delayShow = parseInt(element.getAttribute('data-tooltip-delay-show')) || defaults.delayShow;
    const delayHide = parseInt(element.getAttribute('data-tooltip-delay-hide')) || defaults.delayHide;
    
    createTooltip({
      target: element,
      content: content,
      position: position,
      theme: theme,
      size: size,
      trigger: trigger,
      animation: animation,
      interactive: interactive,
      delayShow: delayShow,
      delayHide: delayHide
    });
  }
  
  /**
   * 툴팁 생성
   * @param {Object} options - 툴팁 옵션
   * @param {HTMLElement} options.target - 툴팁이 표시될 대상 요소
   * @param {string|HTMLElement|DocumentFragment} options.content - 툴팁 내용
   * @param {string} options.position - 툴팁 위치 (top, right, bottom, left)
   * @param {string} options.theme - 툴팁 테마 (light, dark, success, warning, error)
   * @param {string} options.size - 툴팁 크기 (small, medium, large)
   * @param {string} options.trigger - 트리거 방식 (hover, click, focus)
   * @param {string} options.animation - 애니메이션 효과 (fade, scale, slide)
   * @param {boolean} options.interactive - 인터랙티브 여부
   * @param {number} options.delayShow - 표시 지연 시간 (ms)
   * @param {number} options.delayHide - 숨김 지연 시간 (ms)
   * @param {number} options.zIndex - z-index 값
   * @param {string|HTMLElement} options.appendTo - 툴팁이 추가될 부모 요소
   * @param {boolean} options.hideOnEsc - ESC 키로 숨김 여부
   * @param {boolean} options.hideOnClickOutside - 외부 클릭 시 숨김 여부
   * @param {number} options.offset - 타겟으로부터의 거리 (px)
   * @returns {Object} 툴팁 인스턴스
   */
  function createTooltip(options) {
    const { target } = options;
    
    // 기존 툴팁 제거
    const existingTooltip = tooltipInstances.get(target);
    if (existingTooltip) {
      existingTooltip.destroy();
    }
    
    // 옵션 병합
    const config = Object.assign({}, defaults, options);
    
    // 툴팁 컨테이너 생성
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'krds-tooltip-container';
    if (config.interactive) {
      tooltipContainer.classList.add('interactive');
    }
    
    // 툴팁 데이터 속성 설정
    tooltipContainer.setAttribute('data-position', config.position);
    tooltipContainer.setAttribute('data-theme', config.theme);
    tooltipContainer.setAttribute('data-size', config.size);
    tooltipContainer.setAttribute('data-animation', config.animation);
    tooltipContainer.setAttribute('role', 'tooltip');
    tooltipContainer.style.zIndex = config.zIndex;
    
    const uniqueId = 'tooltip-' + generateUniqueId();
    tooltipContainer.id = uniqueId;
    
    // 타겟 요소에 aria-describedby 속성 추가
    target.setAttribute('aria-describedby', uniqueId);
    
    // 툴팁 내용 생성
    const tooltip = document.createElement('div');
    tooltip.className = 'krds-tooltip';
    
    // 내용 설정
    if (typeof config.content === 'string') {
      tooltip.textContent = config.content;
    } else {
      tooltip.appendChild(config.content);
    }
    
    tooltipContainer.appendChild(tooltip);
    
    // 부모 요소에 추가
    const parent = typeof config.appendTo === 'string' ? 
      document.querySelector(config.appendTo) : config.appendTo;
    parent.appendChild(tooltipContainer);
    
    // 표시/숨김 타이머
    let showTimeout = null;
    let hideTimeout = null;
    
    // 이벤트 리스너
    const listeners = {
      show: [],
      hide: []
    };
    
    // 위치 업데이트 함수
    function updatePosition() {
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipContainer.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      
      let top, left;
      
      switch (config.position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - config.offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + config.offset;
          break;
        case 'bottom':
          top = targetRect.bottom + config.offset;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - config.offset;
          break;
      }
      
      // 부모 요소가 body가 아닌 경우 상대 위치 조정
      if (parent !== document.body) {
        top -= parentRect.top;
        left -= parentRect.left;
      }
      
      // 창 밖으로 나가지 않도록
      const rightEdge = window.innerWidth;
      const bottomEdge = window.innerHeight;
      
      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left + tooltipRect.width > rightEdge) {
        left = rightEdge - tooltipRect.width;
      }
      if (top + tooltipRect.height > bottomEdge) {
        top = bottomEdge - tooltipRect.height;
      }
      
      tooltipContainer.style.top = `${top}px`;
      tooltipContainer.style.left = `${left}px`;
    }
    
    // 툴팁 표시 함수
    function show() {
      clearTimeout(hideTimeout);
      
      showTimeout = setTimeout(() => {
        updatePosition();
        tooltipContainer.classList.add('active');
        
        // 이벤트 발행
        listeners.show.forEach(callback => callback());
        
        // 사용자 정의 이벤트 발행
        target.dispatchEvent(new CustomEvent('tooltip:show', {
          bubbles: true,
          detail: { tooltip: tooltipInstance }
        }));
      }, config.delayShow);
    }
    
    // 툴팁 숨김 함수
    function hide() {
      clearTimeout(showTimeout);
      
      hideTimeout = setTimeout(() => {
        tooltipContainer.classList.remove('active');
        
        // 이벤트 발행
        listeners.hide.forEach(callback => callback());
        
        // 사용자 정의 이벤트 발행
        target.dispatchEvent(new CustomEvent('tooltip:hide', {
          bubbles: true,
          detail: { tooltip: tooltipInstance }
        }));
      }, config.delayHide);
    }
    
    // 이벤트 리스너 등록
    function addTriggerListeners() {
      if (config.trigger === 'hover' || config.trigger === 'both') {
        target.addEventListener('mouseenter', show);
        target.addEventListener('mouseleave', hide);
        
        // 인터랙티브 툴팁인 경우
        if (config.interactive) {
          tooltipContainer.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
          });
          tooltipContainer.addEventListener('mouseleave', hide);
        }
      }
      
      if (config.trigger === 'click' || config.trigger === 'both') {
        target.addEventListener('click', (e) => {
          e.preventDefault();
          tooltipContainer.classList.contains('active') ? hide() : show();
        });
        
        // 외부 클릭 시 숨기기
        if (config.hideOnClickOutside) {
          document.addEventListener('click', (e) => {
            if (!tooltipContainer.contains(e.target) && !target.contains(e.target)) {
              hide();
            }
          });
        }
      }
      
      if (config.trigger === 'focus' || config.trigger === 'both') {
        target.addEventListener('focus', show);
        target.addEventListener('blur', hide);
      }
      
      // ESC 키 누를 때 숨기기
      if (config.hideOnEsc) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && tooltipContainer.classList.contains('active')) {
            hide();
          }
        });
      }
    }
    
    // 이벤트 리스너 제거
    function removeTriggerListeners() {
      target.removeEventListener('mouseenter', show);
      target.removeEventListener('mouseleave', hide);
      target.removeEventListener('focus', show);
      target.removeEventListener('blur', hide);
      
      if (config.interactive) {
        tooltipContainer.removeEventListener('mouseenter', () => {
          clearTimeout(hideTimeout);
        });
        tooltipContainer.removeEventListener('mouseleave', hide);
      }
    }
    
    // 툴팁 제거 함수
    function destroy() {
      // 이벤트 리스너 제거
      removeTriggerListeners();
      
      // DOM에서 제거
      tooltipContainer.parentNode.removeChild(tooltipContainer);
      
      // aria 속성 제거
      target.removeAttribute('aria-describedby');
      
      // 인스턴스 맵에서 제거
      tooltipInstances.delete(target);
    }
    
    // 이벤트 리스너 추가/제거
    function on(eventName, callback) {
      if (listeners[eventName]) {
        listeners[eventName].push(callback);
      }
      return tooltipInstance;
    }
    
    function off(eventName, callback) {
      if (listeners[eventName]) {
        listeners[eventName] = listeners[eventName].filter(fn => fn !== callback);
      }
      return tooltipInstance;
    }
    
    // 툴팁 인스턴스
    const tooltipInstance = {
      show,
      hide,
      destroy,
      on,
      off,
      updatePosition,
      getTarget: () => target,
      getContent: () => tooltip.innerHTML,
      setContent: (content) => {
        tooltip.innerHTML = '';
        if (typeof content === 'string') {
          tooltip.textContent = content;
        } else {
          tooltip.appendChild(content);
        }
        return tooltipInstance;
      },
      updateOptions: (newOptions) => {
        Object.assign(config, newOptions);
        
        // 위치 업데이트
        tooltipContainer.setAttribute('data-position', config.position);
        tooltipContainer.setAttribute('data-theme', config.theme);
        tooltipContainer.setAttribute('data-size', config.size);
        tooltipContainer.setAttribute('data-animation', config.animation);
        
        // 인터랙티브 여부
        if (config.interactive) {
          tooltipContainer.classList.add('interactive');
        } else {
          tooltipContainer.classList.remove('interactive');
        }
        
        // z-index 업데이트
        tooltipContainer.style.zIndex = config.zIndex;
        
        return tooltipInstance;
      }
    };
    
    // 이벤트 리스너 등록
    addTriggerListeners();
    
    // 인스턴스 맵에 저장
    tooltipInstances.set(target, tooltipInstance);
    
    return tooltipInstance;
  }
  
  /**
   * 고유 ID 생성
   * @returns {string} 고유 ID
   */
  function generateUniqueId() {
    return Math.random().toString(36).substring(2, 9);
  }
  
  // 문서 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltips);
  } else {
    initTooltips();
  }
  
  // 전역 API 노출
  window.KRDSTooltip = {
    create: createTooltip,
    get: (target) => tooltipInstances.get(target),
    getAll: () => Array.from(tooltipInstances.values()),
    destroyAll: () => {
      tooltipInstances.forEach((tooltip) => {
        tooltip.destroy();
      });
    }
  };
})(); 