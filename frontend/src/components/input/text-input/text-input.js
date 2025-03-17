/**
 * KRDS 텍스트 입력 필드 컴포넌트
 * 사용자로부터 텍스트 데이터를 수집하는 입력 요소
 */

(function() {
  'use strict';

  /**
   * 텍스트 입력 필드 초기화
   */
  function initTextInputs() {
    // 비밀번호 토글 기능 초기화
    initPasswordToggles();
    
    // 아이콘 클릭 이벤트 초기화
    initInputIconActions();
    
    // API 예제 초기화
    initApiExamples();
    
    // DOM에 새로 추가되는 입력 필드 감시
    observeNewTextInputs();
  }
  
  /**
   * 비밀번호 토글 기능 초기화
   */
  function initPasswordToggles() {
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    togglePasswordBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const input = this.closest('.krds-input-wrapper').querySelector('input');
        const showPasswordIcon = this.querySelector('.show-password');
        const hidePasswordIcon = this.querySelector('.hide-password');
        
        if (input.type === 'password') {
          input.type = 'text';
          showPasswordIcon.style.display = 'none';
          hidePasswordIcon.style.display = 'block';
          this.setAttribute('title', '비밀번호 숨기기');
        } else {
          input.type = 'password';
          showPasswordIcon.style.display = 'block';
          hidePasswordIcon.style.display = 'none';
          this.setAttribute('title', '비밀번호 표시');
        }
      });
    });
  }
  
  /**
   * 아이콘 클릭 이벤트 초기화
   * (예: 입력 내용 지우기)
   */
  function initInputIconActions() {
    // 클릭 가능한 모든 아이콘
    const clickableIcons = document.querySelectorAll('.krds-input-icon.clickable:not(.toggle-password)');
    
    clickableIcons.forEach(icon => {
      // 입력 내용 지우기 아이콘 (X 아이콘)
      if (icon.closest('.krds-input-wrapper') && icon.querySelector('svg path, svg line')) {
        icon.addEventListener('click', function() {
          const input = this.closest('.krds-input-wrapper').querySelector('input');
          input.value = '';
          input.focus();
          
          // 입력 변경 이벤트 발생
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        });
      }
    });
  }
  
  /**
   * API 예제 초기화
   */
  function initApiExamples() {
    const validateBtn = document.getElementById('validate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const disableBtn = document.getElementById('disable-btn');
    const apiInput = document.getElementById('api-input');
    
    if (validateBtn && clearBtn && disableBtn && apiInput) {
      // 유효성 검사 버튼
      validateBtn.addEventListener('click', function() {
        validateInput(apiInput);
      });
      
      // 내용 지우기 버튼
      clearBtn.addEventListener('click', function() {
        clearInput(apiInput);
      });
      
      // 비활성화/활성화 버튼
      disableBtn.addEventListener('click', function() {
        toggleDisabled(apiInput);
        this.textContent = apiInput.disabled ? '활성화' : '비활성화';
      });
    }
  }
  
  /**
   * DOM에 새로 추가되는 입력 필드 감시
   */
  function observeNewTextInputs() {
    // MutationObserver를 사용하여 DOM 변경 감시
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            // 요소 노드인 경우만 처리
            if (node.nodeType === 1) {
              // 새로 추가된 비밀번호 토글 버튼 초기화
              const togglePasswordBtns = node.querySelectorAll ? 
                node.querySelectorAll('.toggle-password') : [];
              
              if (togglePasswordBtns.length > 0) {
                initPasswordToggles();
              }
              
              // 새로 추가된 클릭 가능한 아이콘 초기화
              const clickableIcons = node.querySelectorAll ? 
                node.querySelectorAll('.krds-input-icon.clickable:not(.toggle-password)') : [];
              
              if (clickableIcons.length > 0) {
                initInputIconActions();
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
   * 입력 필드 유효성 검사
   * @param {HTMLInputElement} input - 검사할 입력 필드
   * @param {Function|RegExp} validator - 유효성 검사 함수 또는 정규 표현식
   * @param {string} invalidMessage - 유효하지 않을 때 표시할 메시지
   * @param {string} validMessage - 유효할 때 표시할 메시지
   * @return {boolean} 유효성 검사 결과
   */
  function validateInput(input, validator, invalidMessage, validMessage) {
    // 예제용 기본값
    validator = validator || function(value) {
      return value.trim().length >= 3;
    };
    
    invalidMessage = invalidMessage || '3자 이상 입력해주세요.';
    validMessage = validMessage || '올바른 형식입니다.';
    
    const parentGroup = input.closest('.krds-form-group');
    
    // 피드백 요소 찾기 또는 생성
    let feedbackEl = parentGroup.querySelector('.krds-input-feedback');
    if (!feedbackEl) {
      feedbackEl = document.createElement('div');
      feedbackEl.className = 'krds-input-feedback';
      parentGroup.appendChild(feedbackEl);
    }
    
    // 유효성 검사 실행
    let isValid = false;
    
    if (typeof validator === 'function') {
      isValid = validator(input.value);
    } else if (validator instanceof RegExp) {
      isValid = validator.test(input.value);
    }
    
    // 클래스 및 피드백 메시지 업데이트
    input.classList.remove('is-valid', 'is-invalid');
    feedbackEl.classList.remove('valid', 'invalid');
    
    if (isValid) {
      input.classList.add('is-valid');
      feedbackEl.classList.add('valid');
      feedbackEl.textContent = validMessage;
    } else {
      input.classList.add('is-invalid');
      feedbackEl.classList.add('invalid');
      feedbackEl.textContent = invalidMessage;
    }
    
    return isValid;
  }
  
  /**
   * 입력 필드 내용 지우기
   * @param {HTMLInputElement} input - 내용을 지울 입력 필드
   */
  function clearInput(input) {
    input.value = '';
    
    // 추가 클래스 제거
    input.classList.remove('is-valid', 'is-invalid');
    
    // 피드백 메시지 제거
    const parentGroup = input.closest('.krds-form-group');
    const feedbackEl = parentGroup.querySelector('.krds-input-feedback');
    
    if (feedbackEl) {
      feedbackEl.textContent = '';
      feedbackEl.classList.remove('valid', 'invalid');
    }
    
    // 포커스
    input.focus();
  }
  
  /**
   * 입력 필드 비활성화/활성화 토글
   * @param {HTMLInputElement} input - 토글할 입력 필드
   * @return {boolean} 비활성화 상태
   */
  function toggleDisabled(input) {
    input.disabled = !input.disabled;
    return input.disabled;
  }
  
  /**
   * 입력 필드 생성
   * @param {Object} options - 입력 필드 옵션
   * @param {string} options.type - 입력 필드 타입 (text, password, email, number 등)
   * @param {string} options.placeholder - 플레이스홀더 텍스트
   * @param {string} options.value - 초기값
   * @param {string} options.label - 라벨 텍스트
   * @param {string} options.description - 설명 텍스트
   * @param {boolean} options.required - 필수 입력 여부
   * @param {boolean} options.disabled - 비활성화 여부
   * @param {string} options.size - 크기 (small, medium, large)
   * @param {string} options.icon - 아이콘 HTML (왼쪽 아이콘)
   * @param {string} options.iconRight - 오른쪽 아이콘 HTML
   * @param {boolean} options.iconClickable - 클릭 가능한 아이콘 여부
   * @param {string} options.id - 입력 필드 ID
   * @param {string} options.name - 입력 필드 이름
   * @return {HTMLElement} 생성된 폼 그룹 요소
   */
  function createTextInput(options = {}) {
    const {
      type = 'text',
      placeholder = '',
      value = '',
      label = '',
      description = '',
      required = false,
      disabled = false,
      size = 'medium',
      icon = '',
      iconRight = '',
      iconClickable = false,
      id = 'input-' + Date.now(),
      name = ''
    } = options;
    
    // 폼 그룹 요소 생성
    const formGroup = document.createElement('div');
    formGroup.className = 'krds-form-group';
    
    // 라벨 생성 (있는 경우)
    if (label) {
      const labelEl = document.createElement('label');
      labelEl.htmlFor = id;
      labelEl.className = 'krds-label';
      if (required) labelEl.classList.add('required');
      labelEl.textContent = label;
      formGroup.appendChild(labelEl);
    }
    
    // 기본 입력 필드 및 래퍼 설정
    let inputEl, inputWrapper;
    
    // 아이콘이 있는 경우 래퍼 생성
    if (icon || iconRight) {
      inputWrapper = document.createElement('div');
      inputWrapper.className = 'krds-input-wrapper';
      
      if (icon && iconRight) {
        inputWrapper.classList.add('both-icon');
      } else if (icon) {
        inputWrapper.classList.add('left-icon');
      } else if (iconRight) {
        inputWrapper.classList.add('right-icon');
      }
      
      // 왼쪽 아이콘 (있는 경우)
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'krds-input-icon';
        if (iconClickable) iconEl.classList.add('clickable');
        iconEl.innerHTML = icon;
        inputWrapper.appendChild(iconEl);
      }
      
      // 입력 필드 생성
      inputEl = document.createElement('input');
      inputEl.type = type;
      inputEl.className = 'krds-input';
      inputEl.id = id;
      if (name) inputEl.name = name;
      if (placeholder) inputEl.placeholder = placeholder;
      if (value) inputEl.value = value;
      if (required) inputEl.required = true;
      if (disabled) inputEl.disabled = true;
      
      // 크기 변형 설정
      if (size === 'small') {
        inputEl.classList.add('krds-input-sm');
      } else if (size === 'large') {
        inputEl.classList.add('krds-input-lg');
      }
      
      inputWrapper.appendChild(inputEl);
      
      // 오른쪽 아이콘 (있는 경우)
      if (iconRight) {
        const iconRightEl = document.createElement('span');
        iconRightEl.className = 'krds-input-icon';
        if (iconClickable) iconRightEl.classList.add('clickable');
        iconRightEl.innerHTML = iconRight;
        inputWrapper.appendChild(iconRightEl);
      }
      
      formGroup.appendChild(inputWrapper);
    } else {
      // 아이콘이 없는 경우 입력 필드만 생성
      inputEl = document.createElement('input');
      inputEl.type = type;
      inputEl.className = 'krds-input';
      inputEl.id = id;
      if (name) inputEl.name = name;
      if (placeholder) inputEl.placeholder = placeholder;
      if (value) inputEl.value = value;
      if (required) inputEl.required = true;
      if (disabled) inputEl.disabled = true;
      
      // 크기 변형 설정
      if (size === 'small') {
        inputEl.classList.add('krds-input-sm');
      } else if (size === 'large') {
        inputEl.classList.add('krds-input-lg');
      }
      
      formGroup.appendChild(inputEl);
    }
    
    // 설명 텍스트 생성 (있는 경우)
    if (description) {
      const descriptionEl = document.createElement('div');
      descriptionEl.className = 'krds-input-description';
      descriptionEl.textContent = description;
      
      // 접근성을 위한 ID 및 aria 속성
      const descriptionId = id + '-description';
      descriptionEl.id = descriptionId;
      inputEl.setAttribute('aria-describedby', descriptionId);
      
      formGroup.appendChild(descriptionEl);
    }
    
    return formGroup;
  }
  
  // 문서 로드 완료 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTextInputs);
  } else {
    initTextInputs();
  }
  
  // 전역 API 노출
  window.KRDSTextInput = {
    create: createTextInput,
    validate: validateInput,
    clear: clearInput,
    toggleDisabled: toggleDisabled
  };
})(); 