(function() {
  'use strict';

  // 모든 텍스트 영역 초기화
  function initTextareas() {
    // 자동 높이 조절 기능 초기화
    initAutoResizeTextareas();
    
    // 글자 수 제한 및 카운터 기능 초기화
    initCharacterCounters();
    
    // API 예제 버튼 초기화
    initApiButtons();
    
    // DOM 변경 감지를 위한 옵저버 설정
    observeNewTextareas();
  }

  // 자동 높이 조절 텍스트 영역 초기화
  function initAutoResizeTextareas() {
    const autoResizeTextareas = document.querySelectorAll('.krds-textarea.auto-resize');
    
    autoResizeTextareas.forEach(textarea => {
      // 초기 높이 설정
      adjustTextareaHeight(textarea);
      
      // 입력 시 높이 조절 이벤트 리스너 추가
      textarea.addEventListener('input', function() {
        adjustTextareaHeight(this);
      });
      
      // 창 크기 변경 시 높이 재조절
      window.addEventListener('resize', function() {
        adjustTextareaHeight(textarea);
      });
    });
  }

  // 텍스트 영역 높이 조절 함수
  function adjustTextareaHeight(textarea) {
    // 먼저 높이를 auto로 설정하여 스크롤 높이를 정확히 측정
    textarea.style.height = 'auto';
    // 스크롤 높이에 조금의 여백을 추가하여 설정
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
  }

  // 글자 수 제한 및 카운터 초기화
  function initCharacterCounters() {
    const textareasWithCounter = document.querySelectorAll('.krds-textarea.with-counter');
    
    textareasWithCounter.forEach(textarea => {
      const maxLength = textarea.getAttribute('maxlength');
      const wrapper = textarea.closest('.krds-textarea-wrapper');
      
      if (maxLength && wrapper) {
        // 카운터 엘리먼트가 없으면 생성
        let counter = wrapper.querySelector('.krds-textarea-counter');
        if (!counter) {
          counter = document.createElement('div');
          counter.className = 'krds-textarea-counter';
          wrapper.appendChild(counter);
        }
        
        // 초기 카운터 값 설정
        updateCharacterCount(textarea, counter, maxLength);
        
        // 입력 시 카운터 업데이트
        textarea.addEventListener('input', function() {
          updateCharacterCount(this, counter, maxLength);
        });
      }
    });
  }

  // 글자 수 카운터 업데이트 함수
  function updateCharacterCount(textarea, counter, maxLength) {
    const currentLength = textarea.value.length;
    const remaining = maxLength - currentLength;
    
    counter.textContent = `${currentLength}/${maxLength}`;
    
    // 글자 수 제한에 근접하면 클래스 추가
    counter.classList.remove('near-limit', 'at-limit');
    
    if (remaining <= 0) {
      counter.classList.add('at-limit');
    } else if (remaining <= Math.floor(maxLength * 0.1)) {
      counter.classList.add('near-limit');
    }
  }

  // API 예제 버튼 초기화
  function initApiButtons() {
    // 유효성 검사 버튼
    const validateButtons = document.querySelectorAll('.btn-validate');
    validateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const textarea = document.getElementById(targetId);
        
        if (textarea) {
          // 입력된 텍스트가 없는 경우 유효하지 않음으로 표시
          if (textarea.value.trim() === '') {
            validateTextarea(textarea, false, '텍스트를 입력해 주세요.');
          } else {
            validateTextarea(textarea, true, '유효한 입력입니다.');
          }
        }
      });
    });
    
    // 텍스트 지우기 버튼
    const clearButtons = document.querySelectorAll('.btn-clear');
    clearButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const textarea = document.getElementById(targetId);
        
        if (textarea) {
          clearTextarea(textarea);
        }
      });
    });
    
    // 비활성화/활성화 버튼
    const toggleDisableButtons = document.querySelectorAll('.btn-toggle-disable');
    toggleDisableButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const textarea = document.getElementById(targetId);
        
        if (textarea) {
          toggleTextareaDisabled(textarea);
          // 버튼 텍스트 업데이트
          this.textContent = textarea.disabled ? '활성화하기' : '비활성화하기';
        }
      });
    });
    
    // 텍스트 삽입 버튼
    const insertTextButtons = document.querySelectorAll('.btn-insert-text');
    insertTextButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const textarea = document.getElementById(targetId);
        const text = this.getAttribute('data-text') || '샘플 텍스트가 삽입되었습니다.';
        
        if (textarea) {
          insertTextAtCursor(textarea, text);
        }
      });
    });
  }

  // 유효성 검사 함수
  function validateTextarea(textarea, isValid, message) {
    // 이전 상태 클래스 제거
    textarea.classList.remove('is-valid', 'is-invalid');
    
    // 피드백 요소 찾기
    const formGroup = textarea.closest('.krds-form-group');
    let feedback = formGroup ? formGroup.querySelector('.krds-textarea-feedback') : null;
    
    // 피드백 요소가 없으면 생성
    if (!feedback && formGroup) {
      feedback = document.createElement('div');
      feedback.className = 'krds-textarea-feedback';
      formGroup.appendChild(feedback);
    }
    
    if (feedback) {
      // 유효성 상태에 따라 클래스 및 메시지 설정
      if (isValid) {
        textarea.classList.add('is-valid');
        feedback.className = 'krds-textarea-feedback valid';
        feedback.textContent = message;
      } else {
        textarea.classList.add('is-invalid');
        feedback.className = 'krds-textarea-feedback invalid';
        feedback.textContent = message;
      }
    }
  }

  // 텍스트 지우기 함수
  function clearTextarea(textarea) {
    textarea.value = '';
    
    // 자동 높이 조절 텍스트 영역인 경우 높이 재조정
    if (textarea.classList.contains('auto-resize')) {
      adjustTextareaHeight(textarea);
    }
    
    // 글자 수 카운터가 있는 경우 업데이트
    if (textarea.classList.contains('with-counter')) {
      const wrapper = textarea.closest('.krds-textarea-wrapper');
      const counter = wrapper ? wrapper.querySelector('.krds-textarea-counter') : null;
      const maxLength = textarea.getAttribute('maxlength');
      
      if (counter && maxLength) {
        updateCharacterCount(textarea, counter, maxLength);
      }
    }
    
    // 포커스를 텍스트 영역으로 이동
    textarea.focus();
  }

  // 텍스트 영역 비활성화/활성화 토글 함수
  function toggleTextareaDisabled(textarea) {
    textarea.disabled = !textarea.disabled;
  }

  // 커서 위치에 텍스트 삽입 함수
  function insertTextAtCursor(textarea, text) {
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const beforeText = textarea.value.substring(0, startPos);
    const afterText = textarea.value.substring(endPos);
    
    // 텍스트 삽입
    textarea.value = beforeText + text + afterText;
    
    // 커서 위치 업데이트
    const newPos = startPos + text.length;
    textarea.setSelectionRange(newPos, newPos);
    
    // 텍스트 영역에 포커스
    textarea.focus();
    
    // 자동 높이 조절 텍스트 영역인 경우 높이 재조정
    if (textarea.classList.contains('auto-resize')) {
      adjustTextareaHeight(textarea);
    }
    
    // 글자 수 카운터가 있는 경우 업데이트
    if (textarea.classList.contains('with-counter')) {
      const wrapper = textarea.closest('.krds-textarea-wrapper');
      const counter = wrapper ? wrapper.querySelector('.krds-textarea-counter') : null;
      const maxLength = textarea.getAttribute('maxlength');
      
      if (counter && maxLength) {
        updateCharacterCount(textarea, counter, maxLength);
      }
    }
  }

  // DOM 변경 감지를 위한 옵저버 설정
  function observeNewTextareas() {
    // MutationObserver가 지원되는지 확인
    if (!window.MutationObserver) {
      return;
    }
    
    // DOM 변경 감지를 위한 옵저버 생성
    const observer = new MutationObserver(function(mutations) {
      let shouldInit = false;
      
      // 추가된 노드 확인
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // 추가된 각 노드 확인
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            
            // 노드가 엘리먼트인지 확인
            if (node.nodeType === 1) {
              // 노드가 텍스트 영역이거나 텍스트 영역을 포함하는지 확인
              if (node.classList && node.classList.contains('krds-textarea') || 
                  node.querySelector && node.querySelector('.krds-textarea')) {
                shouldInit = true;
                break;
              }
            }
          }
        }
      });
      
      // 새로운 텍스트 영역이 추가된 경우 초기화
      if (shouldInit) {
        initTextareas();
      }
    });
    
    // 옵저버 설정 및 시작
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 새 텍스트 영역 생성 함수
  function createTextarea(options = {}) {
    const defaults = {
      id: 'textarea-' + Date.now(),
      className: '',
      placeholder: '텍스트를 입력하세요.',
      label: '',
      description: '',
      rows: 3,
      maxLength: null,
      autoResize: false,
      resize: 'vertical', // 'both', 'vertical', 'horizontal', 'none'
      required: false,
      disabled: false,
      readonly: false,
      value: '',
      ariaDescribedBy: '',
      withCounter: false
    };
    
    // 기본 옵션과 사용자 옵션 병합
    const settings = { ...defaults, ...options };
    
    // 텍스트 영역 요소 생성
    const textarea = document.createElement('textarea');
    textarea.id = settings.id;
    textarea.className = 'krds-textarea';
    textarea.placeholder = settings.placeholder;
    textarea.rows = settings.rows;
    textarea.value = settings.value;
    
    // 추가 클래스 설정
    if (settings.className) {
      settings.className.split(' ').forEach(cls => {
        if (cls) textarea.classList.add(cls);
      });
    }
    
    // 자동 높이 조절 설정
    if (settings.autoResize) {
      textarea.classList.add('auto-resize');
    }
    
    // 리사이즈 옵션 설정
    switch (settings.resize) {
      case 'both':
        textarea.classList.add('resize-both');
        break;
      case 'vertical':
        textarea.classList.add('resize-vertical');
        break;
      case 'horizontal':
        textarea.classList.add('resize-horizontal');
        break;
      case 'none':
        textarea.classList.add('resize-none');
        break;
    }
    
    // 최대 길이 설정
    if (settings.maxLength) {
      textarea.setAttribute('maxlength', settings.maxLength);
      
      if (settings.withCounter) {
        textarea.classList.add('with-counter');
      }
    }
    
    // 필수 입력 설정
    if (settings.required) {
      textarea.setAttribute('required', '');
    }
    
    // 비활성화 설정
    if (settings.disabled) {
      textarea.setAttribute('disabled', '');
    }
    
    // 읽기 전용 설정
    if (settings.readonly) {
      textarea.setAttribute('readonly', '');
    }
    
    // ARIA 설명 설정
    if (settings.ariaDescribedBy) {
      textarea.setAttribute('aria-describedby', settings.ariaDescribedBy);
    }
    
    // 폼 그룹 요소 생성
    const formGroup = document.createElement('div');
    formGroup.className = 'krds-form-group';
    
    // 라벨 설정
    if (settings.label) {
      const label = document.createElement('label');
      label.htmlFor = settings.id;
      label.className = 'krds-label';
      if (settings.required) {
        label.classList.add('required');
      }
      label.textContent = settings.label;
      formGroup.appendChild(label);
    }
    
    // 글자 수 카운터가 있는 경우 래퍼 생성
    if (settings.withCounter && settings.maxLength) {
      const wrapper = document.createElement('div');
      wrapper.className = 'krds-textarea-wrapper';
      wrapper.appendChild(textarea);
      
      const counter = document.createElement('div');
      counter.className = 'krds-textarea-counter';
      counter.textContent = `0/${settings.maxLength}`;
      wrapper.appendChild(counter);
      
      formGroup.appendChild(wrapper);
    } else {
      formGroup.appendChild(textarea);
    }
    
    // 설명 텍스트 설정
    if (settings.description) {
      const description = document.createElement('div');
      description.className = 'krds-textarea-description';
      description.id = settings.ariaDescribedBy || `${settings.id}-description`;
      description.textContent = settings.description;
      formGroup.appendChild(description);
      
      // ARIA 설명이 설정되지 않은 경우 자동으로 설정
      if (!settings.ariaDescribedBy) {
        textarea.setAttribute('aria-describedby', description.id);
      }
    }
    
    return formGroup;
  }

  // 페이지 로드 시 텍스트 영역 초기화
  document.addEventListener('DOMContentLoaded', initTextareas);

  // 외부 사용을 위한 함수 내보내기
  window.KRDS = window.KRDS || {};
  window.KRDS.Textarea = {
    init: initTextareas,
    adjustHeight: adjustTextareaHeight,
    validate: validateTextarea,
    clear: clearTextarea,
    toggleDisabled: toggleTextareaDisabled,
    insertText: insertTextAtCursor,
    create: createTextarea
  };
})(); 