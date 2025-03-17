(function() {
  'use strict';

  // 파일 크기 포맷 헬퍼 함수
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 파일 타입 확인 헬퍼 함수
  function getFileType(file) {
    if (file.type.startsWith('image/')) {
      return 'image';
    } else if (file.type.startsWith('video/')) {
      return 'video';
    } else if (file.type.startsWith('audio/')) {
      return 'audio';
    } else if (file.type === 'application/pdf') {
      return 'pdf';
    } else if (
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return 'doc';
    } else if (
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return 'excel';
    } else if (
      file.type === 'application/vnd.ms-powerpoint' ||
      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return 'ppt';
    } else if (
      file.type === 'application/zip' ||
      file.type === 'application/x-rar-compressed' ||
      file.type === 'application/x-7z-compressed'
    ) {
      return 'archive';
    } else {
      return 'file';
    }
  }
  
  // 파일 타입별 아이콘 생성 헬퍼 함수
  function getFileTypeIcon(fileType) {
    switch (fileType) {
      case 'image':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        `;
      case 'video':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
        `;
      case 'audio':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        `;
      case 'pdf':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15H7v-2h2v2z"></path>
            <path d="M13 15h-2v-2h2v2z"></path>
            <path d="M17 15h-2v-2h2v2z"></path>
          </svg>
        `;
      case 'doc':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        `;
      case 'excel':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="8" y1="13" x2="16" y2="13"></line>
            <line x1="8" y1="17" x2="16" y2="17"></line>
            <polyline points="8 9 10 9 10 9"></polyline>
          </svg>
        `;
      case 'ppt':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 13h6"></path>
            <path d="M9 17h3"></path>
            <path d="M9 9h1"></path>
          </svg>
        `;
      case 'archive':
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="10" y1="12" x2="14" y2="12"></line>
          </svg>
        `;
      default:
        return `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        `;
    }
  }
  
  // 파일 삭제 아이콘 생성 헬퍼 함수
  function getRemoveIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
  }
  
  // 기본 파일 업로드 초기화
  function initFileUploads() {
    const fileInputs = document.querySelectorAll('.krds-file-input');
    
    fileInputs.forEach(input => {
      // 이미 초기화된 경우 건너뛰기
      if (input.dataset.initialized === 'true') return;
      
      // 파일 선택 시 이벤트
      input.addEventListener('change', function() {
        handleFileSelection(this);
      });
      
      // 초기화 완료 표시
      input.dataset.initialized = 'true';
    });
    
    // 다중 파일 업로드 초기화
    initMultiFileUpload();
    
    // 이미지 미리보기 초기화
    initImagePreview();
    
    // 드래그 앤 드롭 초기화
    initDragDropUpload();
    
    // API 예제 버튼 초기화
    initApiButtons();
    
    // DOM 변경 감지를 위한 옵저버 설정
    observeNewFileUploads();
  }
  
  // 파일 선택 처리
  function handleFileSelection(input) {
    const fileNameElement = input.closest('.krds-file-upload').querySelector('.krds-file-name');
    
    if (!fileNameElement) return;
    
    if (input.files && input.files.length > 0) {
      if (input.multiple) {
        // 다중 파일 선택
        const fileCount = input.files.length;
        fileNameElement.textContent = `${fileCount}개의 파일이 선택됨`;
        
        // 다중 파일 리스트 업데이트
        updateMultiFileList(input);
      } else {
        // 단일 파일 선택
        const fileName = input.files[0].name;
        fileNameElement.textContent = fileName;
        
        // 이미지 미리보기 업데이트
        if (input.accept.includes('image')) {
          updateImagePreview(input);
        }
      }
      
      // 유효성 검사 상태 업데이트
      updateValidationState(input);
      
      // 변경 이벤트 트리거
      triggerChangeEvent(input);
    } else {
      // 파일 선택 취소
      fileNameElement.textContent = '선택된 파일 없음';
      
      // 다중 파일 리스트 지우기
      if (input.multiple) {
        const multiFileList = document.getElementById('multi-file-list');
        if (multiFileList) {
          multiFileList.innerHTML = '';
        }
      }
      
      // 이미지 미리보기 지우기
      if (input.accept.includes('image')) {
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
          imagePreview.innerHTML = '';
        }
      }
    }
  }
  
  // 다중 파일 업로드 초기화
  function initMultiFileUpload() {
    const multiFileUpload = document.getElementById('multi-file-upload');
    
    if (!multiFileUpload) return;
    
    multiFileUpload.addEventListener('change', function() {
      updateMultiFileList(this);
    });
  }
  
  // 다중 파일 리스트 업데이트
  function updateMultiFileList(input) {
    const multiFileList = document.getElementById('multi-file-list');
    
    if (!multiFileList || !input.files || input.files.length === 0) return;
    
    // 기존 파일 목록 지우기
    multiFileList.innerHTML = '';
    
    // 파일 목록 생성
    Array.from(input.files).forEach(file => {
      const fileType = getFileType(file);
      const fileItem = document.createElement('div');
      fileItem.className = 'krds-file-item';
      
      fileItem.innerHTML = `
        <div class="krds-file-item-icon">
          ${getFileTypeIcon(fileType)}
        </div>
        <div class="krds-file-item-info">
          <p class="krds-file-item-name">${file.name}</p>
          <p class="krds-file-item-size">${formatFileSize(file.size)}</p>
        </div>
      `;
      
      multiFileList.appendChild(fileItem);
    });
  }
  
  // 이미지 미리보기 초기화
  function initImagePreview() {
    const imageUpload = document.getElementById('image-upload');
    
    if (!imageUpload) return;
    
    imageUpload.addEventListener('change', function() {
      updateImagePreview(this);
    });
  }
  
  // 이미지 미리보기 업데이트
  function updateImagePreview(input) {
    const imagePreview = document.getElementById('image-preview');
    
    if (!imagePreview || !input.files || input.files.length === 0) return;
    
    // 기존 미리보기 지우기
    imagePreview.innerHTML = '';
    
    // 파일이 이미지인지 확인
    if (input.files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const previewItem = document.createElement('div');
        previewItem.className = 'krds-image-preview-item';
        
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="${input.files[0].name}">
          <button type="button" class="krds-image-preview-remove">${getRemoveIcon()}</button>
        `;
        
        // 삭제 버튼 이벤트
        const removeButton = previewItem.querySelector('.krds-image-preview-remove');
        removeButton.addEventListener('click', function() {
          clearFileInput(input);
          imagePreview.innerHTML = '';
        });
        
        imagePreview.appendChild(previewItem);
      };
      
      reader.readAsDataURL(input.files[0]);
    }
  }
  
  // 드래그 앤 드롭 초기화
  function initDragDropUpload() {
    const dragDropArea = document.getElementById('drag-drop-upload');
    const dragDropInput = document.getElementById('drag-drop-input');
    
    if (!dragDropArea || !dragDropInput) return;
    
    // 드래그 이벤트
    const dragEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
    
    dragEvents.forEach(eventName => {
      dragDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 드래그 효과
    ['dragenter', 'dragover'].forEach(eventName => {
      dragDropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dragDropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      dragDropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
      dragDropArea.classList.remove('drag-over');
    }
    
    // 파일 드롭
    dragDropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
      const files = e.dataTransfer.files;
      handleDragDropFiles(files);
    }
    
    // 파일 선택 버튼
    dragDropInput.addEventListener('change', function() {
      handleDragDropFiles(this.files);
    });
    
    // 드래그 앤 드롭 파일 처리
    function handleDragDropFiles(files) {
      if (!files || files.length === 0) return;
      
      const fileList = dragDropArea.querySelector('.krds-file-list');
      
      // 파일 리스트 지우기
      fileList.innerHTML = '';
      
      // 파일 목록 생성
      Array.from(files).forEach(file => {
        const fileType = getFileType(file);
        const fileItem = document.createElement('div');
        fileItem.className = 'krds-file-item';
        
        // 파일 크기 검증 (예시: 10MB 제한)
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        
        if (!isValidSize) {
          fileItem.classList.add('is-invalid');
        } else {
          fileItem.classList.add('is-valid');
        }
        
        fileItem.innerHTML = `
          <div class="krds-file-item-icon">
            ${getFileTypeIcon(fileType)}
          </div>
          <div class="krds-file-item-info">
            <p class="krds-file-item-name">${file.name}</p>
            <p class="krds-file-item-size">${formatFileSize(file.size)}</p>
            ${!isValidSize ? `<p class="krds-file-item-error">파일 크기가 10MB를 초과합니다.</p>` : ''}
          </div>
          <button type="button" class="krds-file-item-remove">${getRemoveIcon()}</button>
        `;
        
        // 삭제 버튼 이벤트
        const removeButton = fileItem.querySelector('.krds-file-item-remove');
        removeButton.addEventListener('click', function() {
          fileItem.remove();
          
          // 모든 파일이 삭제되었는지 확인
          if (fileList.children.length === 0) {
            // 파일 입력 초기화
            clearFileInput(dragDropInput);
          }
        });
        
        fileList.appendChild(fileItem);
      });
      
      // dragDropInput에 파일 설정
      if (dragDropInput.files.length === 0) {
        // 브라우저 보안 제한으로 인해 FileList는 직접 할당할 수 없으므로 
        // 필요한 경우 FormData나 File API를 사용하여 처리
      }
    }
  }
  
  // API 예제 버튼 초기화
  function initApiButtons() {
    // 파일 지우기 버튼
    const clearFileButtons = document.querySelectorAll('.btn-clear-file');
    clearFileButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          clearFileInput(input);
        }
      });
    });
    
    // 비활성화 토글 버튼
    const toggleDisableButtons = document.querySelectorAll('.btn-toggle-disable');
    toggleDisableButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          toggleFileInputDisabled(input);
          this.textContent = input.disabled ? '활성화하기' : '비활성화하기';
        }
      });
    });
    
    // 유효성 검사 버튼
    const validateButtons = document.querySelectorAll('.btn-validate');
    validateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          validateFileInput(input);
        }
      });
    });
  }
  
  // 파일 유효성 검사
  function validateFileInput(input) {
    if (!input.files || input.files.length === 0) {
      updateValidationState(input, false, '파일을 선택해 주세요.');
      return false;
    }
    
    const file = input.files[0];
    
    // 파일 크기 검증 (예시: 10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      updateValidationState(input, false, '파일 크기가 10MB를 초과합니다.');
      return false;
    }
    
    // 이미지 파일 유형 검증
    if (input.accept.includes('image/') && !file.type.startsWith('image/')) {
      updateValidationState(input, false, '이미지 파일만 업로드 가능합니다.');
      return false;
    }
    
    updateValidationState(input, true, '유효한 파일입니다.');
    return true;
  }
  
  // 유효성 검사 상태 업데이트
  function updateValidationState(input, isValid, message) {
    // 이전 상태 클래스 제거
    input.classList.remove('is-valid', 'is-invalid');
    
    // 명시적인 유효성 상태가 지정되지 않은 경우 기존 상태 유지
    if (typeof isValid === 'undefined') return;
    
    // 피드백 요소 찾기
    const formGroup = input.closest('.krds-form-group');
    let feedback = formGroup ? formGroup.querySelector('.krds-file-feedback') : null;
    
    // 피드백 요소가 없으면 생성
    if (!feedback && formGroup && message) {
      feedback = document.createElement('div');
      feedback.className = 'krds-file-feedback';
      formGroup.appendChild(feedback);
    }
    
    if (feedback && message) {
      // 유효성 상태에 따라 클래스 및 메시지 설정
      if (isValid) {
        input.classList.add('is-valid');
        feedback.className = 'krds-file-feedback valid';
        feedback.textContent = message;
      } else {
        input.classList.add('is-invalid');
        feedback.className = 'krds-file-feedback invalid';
        feedback.textContent = message;
      }
    }
  }
  
  // 파일 입력 초기화
  function clearFileInput(input) {
    // 파일 입력 초기화
    input.value = '';
    
    // 파일 이름 표시 초기화
    const fileNameElement = input.closest('.krds-file-upload')?.querySelector('.krds-file-name');
    if (fileNameElement) {
      fileNameElement.textContent = '선택된 파일 없음';
    }
    
    // 유효성 검사 상태 초기화
    input.classList.remove('is-valid', 'is-invalid');
    
    // 피드백 메시지 삭제
    const formGroup = input.closest('.krds-form-group');
    const feedback = formGroup?.querySelector('.krds-file-feedback');
    if (feedback) {
      formGroup.removeChild(feedback);
    }
    
    // 다중 파일 리스트 초기화
    if (input.multiple && input.id === 'multi-file-upload') {
      const multiFileList = document.getElementById('multi-file-list');
      if (multiFileList) {
        multiFileList.innerHTML = '';
      }
    }
    
    // 이미지 미리보기 초기화
    if (input.accept?.includes('image') && input.id === 'image-upload') {
      const imagePreview = document.getElementById('image-preview');
      if (imagePreview) {
        imagePreview.innerHTML = '';
      }
    }
    
    // 변경 이벤트 트리거
    triggerChangeEvent(input);
  }
  
  // 파일 입력 비활성화/활성화 토글
  function toggleFileInputDisabled(input) {
    input.disabled = !input.disabled;
    
    // 라벨 업데이트
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      label.style.opacity = input.disabled ? '0.6' : '1';
      label.style.cursor = input.disabled ? 'not-allowed' : 'pointer';
    }
  }
  
  // 변경 이벤트 트리거
  function triggerChangeEvent(input) {
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  }
  
  // DOM 변경 감지를 위한 옵저버 설정
  function observeNewFileUploads() {
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
              // 노드가 파일 입력 필드이거나 파일 입력 필드를 포함하는지 확인
              if (node.classList && node.classList.contains('krds-file-input') || 
                  node.querySelector && node.querySelector('.krds-file-input')) {
                shouldInit = true;
                break;
              }
            }
          }
        }
      });
      
      // 새로운 파일 입력 필드가 추가된 경우 초기화
      if (shouldInit) {
        initFileUploads();
      }
    });
    
    // 옵저버 설정 및 시작
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 새 파일 입력 필드 생성 함수
  function createFileUpload(options = {}) {
    const defaults = {
      id: 'file-upload-' + Date.now(),
      label: '',
      description: '',
      multiple: false,
      accept: '',
      disabled: false,
      size: 'default', // 'small', 'default', 'large'
      style: 'default', // 'default', 'outline', 'icon', 'text'
      required: false
    };
    
    // 기본 옵션과 사용자 옵션 병합
    const settings = { ...defaults, ...options };
    
    // 폼 그룹 생성
    const formGroup = document.createElement('div');
    formGroup.className = 'krds-form-group';
    
    // 라벨 생성
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
    
    // 파일 업로드 래퍼 생성
    const fileUpload = document.createElement('div');
    fileUpload.className = 'krds-file-upload';
    
    // 파일 입력 생성
    const input = document.createElement('input');
    input.type = 'file';
    input.id = settings.id;
    input.className = 'krds-file-input';
    
    if (settings.multiple) {
      input.multiple = true;
    }
    
    if (settings.accept) {
      input.accept = settings.accept;
    }
    
    if (settings.disabled) {
      input.disabled = true;
    }
    
    // 파일 레이블 생성
    const fileLabel = document.createElement('label');
    fileLabel.htmlFor = settings.id;
    fileLabel.className = 'krds-file-label';
    
    // 크기에 따른 클래스 추가
    if (settings.size === 'small') {
      fileLabel.classList.add('krds-file-label-sm');
    } else if (settings.size === 'large') {
      fileLabel.classList.add('krds-file-label-lg');
    }
    
    // 스타일에 따른 클래스 추가
    if (settings.style === 'outline') {
      fileLabel.classList.add('krds-file-label-outline');
    } else if (settings.style === 'icon') {
      fileLabel.classList.add('krds-file-label-icon');
    } else if (settings.style === 'text') {
      fileLabel.classList.add('krds-file-label-text');
    }
    
    // 아이콘 및 텍스트 추가
    if (settings.style !== 'text') {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'krds-file-icon';
      iconSpan.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${settings.size === 'small' ? '16' : settings.size === 'large' ? '24' : '20'}" height="${settings.size === 'small' ? '16' : settings.size === 'large' ? '24' : '20'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      `;
      fileLabel.appendChild(iconSpan);
    }
    
    const textSpan = document.createElement('span');
    if (settings.style === 'icon') {
      textSpan.className = 'sr-only';
    } else {
      textSpan.className = 'krds-file-text';
    }
    textSpan.textContent = '파일 선택';
    fileLabel.appendChild(textSpan);
    
    // 파일 이름 요소 생성
    const fileName = document.createElement('div');
    fileName.className = 'krds-file-name';
    
    // 크기에 따른 클래스 추가
    if (settings.size === 'small') {
      fileName.classList.add('krds-file-name-sm');
    } else if (settings.size === 'large') {
      fileName.classList.add('krds-file-name-lg');
    }
    
    fileName.textContent = '선택된 파일 없음';
    
    // 요소 추가
    fileUpload.appendChild(input);
    fileUpload.appendChild(fileLabel);
    fileUpload.appendChild(fileName);
    formGroup.appendChild(fileUpload);
    
    // 설명 텍스트 추가
    if (settings.description) {
      const description = document.createElement('div');
      description.className = 'krds-file-description';
      description.textContent = settings.description;
      formGroup.appendChild(description);
    }
    
    // 파일 업로드 초기화 (이벤트 리스너 등)
    setTimeout(() => {
      initFileUploads();
    }, 0);
    
    return formGroup;
  }
  
  // 페이지 로드 시 초기화
  document.addEventListener('DOMContentLoaded', initFileUploads);
  
  // 외부 사용을 위한 함수 내보내기
  window.KRDS = window.KRDS || {};
  window.KRDS.FileUpload = {
    init: initFileUploads,
    validate: validateFileInput,
    clear: clearFileInput,
    toggleDisabled: toggleFileInputDisabled,
    create: createFileUpload
  };
})(); 