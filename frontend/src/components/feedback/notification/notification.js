/**
 * KRDS 알림 컴포넌트
 * 
 * 이 모듈은 알림 컴포넌트의 기능을 초기화하고 관리합니다.
 * - 다양한 유형의 알림 생성 및 표시
 * - 자동 및 수동 닫기 기능
 * - 액션 버튼 처리
 * - 컨테이너 내 위치 지정
 */

// 고유 ID 생성을 위한 카운터
let notificationIdCounter = 0;

// 알림 기본 설정
const defaultSettings = {
  type: 'info', // info, success, warning, error
  title: '',
  message: '',
  duration: 5000, // 밀리초 단위, 0이면 자동으로 닫히지 않음
  position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
  closable: true,
  actions: [], // {label, primary, onClick} 형식의 객체 배열
  showIcon: true,
  isToast: false,
  onClose: null, // 닫힐 때 콜백
  onAction: null // 액션 버튼 클릭 시 콜백
};

// 알림 컴포넌트 초기화
function initNotifications() {
  // 기존 알림 닫기 버튼에 이벤트 등록
  document.querySelectorAll('.krds-notification .notification-close').forEach(button => {
    button.addEventListener('click', handleNotificationClose);
  });
  
  // 액션 버튼에 이벤트 등록
  document.querySelectorAll('.krds-notification .notification-action-btn').forEach(button => {
    button.addEventListener('click', handleNotificationAction);
  });
  
  // 예제 페이지의 버튼 이벤트 등록
  initExampleButtons();
  
  // DOM 변경 감지하여 동적으로 추가된 알림 초기화
  observeNewNotifications();
}

/**
 * 알림 닫기 버튼 이벤트 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleNotificationClose(event) {
  const closeButton = event.currentTarget;
  const notification = closeButton.closest('.krds-notification');
  
  if (notification) {
    closeNotification(notification);
  }
}

/**
 * 알림 액션 버튼 이벤트 핸들러
 * @param {Event} event - 이벤트 객체
 */
function handleNotificationAction(event) {
  const actionButton = event.currentTarget;
  const notification = actionButton.closest('.krds-notification');
  const actionIndex = Array.from(
    notification.querySelectorAll('.notification-action-btn')
  ).indexOf(actionButton);
  
  if (notification) {
    // 커스텀 이벤트 발생
    const customEvent = new CustomEvent('krds:notification:action', {
      detail: {
        notification: notification,
        actionIndex: actionIndex,
        actionButton: actionButton
      },
      bubbles: true
    });
    
    notification.dispatchEvent(customEvent);
    
    // data-action-close 속성이 있으면 알림 닫기
    if (actionButton.dataset.actionClose !== undefined) {
      closeNotification(notification);
    }
  }
}

/**
 * 알림 닫기 함수
 * @param {HTMLElement} notification - 알림 요소
 */
function closeNotification(notification) {
  // 닫기 애니메이션 추가
  notification.classList.add('removing');
  
  // 애니메이션 완료 후 요소 제거
  notification.addEventListener('animationend', () => {
    // 커스텀 이벤트 발생
    const customEvent = new CustomEvent('krds:notification:closed', {
      detail: {
        notification: notification
      },
      bubbles: true
    });
    
    notification.dispatchEvent(customEvent);
    
    // 요소 제거
    notification.remove();
  }, { once: true });
  
  // onClose 콜백이 있으면 호출
  if (notification.dataset.hasOwnProperty('onCloseId')) {
    const callbackId = notification.dataset.onCloseId;
    const callback = window[`krdsNotificationCallback_${callbackId}`];
    
    if (typeof callback === 'function') {
      callback(notification);
      // 콜백 제거
      delete window[`krdsNotificationCallback_${callbackId}`];
    }
  }
}

/**
 * 새 알림 생성 함수
 * @param {Object} options - 알림 옵션
 * @returns {HTMLElement} - 생성된 알림 요소
 */
function createNotification(options = {}) {
  // 설정 병합
  const settings = { ...defaultSettings, ...options };
  
  // 고유 ID 생성
  const notificationId = `notification-${++notificationIdCounter}`;
  
  // 콜백 등록 (전역 범위에 저장)
  if (typeof settings.onClose === 'function') {
    const callbackId = notificationIdCounter;
    window[`krdsNotificationCallback_${callbackId}`] = settings.onClose;
    settings.onCloseId = callbackId;
  }
  
  // 알림 컨테이너 확인 또는 생성
  let container = document.querySelector(`.krds-notification-container.${settings.position}`);
  
  if (!container) {
    container = document.createElement('div');
    container.className = `krds-notification-container ${settings.position}`;
    document.body.appendChild(container);
  }
  
  // 알림 요소 생성
  const notification = document.createElement('div');
  notification.id = notificationId;
  notification.className = `krds-notification ${settings.type}`;
  notification.setAttribute('role', ['warning', 'error'].includes(settings.type) ? 'alert' : 'status');
  
  if (settings.isToast) {
    notification.classList.add('toast');
  }
  
  if (settings.actions && settings.actions.length > 0) {
    notification.classList.add('with-action');
  }
  
  if (settings.ariaLive) {
    notification.setAttribute('aria-live', settings.ariaLive);
  } else if (['warning', 'error'].includes(settings.type)) {
    notification.setAttribute('aria-live', 'assertive');
  } else {
    notification.setAttribute('aria-live', 'polite');
  }
  
  // onClose 콜백 ID 저장
  if (settings.onCloseId) {
    notification.dataset.onCloseId = settings.onCloseId;
  }
  
  // 내용 구성
  let notificationHTML = '';
  
  // 아이콘 영역
  if (settings.showIcon && !settings.isToast) {
    notificationHTML += `
      <div class="notification-icon">
        ${getIconForType(settings.type)}
      </div>
    `;
  }
  
  // 컨텐츠 영역
  notificationHTML += `
    <div class="notification-content">
  `;
  
  // 제목 (있는 경우)
  if (settings.title && !settings.isToast) {
    notificationHTML += `
      <h3 class="notification-title">${settings.title}</h3>
    `;
  }
  
  // 메시지
  notificationHTML += `
    <p class="notification-message">${settings.message}</p>
  `;
  
  // 액션 버튼 (있는 경우)
  if (settings.actions && settings.actions.length > 0) {
    notificationHTML += `
      <div class="notification-actions">
    `;
    
    settings.actions.forEach((action, index) => {
      notificationHTML += `
        <button class="notification-action-btn${action.primary ? ' primary' : ''}" 
          data-action-index="${index}"
          ${action.close ? 'data-action-close' : ''}>
          ${action.label}
        </button>
      `;
    });
    
    notificationHTML += `
      </div>
    `;
  }
  
  notificationHTML += `
    </div>
  `;
  
  // 닫기 버튼 (설정에서 활성화된 경우)
  if (settings.closable) {
    notificationHTML += `
      <button class="notification-close" aria-label="알림 닫기">
        <svg xmlns="http://www.w3.org/2000/svg" width="${settings.isToast ? '16' : '24'}" height="${settings.isToast ? '16' : '24'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
  }
  
  notification.innerHTML = notificationHTML;
  
  // 알림 컨테이너에 추가
  container.appendChild(notification);
  
  // 이벤트 리스너 등록
  if (settings.closable) {
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', handleNotificationClose);
  }
  
  // 액션 버튼 이벤트 등록
  if (settings.actions && settings.actions.length > 0) {
    const actionButtons = notification.querySelectorAll('.notification-action-btn');
    
    actionButtons.forEach((button, index) => {
      button.addEventListener('click', (event) => {
        // 액션 콜백 실행
        if (typeof settings.actions[index].onClick === 'function') {
          settings.actions[index].onClick(event);
        }
        
        // 공통 핸들러 호출
        handleNotificationAction(event);
      });
    });
  }
  
  // 자동 닫기 설정
  if (settings.duration > 0) {
    setTimeout(() => {
      // 요소가 아직 존재하는지 확인
      if (document.body.contains(notification)) {
        closeNotification(notification);
      }
    }, settings.duration);
  }
  
  // 커스텀 이벤트 발생
  const customEvent = new CustomEvent('krds:notification:created', {
    detail: {
      notification: notification,
      settings: settings
    },
    bubbles: true
  });
  
  notification.dispatchEvent(customEvent);
  
  return notification;
}

/**
 * 알림 유형에 따른 아이콘 SVG 반환
 * @param {string} type - 알림 유형
 * @returns {string} - SVG 아이콘 문자열
 */
function getIconForType(type) {
  switch (type) {
    case 'info':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
    case 'success':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
    case 'warning':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `;
    case 'error':
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    default:
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      `;
  }
}

/**
 * 예제 버튼 초기화 함수
 */
function initExampleButtons() {
  // 정보 알림 버튼
  const infoBtn = document.getElementById('showInfoBtn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      createNotification({
        type: 'info',
        title: '정보 알림',
        message: '중요한 정보가 있습니다.'
      });
    });
  }
  
  // 성공 알림 버튼
  const successBtn = document.getElementById('showSuccessBtn');
  if (successBtn) {
    successBtn.addEventListener('click', () => {
      createNotification({
        type: 'success',
        title: '성공 알림',
        message: '작업이 성공적으로 완료되었습니다.'
      });
    });
  }
  
  // 경고 알림 버튼
  const warningBtn = document.getElementById('showWarningBtn');
  if (warningBtn) {
    warningBtn.addEventListener('click', () => {
      createNotification({
        type: 'warning',
        title: '경고 알림',
        message: '진행하기 전에 확인이 필요합니다.',
        duration: 0,
        actions: [
          {
            label: '확인',
            primary: true,
            close: true
          },
          {
            label: '취소',
            close: true
          }
        ]
      });
    });
  }
  
  // 오류 알림 버튼
  const errorBtn = document.getElementById('showErrorBtn');
  if (errorBtn) {
    errorBtn.addEventListener('click', () => {
      createNotification({
        type: 'error',
        title: '오류 알림',
        message: '요청을 처리하는 중 오류가 발생했습니다.'
      });
    });
  }
  
  // 토스트 알림 버튼
  const toastBtn = document.getElementById('showToastBtn');
  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      createNotification({
        type: 'success',
        message: '변경사항이 저장되었습니다.',
        isToast: true,
        duration: 3000
      });
    });
  }
}

/**
 * DOM의 변경을 관찰하여 새로운 알림을 찾아 이벤트를 등록
 */
function observeNewNotifications() {
  // MutationObserver가 지원되는지 확인
  if (!window.MutationObserver) return;
  
  // DOM 변경을 관찰하는 옵저버 생성
  const observer = new MutationObserver(mutations => {
    let shouldInit = false;
    
    // 변경된 DOM에서 새로운 알림을 확인
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 새로 추가된 요소에서 알림을 찾음
            const newNotifications = node.querySelectorAll('.krds-notification');
            if (newNotifications.length) {
              shouldInit = true;
            }
            
            // 새로 추가된 요소 자체가 알림인 경우
            if (node.classList && node.classList.contains('krds-notification')) {
              shouldInit = true;
            }
          }
        });
      }
    });
    
    // 새로운 알림이 있으면 초기화
    if (shouldInit) {
      // 새로 추가된 알림에만 이벤트 리스너 등록
      document.querySelectorAll('.krds-notification:not([data-initialized])').forEach(notification => {
        // 닫기 버튼 이벤트 등록
        const closeButton = notification.querySelector('.notification-close');
        if (closeButton) {
          closeButton.addEventListener('click', handleNotificationClose);
        }
        
        // 액션 버튼 이벤트 등록
        const actionButtons = notification.querySelectorAll('.notification-action-btn');
        actionButtons.forEach(button => {
          button.addEventListener('click', handleNotificationAction);
        });
        
        // 초기화 완료 표시
        notification.dataset.initialized = 'true';
      });
    }
  });
  
  // 문서 전체를 관찰
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 유틸리티 함수: 모든 알림 닫기
function closeAllNotifications() {
  document.querySelectorAll('.krds-notification').forEach(notification => {
    closeNotification(notification);
  });
}

// 바로 사용 가능한 함수
function showInfo(message, options = {}) {
  return createNotification({
    type: 'info',
    message,
    ...options
  });
}

function showSuccess(message, options = {}) {
  return createNotification({
    type: 'success',
    message,
    ...options
  });
}

function showWarning(message, options = {}) {
  return createNotification({
    type: 'warning',
    message,
    ...options
  });
}

function showError(message, options = {}) {
  return createNotification({
    type: 'error',
    message,
    ...options
  });
}

function showToast(message, type = 'info', options = {}) {
  return createNotification({
    type,
    message,
    isToast: true,
    duration: 3000,
    ...options
  });
}

// DOMContentLoaded 이벤트에서 알림 초기화
document.addEventListener('DOMContentLoaded', initNotifications);

// 모듈 내보내기
export {
  createNotification,
  closeNotification,
  closeAllNotifications,
  showInfo,
  showSuccess,
  showWarning,
  showError,
  showToast
}; 