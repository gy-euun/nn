/**
 * 브레드크럼 컴포넌트 자바스크립트
 * 드롭다운 기능을 관리합니다.
 */

// DOM 요소 가져오기
const initBreadcrumbDropdowns = () => {
  const dropdownTriggers = document.querySelectorAll('.krds-breadcrumb-dropdown-trigger');
  
  // 드롭다운 토글 함수
  const toggleDropdown = (trigger, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const parent = trigger.closest('.krds-breadcrumb-item');
    const dropdown = parent.querySelector('.krds-breadcrumb-dropdown');
    
    // 현재 드롭다운 상태 확인
    const isVisible = dropdown.style.visibility === 'visible';
    
    // 모든 드롭다운 닫기
    document.querySelectorAll('.krds-breadcrumb-dropdown').forEach(el => {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-4px)';
    });
    
    // 현재 드롭다운이 닫혀있다면 열기
    if (!isVisible) {
      dropdown.style.visibility = 'visible';
      dropdown.style.opacity = '1';
      dropdown.style.transform = 'translateY(0)';
    }
  };
  
  // 드롭다운 트리거에 이벤트 리스너 추가
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => toggleDropdown(trigger, e));
  });
  
  // 문서 클릭 시 모든 드롭다운 닫기
  document.addEventListener('click', () => {
    document.querySelectorAll('.krds-breadcrumb-dropdown').forEach(el => {
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-4px)';
    });
  });
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initBreadcrumbDropdowns); 