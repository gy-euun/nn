/**
 * 모달 컴포넌트 자바스크립트
 * 모달 제어 및 접근성 기능을 관리합니다.
 */

// 모달 상태 관리
let activeModal = null;
let lastFocusedElement = null;

/**
 * 모달 초기화 함수
 * 모달 열기 버튼, 닫기 버튼 등에 이벤트 리스너를 추가합니다.
 */
const initModals = () => {
  // 모달 열기 버튼에 이벤트 리스너 추가
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal-target');
      openModal(modalId);
    });
  });

  // 모달 닫기 버튼에 이벤트 리스너 추가
  const closeButtons = document.querySelectorAll('.krds-modal-close, .krds-modal-cancel');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.krds-modal');
      closeModal(modal.id);
    });
  });

  // 모달 확인 버튼에 이벤트 리스너 추가 (모달을 닫고 필요한 작업 수행)
  const confirmButtons = document.querySelectorAll('.krds-modal-confirm');
  confirmButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.krds-modal');
      
      // 여기에 확인 버튼을 눌렀을 때 수행할 작업 추가
      // 예: 폼 제출, 데이터 처리 등
      
      // 이벤트 발생
      const event = new CustomEvent('krds-modal-confirm', {
        bubbles: true,
        detail: { modalId: modal.id }
      });
      modal.dispatchEvent(event);
      
      // 모달 닫기
      closeModal(modal.id);
    });
  });

  // 백드롭 클릭 시 모달 닫기
  const backdrops = document.querySelectorAll('.krds-modal-backdrop');
  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        const modal = backdrop.closest('.krds-modal');
        closeModal(modal.id);
      }
    });
  });

  // ESC 키 누를 때 모달 닫기
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeModal) {
      closeModal(activeModal.id);
    }
  });
};

/**
 * 모달 열기 함수
 * @param {string} modalId - 열고자 하는 모달의 ID
 */
const openModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // 현재 포커스된 요소 저장
  lastFocusedElement = document.activeElement;

  // 활성화된 모달이 있으면 닫기
  if (activeModal) {
    closeModal(activeModal.id);
  }

  // 모달 활성화
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // 스크롤 방지
  
  // 활성 모달 설정
  activeModal = modal;
  
  // 포커스 이동
  const focusableElements = getFocusableElements(modal);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
  
  // 포커스 트랩 설정
  modal.addEventListener('keydown', trapFocus);
  
  // 모달 열림 이벤트 발생
  const event = new CustomEvent('krds-modal-open', {
    bubbles: true,
    detail: { modalId }
  });
  modal.dispatchEvent(event);
};

/**
 * 모달 닫기 함수
 * @param {string} modalId - 닫고자 하는 모달의 ID
 */
const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // 모달 비활성화
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // 스크롤 복원
  
  // 이벤트 리스너 제거
  modal.removeEventListener('keydown', trapFocus);
  
  // 활성 모달 초기화
  activeModal = null;
  
  // 이전에 포커스된 요소로 복귀
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
  
  // 모달 닫힘 이벤트 발생
  const event = new CustomEvent('krds-modal-close', {
    bubbles: true,
    detail: { modalId }
  });
  modal.dispatchEvent(event);
};

/**
 * 모달 내에서 포커스 가능한 요소들을 가져오는 함수
 * @param {HTMLElement} modal - 모달 요소
 * @returns {Array<HTMLElement>} 포커스 가능한 요소들의 배열
 */
const getFocusableElements = (modal) => {
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  return Array.from(modal.querySelectorAll(focusableSelectors.join(',')));
};

/**
 * 모달 내에서 포커스를 트랩하는 함수
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
const trapFocus = (event) => {
  if (event.key !== 'Tab') return;
  
  const modal = event.currentTarget;
  const focusableElements = getFocusableElements(modal);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Shift + Tab을 눌렀을 때 처리
  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  }
  // Tab만 눌렀을 때 처리
  else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
};

/**
 * 프로그래매틱하게 모달을 생성하는 함수
 * @param {Object} options - 모달 옵션
 * @returns {HTMLElement} 생성된 모달 요소
 */
const createModal = (options = {}) => {
  const {
    id = `modal-${Date.now()}`,
    title = '모달 제목',
    content = '',
    size = '', // 'sm', 'lg', 'fullscreen', 'alert' 중 하나
    confirmText = '확인',
    cancelText = '취소',
    showCancel = true
  } = options;
  
  // 모달 요소 생성
  const modal = document.createElement('div');
  modal.className = `krds-modal ${size ? `krds-modal-${size}` : ''}`;
  modal.id = id;
  modal.setAttribute('aria-labelledby', `${id}-title`);
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', size === 'alert' ? 'alertdialog' : 'dialog');
  
  modal.innerHTML = `
    <div class="krds-modal-backdrop"></div>
    <div class="krds-modal-container">
      <div class="krds-modal-header">
        <h2 id="${id}-title" class="krds-modal-title">${title}</h2>
        <button type="button" class="krds-modal-close" aria-label="모달 닫기">
          <svg class="krds-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="krds-modal-body">
        ${content}
      </div>
      <div class="krds-modal-footer">
        ${showCancel ? `<button type="button" class="krds-btn krds-btn-secondary krds-modal-cancel">${cancelText}</button>` : ''}
        <button type="button" class="krds-btn krds-btn-primary krds-modal-confirm">${confirmText}</button>
      </div>
    </div>
  `;
  
  // 모달을 문서에 추가
  document.body.appendChild(modal);
  
  // 이벤트 리스너 추가
  const closeButton = modal.querySelector('.krds-modal-close');
  closeButton.addEventListener('click', () => closeModal(id));
  
  const cancelButton = modal.querySelector('.krds-modal-cancel');
  if (cancelButton) {
    cancelButton.addEventListener('click', () => closeModal(id));
  }
  
  const confirmButton = modal.querySelector('.krds-modal-confirm');
  confirmButton.addEventListener('click', () => {
    // 확인 이벤트 발생
    const event = new CustomEvent('krds-modal-confirm', {
      bubbles: true,
      detail: { modalId: id }
    });
    modal.dispatchEvent(event);
    
    // 모달 닫기
    closeModal(id);
  });
  
  const backdrop = modal.querySelector('.krds-modal-backdrop');
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      closeModal(id);
    }
  });
  
  return modal;
};

/**
 * 확인 모달을 표시하는 함수 (편의 함수)
 * @param {Object} options - 모달 옵션
 */
const showConfirmModal = (options = {}) => {
  const modal = createModal({
    size: 'alert',
    title: options.title || '확인',
    content: `<div class="krds-modal-icon-container">
      <svg class="krds-icon krds-icon-alert" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <p class="krds-modal-message">${options.message || '계속 진행하시겠습니까?'}</p>`,
    confirmText: options.confirmText || '확인',
    cancelText: options.cancelText || '취소',
    showCancel: options.showCancel !== false
  });
  
  if (options.onConfirm) {
    modal.addEventListener('krds-modal-confirm', options.onConfirm);
  }
  
  if (options.onCancel) {
    modal.addEventListener('krds-modal-close', options.onCancel);
  }
  
  openModal(modal.id);
  return modal;
};

/**
 * 알림 모달을 표시하는 함수 (편의 함수)
 * @param {Object} options - 모달 옵션
 */
const showAlertModal = (options = {}) => {
  const modal = createModal({
    size: 'alert',
    title: options.title || '알림',
    content: `<div class="krds-modal-icon-container">
      <svg class="krds-icon krds-icon-alert" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <p class="krds-modal-message">${options.message || '알림 메시지입니다.'}</p>`,
    confirmText: options.confirmText || '확인',
    showCancel: false
  });
  
  if (options.onConfirm) {
    modal.addEventListener('krds-modal-confirm', options.onConfirm);
  }
  
  openModal(modal.id);
  return modal;
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initModals);

// 외부로 공개할 API
window.krdsModal = {
  open: openModal,
  close: closeModal,
  create: createModal,
  confirm: showConfirmModal,
  alert: showAlertModal
}; 