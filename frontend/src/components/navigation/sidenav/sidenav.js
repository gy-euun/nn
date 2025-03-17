/**
 * KRDS 사이드 내비게이션 컴포넌트
 * 사이드 내비게이션 기능을 제공하는 JavaScript 모듈입니다.
 */

// 모든 사이드 내비게이션 초기화
function initSideNavs() {
  const sidenavs = document.querySelectorAll('.krds-sidenav');
  
  sidenavs.forEach(sidenav => {
    initSideNav(sidenav);
  });
  
  // 토글 버튼 초기화
  initSideNavToggles();
  
  // 드롭다운 메뉴 초기화
  initSideNavDropdowns();
  
  // 키보드 접근성 추가
  addKeyboardAccessibility();
  
  // 반응형 처리
  handleResponsive();

  // 윈도우 리사이즈 이벤트에 반응형 처리 연결
  window.addEventListener('resize', handleResponsive);
}

// 개별 사이드 내비게이션 초기화
function initSideNav(sidenav) {
  const closeBtn = sidenav.querySelector('.krds-sidenav-close');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidenav.classList.remove('krds-sidenav-expanded');
    });
  }
  
  // 바깥 영역 클릭 시 모바일에서 메뉴 닫기
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      // 클릭 요소가 사이드 내비게이션 밖에 있고, 토글 버튼이 아니면 사이드 내비게이션 닫기
      if (!sidenav.contains(e.target) && !e.target.closest('.krds-sidenav-toggle')) {
        sidenav.classList.remove('krds-sidenav-expanded');
      }
    }
  });
}

// 사이드 내비게이션 토글 버튼 초기화
function initSideNavToggles() {
  const toggleButtons = document.querySelectorAll('.krds-sidenav-toggle');
  
  toggleButtons.forEach(btn => {
    const targetSidenav = document.querySelector(btn.dataset.target) || 
                          btn.closest('.example-layout').querySelector('.krds-sidenav');
    
    if (targetSidenav) {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          // 모바일에서는 확장 클래스 토글
          targetSidenav.classList.toggle('krds-sidenav-expanded');
        } else {
          // 데스크탑에서는 축소 클래스 토글
          targetSidenav.classList.toggle('krds-sidenav-collapsed');
        }
        
        // ARIA 속성 업데이트
        updateAriaAttributes(targetSidenav, btn);
      });
    }
  });
}

// 사이드 내비게이션 드롭다운 초기화
function initSideNavDropdowns() {
  const dropdownToggleBtns = document.querySelectorAll('.krds-sidenav-dropdown-toggle');
  
  dropdownToggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const parentItem = btn.closest('.krds-sidenav-item');
      
      // 이미 열려있는 다른 드롭다운 닫기
      if (!parentItem.classList.contains('expanded')) {
        const currentOpenItem = btn.closest('.krds-sidenav-nav').querySelector('.krds-sidenav-item.expanded');
        if (currentOpenItem && currentOpenItem !== parentItem) {
          currentOpenItem.classList.remove('expanded');
          const openDropdownToggle = currentOpenItem.querySelector('.krds-sidenav-dropdown-toggle');
          if (openDropdownToggle) {
            openDropdownToggle.setAttribute('aria-expanded', 'false');
          }
        }
      }
      
      // 현재 드롭다운 토글
      parentItem.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', parentItem.classList.contains('expanded') ? 'true' : 'false');
    });
  });
}

// ARIA 속성 업데이트
function updateAriaAttributes(sidenav, toggleBtn) {
  const isExpanded = window.innerWidth <= 768 
    ? sidenav.classList.contains('krds-sidenav-expanded') 
    : !sidenav.classList.contains('krds-sidenav-collapsed');
  
  toggleBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
  sidenav.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
}

// 키보드 접근성 추가
function addKeyboardAccessibility() {
  // 드롭다운 메뉴 키보드 접근성
  const dropdownToggleBtns = document.querySelectorAll('.krds-sidenav-dropdown-toggle');
  
  dropdownToggleBtns.forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
  
  // Escape 키로 드롭다운 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openDropdowns = document.querySelectorAll('.krds-sidenav-item.expanded');
      openDropdowns.forEach(dropdown => {
        dropdown.classList.remove('expanded');
        const toggle = dropdown.querySelector('.krds-sidenav-dropdown-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      
      // 모바일에서 열린 사이드 내비게이션 닫기
      if (window.innerWidth <= 768) {
        const expandedSidenavs = document.querySelectorAll('.krds-sidenav-expanded');
        expandedSidenavs.forEach(nav => {
          nav.classList.remove('krds-sidenav-expanded');
        });
      }
    }
  });
}

// 반응형 처리
function handleResponsive() {
  const sidenavs = document.querySelectorAll('.krds-sidenav');
  
  sidenavs.forEach(sidenav => {
    if (window.innerWidth <= 768) {
      // 모바일 모드로 전환
      sidenav.classList.remove('krds-sidenav-collapsed');
      sidenav.setAttribute('aria-hidden', 'true');
    } else {
      // 데스크탑 모드로 전환
      sidenav.classList.remove('krds-sidenav-expanded');
    }
  });
}

// 사이드 내비게이션 생성 함수
function createSideNav(options = {}) {
  const defaultOptions = {
    brand: {
      logo: 'https://via.placeholder.com/150x40',
      alt: '브랜드 로고',
      href: '#'
    },
    items: [],
    user: null,
    dark: false,
    collapsed: false
  };
  
  const settings = { ...defaultOptions, ...options };
  
  // 컨테이너 생성
  const sidenav = document.createElement('aside');
  sidenav.className = 'krds-sidenav';
  
  if (settings.dark) {
    sidenav.classList.add('krds-sidenav-dark');
  }
  
  if (settings.collapsed) {
    sidenav.classList.add('krds-sidenav-collapsed');
  }
  
  // 헤더 생성
  const header = document.createElement('div');
  header.className = 'krds-sidenav-header';
  
  // 브랜드 로고 생성
  const brand = document.createElement('div');
  brand.className = 'krds-sidenav-brand';
  brand.innerHTML = `
    <a href="${settings.brand.href}">
      <img src="${settings.brand.logo}" alt="${settings.brand.alt}">
    </a>
  `;
  
  // 닫기 버튼 생성
  const closeBtn = document.createElement('button');
  closeBtn.className = 'krds-sidenav-close';
  closeBtn.setAttribute('aria-label', '사이드 메뉴 닫기');
  closeBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  
  header.appendChild(brand);
  header.appendChild(closeBtn);
  sidenav.appendChild(header);
  
  // 내비게이션 본문 생성
  const body = document.createElement('nav');
  body.className = 'krds-sidenav-body';
  
  const nav = document.createElement('ul');
  nav.className = 'krds-sidenav-nav';
  
  // 내비게이션 항목 생성
  settings.items.forEach(item => {
    const navItem = createSideNavItem(item);
    nav.appendChild(navItem);
  });
  
  body.appendChild(nav);
  sidenav.appendChild(body);
  
  // 푸터 생성 (사용자 정보가 있는 경우)
  if (settings.user) {
    const footer = document.createElement('div');
    footer.className = 'krds-sidenav-footer';
    
    const userEl = document.createElement('div');
    userEl.className = 'krds-sidenav-user';
    userEl.innerHTML = `
      <img src="${settings.user.image}" alt="${settings.user.name}" class="krds-sidenav-user-image">
      <div class="krds-sidenav-user-info">
        <h3 class="krds-sidenav-user-name">${settings.user.name}</h3>
        <p class="krds-sidenav-user-role">${settings.user.role}</p>
      </div>
    `;
    
    footer.appendChild(userEl);
    sidenav.appendChild(footer);
  }
  
  return sidenav;
}

// 사이드 내비게이션 항목 생성 함수
function createSideNavItem(item) {
  const li = document.createElement('li');
  li.className = 'krds-sidenav-item';
  
  if (item.active) {
    li.classList.add('active');
  }
  
  if (item.dropdown) {
    // 드롭다운 항목 생성
    const toggle = document.createElement('a');
    toggle.href = item.href || '#';
    toggle.className = 'krds-sidenav-link krds-sidenav-dropdown-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    
    toggle.innerHTML = `
      ${item.icon ? item.icon : ''}
      <span>${item.label}</span>
      <svg class="krds-sidenav-dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    li.appendChild(toggle);
    
    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'krds-sidenav-dropdown-menu';
    
    item.dropdown.forEach(subItem => {
      const subLi = document.createElement('li');
      subLi.className = 'krds-sidenav-item';
      
      if (subItem.active) {
        subLi.classList.add('active');
      }
      
      const subLink = document.createElement('a');
      subLink.href = subItem.href || '#';
      subLink.className = 'krds-sidenav-link';
      subLink.innerHTML = `<span>${subItem.label}</span>`;
      
      subLi.appendChild(subLink);
      dropdownMenu.appendChild(subLi);
    });
    
    li.appendChild(dropdownMenu);
  } else {
    // 일반 항목 생성
    const link = document.createElement('a');
    link.href = item.href || '#';
    link.className = 'krds-sidenav-link';
    
    link.innerHTML = `
      ${item.icon ? item.icon : ''}
      <span>${item.label}</span>
    `;
    
    li.appendChild(link);
  }
  
  return li;
}

// 로드 시 모든 사이드 내비게이션 초기화
document.addEventListener('DOMContentLoaded', initSideNavs); 