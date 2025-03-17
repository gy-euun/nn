import { loadAllComponents } from './components.js'
import '../styles/main.scss'
import { isAuthenticated, getCurrentUser } from './auth.js'
import { loadHeader } from './components/header.js'
import { loadFooter } from './components/footer.js'
import { setupA11y } from './utils/accessibility.js'

/**
 * 산업 안전 종합 관리 플랫폼 메인 JavaScript 파일
 */

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', () => {
  // 모든 컴포넌트 로드
  loadAllComponents();
  
  // 접근성 초점 관리
  setupAccessibilityFocus();
});

/**
 * 사용자에게 알림 메시지를 표시합니다.
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 유형 ('success', 'error', 'warning', 'info')
 * @param {number} duration - 알림이 표시되는 시간(ms), 기본값 3000ms
 */
export function showNotification(message, type = 'info', duration = 3000) {
  // 이미 있는 알림 컨테이너를 찾거나 새로 생성
  let notificationContainer = document.querySelector('.krds-notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.className = 'krds-notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // 알림 요소 생성
  const notification = document.createElement('div');
  notification.className = `krds-notification krds-notification--${type}`;
  notification.setAttribute('role', 'alert');
  
  // 알림 내용 생성
  const content = document.createElement('div');
  content.className = 'krds-notification__content';
  content.textContent = message;
  
  // 닫기 버튼 생성
  const closeButton = document.createElement('button');
  closeButton.className = 'krds-notification__close';
  closeButton.setAttribute('aria-label', '알림 닫기');
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    notification.classList.add('krds-notification--hiding');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // 요소 조합
  notification.appendChild(content);
  notification.appendChild(closeButton);
  notificationContainer.appendChild(notification);
  
  // 알림 표시 애니메이션
  setTimeout(() => {
    notification.classList.add('krds-notification--visible');
  }, 10);
  
  // 자동 제거 타이머 설정
  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add('krds-notification--hiding');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }
}

/**
 * 접근성 초점 관리를 설정합니다.
 */
function setupAccessibilityFocus() {
  // 키보드 사용자 감지
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      document.body.classList.add('krds-keyboard-user');
    }
  });
  
  // 마우스 사용자 감지
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('krds-keyboard-user');
  });
}

/**
 * 페이지 로드 시 사용자 정보 확인 및 UI 초기화
 */
function initializeApp() {
  // 헤더와 푸터 로드
  loadHeader();
  loadFooter();
  
  // 접근성 설정 초기화
  setupA11y();
  
  // 로그인 상태 확인
  if (isAuthenticated()) {
    const user = getCurrentUser()
    console.log('로그인 상태:', user)
    
    // 사용자별 UI 변경
    updateUIForUser(user)
  } else {
    console.log('로그인되지 않음')
  }

  // 알림 시스템 초기화
  initializeNotifications()
}

/**
 * 사용자 정보에 따라 UI 업데이트
 * @param {Object} user - 사용자 정보
 */
function updateUIForUser(user) {
  // 사용자 역할에 따른 UI 변경
  const userRoleElement = document.getElementById('userRole')
  if (userRoleElement) {
    userRoleElement.textContent = user.role === 'ADMIN' ? '관리자' : '일반 사용자'
  }

  // 사용자 이름 표시
  const userNameElement = document.getElementById('userName')
  if (userNameElement) {
    userNameElement.textContent = user.name
  }

  // 관리자 전용 메뉴 표시/숨김
  const adminMenuItems = document.querySelectorAll('.admin-only')
  adminMenuItems.forEach(item => {
    item.style.display = user.role === 'ADMIN' ? 'block' : 'none'
  })
}

/**
 * 실시간 알림 시스템 초기화
 */
function initializeNotifications() {
  // 여기에 웹소켓 또는 폴링을 통한 실시간 알림 기능 구현
  console.log('알림 시스템 초기화')
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', initializeApp)

// 전역으로 노출할 유틸리티 함수
window.app = {
  showNotification
}
