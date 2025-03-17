/**
 * 헤더 컴포넌트 자바스크립트
 * 모바일 메뉴 토글 및 드롭다운 메뉴 기능 구현
 */

// DOM 요소 가져오기
const header = document.getElementById('krds-header');
const mobileMenuBtn = header?.querySelector('.mobile-menu-btn');
const mobileMenu = header?.querySelector('.mobile-menu');
const mobileCloseBtn = header?.querySelector('.mobile-close-btn');
const dropMenus = header?.querySelectorAll('.krds-drop-wrap');

// 모바일 메뉴 오버레이 생성
const createOverlay = () => {
  if (document.querySelector('.mobile-menu-overlay')) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'mobile-menu-overlay';
  document.body.appendChild(overlay);
  
  // 오버레이 클릭 시 모바일 메뉴 닫기
  overlay.addEventListener('click', () => {
    closeMenu();
  });
  
  return overlay;
};

// 모바일 메뉴 열기
const openMenu = () => {
  if (!mobileMenu || !header) return;
  
  // 오버레이 생성 및 활성화
  const overlay = createOverlay();
  overlay.classList.add('active');
  
  // 모바일 메뉴 활성화
  mobileMenu.classList.add('active');
  
  // 스크롤 방지
  document.body.style.overflow = 'hidden';
};

// 모바일 메뉴 닫기
const closeMenu = () => {
  if (!mobileMenu) return;
  
  // 오버레이 비활성화
  const overlay = document.querySelector('.mobile-menu-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }
  
  // 모바일 메뉴 비활성화
  mobileMenu.classList.remove('active');
  
  // 스크롤 허용
  document.body.style.overflow = '';
};

// 드롭다운 메뉴 초기화
const initDropdowns = () => {
  if (!dropMenus) return;
  
  // 모바일에서 드롭다운 버튼 클릭 시 동작
  dropMenus.forEach(dropWrap => {
    const dropBtn = dropWrap.querySelector('.drop-btn');
    const dropMenu = dropWrap.querySelector('.drop-menu');
    
    if (!dropBtn || !dropMenu) return;
    
    // 모바일용 터치 이벤트 핸들러 (호버가 작동하지 않을 때)
    dropBtn.addEventListener('click', (e) => {
      // 768px 이하에서만 작동
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        
        // 현재 메뉴의 상태 확인
        const isOpen = dropMenu.classList.contains('active');
        
        // 모든 드롭다운 메뉴 닫기
        dropMenus.forEach(menu => {
          menu.querySelector('.drop-menu')?.classList.remove('active');
        });
        
        // 클릭한 메뉴만 토글
        if (!isOpen) {
          dropMenu.classList.add('active');
        }
      }
    });
  });
  
  // 페이지 클릭 시 모든 드롭다운 닫기
  document.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      dropMenus.forEach(menu => {
        menu.querySelector('.drop-menu')?.classList.remove('active');
      });
    }
  });
};

// 스크롤 시 헤더 스타일 변경
const handleScroll = () => {
  if (!header) return;
  
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

// 이벤트 리스너 등록
const initHeader = () => {
  if (!header) return;
  
  // 모바일 메뉴 버튼 클릭 이벤트
  mobileMenuBtn?.addEventListener('click', openMenu);
  mobileCloseBtn?.addEventListener('click', closeMenu);
  
  // 드롭다운 메뉴 초기화
  initDropdowns();
  
  // 스크롤 이벤트
  window.addEventListener('scroll', handleScroll);
  
  // 리사이즈 이벤트 (모바일 메뉴 자동 닫기)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initHeader); 