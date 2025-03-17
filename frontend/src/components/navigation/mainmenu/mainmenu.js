/**
 * 메인 메뉴 컴포넌트 자바스크립트
 * 메뉴 토글, 드롭다운 메뉴, 메가 메뉴 등의 기능을 관리합니다.
 */

/**
 * 메인 메뉴 초기화 함수
 * 모든 메인 메뉴 요소에 필요한 이벤트 리스너를 추가합니다.
 */
const initMainMenus = () => {
  // 모바일 토글 버튼 초기화
  initMobileToggle();
  
  // 드롭다운 메뉴 초기화
  initDropdowns();
  
  // 메가 메뉴 초기화
  initMegaMenus();
  
  // 검색 기능 초기화
  initSearch();
  
  // 키보드 접근성 초기화
  initKeyboardNavigation();
  
  // 반응형 동작 초기화
  initResponsiveBehavior();
};

/**
 * 모바일 토글 버튼 초기화 함수
 * 모바일 메뉴 토글 기능을 추가합니다.
 */
const initMobileToggle = () => {
  const toggleBtns = document.querySelectorAll('.krds-mainmenu-toggle');
  
  toggleBtns.forEach(btn => {
    const mainmenu = btn.closest('.krds-mainmenu');
    const collapse = mainmenu?.querySelector('.krds-mainmenu-collapse');
    
    if (!mainmenu || !collapse) return;
    
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      
      btn.setAttribute('aria-expanded', !expanded);
      
      if (expanded) {
        // 메뉴 닫기
        collapse.classList.remove('show');
        
        // 애니메이션을 주고 싶다면 transition을 추가하고 setTimeout으로 처리
        // collapse.style.height = 'auto';
        // collapse.style.opacity = '1';
        // setTimeout(() => {
        //   collapse.style.height = '0';
        //   collapse.style.opacity = '0';
        // }, 10);
      } else {
        // 메뉴 열기
        collapse.classList.add('show');
        
        // 애니메이션을 주고 싶다면 transition을 추가하고 setTimeout으로 처리
        // collapse.style.height = '0';
        // collapse.style.opacity = '0';
        // setTimeout(() => {
        //   collapse.style.height = 'auto';
        //   collapse.style.opacity = '1';
        // }, 10);
      }
      
      // 사용자 정의 이벤트 발생
      const customEvent = new CustomEvent('krds-mainmenu-toggle', {
        bubbles: true,
        detail: { expanded: !expanded, mainmenu }
      });
      btn.dispatchEvent(customEvent);
    });
  });
  
  // 메뉴 외부 클릭 시 메뉴 닫기
  document.addEventListener('click', (event) => {
    if (window.innerWidth > 992) return; // 모바일 모드에서만 동작
    
    const target = event.target;
    const mainmenu = target.closest('.krds-mainmenu');
    
    // 메뉴 외부 클릭 시 모든 메뉴 닫기
    if (!mainmenu) {
      const openMenus = document.querySelectorAll('.krds-mainmenu-collapse.show');
      const toggleBtns = document.querySelectorAll('.krds-mainmenu-toggle[aria-expanded="true"]');
      
      openMenus.forEach(menu => menu.classList.remove('show'));
      toggleBtns.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }
  });
};

/**
 * 드롭다운 메뉴 초기화 함수
 * 드롭다운 메뉴 토글 기능을 추가합니다.
 */
const initDropdowns = () => {
  const dropdownToggles = document.querySelectorAll('.krds-mainmenu-dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    const dropdownItem = toggle.closest('.krds-mainmenu-dropdown');
    const dropdownMenu = dropdownItem?.querySelector('.krds-mainmenu-dropdown-menu');
    
    if (!dropdownItem || !dropdownMenu) return;
    
    // 드롭다운 토글 클릭 이벤트
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      
      // 현재 드롭다운 상태
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      
      // 다른 모든 드롭다운 닫기
      if (window.innerWidth > 992) { // 데스크톱 모드에서만
        document.querySelectorAll('.krds-mainmenu-dropdown-toggle[aria-expanded="true"]').forEach(el => {
          if (el !== toggle) {
            el.setAttribute('aria-expanded', 'false');
            el.closest('.krds-mainmenu-dropdown')?.classList.remove('show');
          }
        });
      }
      
      // 현재 드롭다운 토글
      toggle.setAttribute('aria-expanded', !expanded);
      dropdownItem.classList.toggle('show');
      
      // 사용자 정의 이벤트 발생
      const customEvent = new CustomEvent('krds-dropdown-toggle', {
        bubbles: true,
        detail: { expanded: !expanded, dropdown: dropdownItem }
      });
      toggle.dispatchEvent(customEvent);
    });
    
    // 키보드 이벤트
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
    });
  });
  
  // 드롭다운 외부 클릭 시 닫기
  document.addEventListener('click', (event) => {
    if (window.innerWidth <= 992) return; // 데스크톱 모드에서만 동작
    
    const target = event.target;
    const dropdown = target.closest('.krds-mainmenu-dropdown');
    
    // 다른 드롭다운 클릭이 아니면 모든 드롭다운 닫기
    if (!dropdown) {
      const openDropdowns = document.querySelectorAll('.krds-mainmenu-dropdown.show');
      const openToggles = document.querySelectorAll('.krds-mainmenu-dropdown-toggle[aria-expanded="true"]');
      
      openDropdowns.forEach(dropdown => dropdown.classList.remove('show'));
      openToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
    }
  });
};

/**
 * 메가 메뉴 초기화 함수
 * 메가 메뉴 토글 기능을 추가합니다.
 */
const initMegaMenus = () => {
  const megaMenuToggles = document.querySelectorAll('.krds-mainmenu-megamenu .krds-mainmenu-dropdown-toggle');
  
  megaMenuToggles.forEach(toggle => {
    const megaMenuItem = toggle.closest('.krds-mainmenu-megamenu');
    const megaMenuPanel = megaMenuItem?.querySelector('.krds-mainmenu-megamenu-panel');
    
    if (!megaMenuItem || !megaMenuPanel) return;
    
    // 메가 메뉴 토글 클릭 이벤트
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      
      // 현재 메가 메뉴 상태
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      
      // 다른 모든 메가 메뉴 닫기
      if (window.innerWidth > 992) { // 데스크톱 모드에서만
        document.querySelectorAll('.krds-mainmenu-megamenu .krds-mainmenu-dropdown-toggle[aria-expanded="true"]').forEach(el => {
          if (el !== toggle) {
            el.setAttribute('aria-expanded', 'false');
            el.closest('.krds-mainmenu-megamenu')?.classList.remove('show');
          }
        });
      }
      
      // 현재 메가 메뉴 토글
      toggle.setAttribute('aria-expanded', !expanded);
      megaMenuItem.classList.toggle('show');
      
      // 사용자 정의 이벤트 발생
      const customEvent = new CustomEvent('krds-megamenu-toggle', {
        bubbles: true,
        detail: { expanded: !expanded, megamenu: megaMenuItem }
      });
      toggle.dispatchEvent(customEvent);
    });
    
    // 키보드 이벤트
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle.click();
      }
    });
  });
  
  // 메가 메뉴 외부 클릭 시 닫기
  document.addEventListener('click', (event) => {
    if (window.innerWidth <= 992) return; // 데스크톱 모드에서만 동작
    
    const target = event.target;
    const megamenu = target.closest('.krds-mainmenu-megamenu');
    
    // 메가 메뉴 외부 클릭 시 모든 메가 메뉴 닫기
    if (!megamenu) {
      const openMegaMenus = document.querySelectorAll('.krds-mainmenu-megamenu.show');
      const openToggles = document.querySelectorAll('.krds-mainmenu-megamenu .krds-mainmenu-dropdown-toggle[aria-expanded="true"]');
      
      openMegaMenus.forEach(menu => menu.classList.remove('show'));
      openToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
    }
  });
};

/**
 * 검색 기능 초기화 함수
 * 메인 메뉴 검색 기능을 추가합니다.
 */
const initSearch = () => {
  const searchForms = document.querySelectorAll('.krds-mainmenu-search');
  
  searchForms.forEach(form => {
    const input = form.querySelector('.krds-mainmenu-search-input');
    const button = form.querySelector('.krds-mainmenu-search-button');
    
    if (!input || !button) return;
    
    // 폼 제출 이벤트
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      
      const searchQuery = input.value.trim();
      
      if (searchQuery) {
        // 여기서 검색 로직 처리
        // 예: 검색 페이지로 이동하거나 AJAX 요청 등
        console.log(`검색어: ${searchQuery}`);
        
        // 사용자 정의 이벤트 발생
        const customEvent = new CustomEvent('krds-mainmenu-search', {
          bubbles: true,
          detail: { query: searchQuery }
        });
        form.dispatchEvent(customEvent);
      } else {
        // 검색어가 비어있는 경우 입력란에 포커스
        input.focus();
      }
    });
    
    // 입력창 포커스 시 모바일에서 드롭다운 닫기
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 992) {
        const openDropdowns = document.querySelectorAll('.krds-mainmenu-dropdown.show, .krds-mainmenu-megamenu.show');
        const openToggles = document.querySelectorAll('.krds-mainmenu-dropdown-toggle[aria-expanded="true"]');
        
        openDropdowns.forEach(dropdown => dropdown.classList.remove('show'));
        openToggles.forEach(toggle => toggle.setAttribute('aria-expanded', 'false'));
      }
    });
  });
};

/**
 * 키보드 내비게이션 초기화 함수
 * 키보드를 이용한 메뉴 탐색 기능을 추가합니다.
 */
const initKeyboardNavigation = () => {
  const mainMenus = document.querySelectorAll('.krds-mainmenu');
  
  mainMenus.forEach(menu => {
    const menuItems = menu.querySelectorAll('.krds-mainmenu-item');
    const links = menu.querySelectorAll('.krds-mainmenu-link');
    
    links.forEach(link => {
      link.addEventListener('keydown', (event) => {
        const item = link.closest('.krds-mainmenu-item');
        const isDropdown = item.classList.contains('krds-mainmenu-dropdown') || 
                           item.classList.contains('krds-mainmenu-megamenu');
        const isDropdownToggle = link.classList.contains('krds-mainmenu-dropdown-toggle');
        const isExpanded = link.getAttribute('aria-expanded') === 'true';
        
        // 방향키 처리
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          
          if (isDropdownToggle && !isExpanded) {
            // 드롭다운 메뉴 열기
            link.click();
          } else if (isDropdownToggle && isExpanded) {
            // 하위 메뉴의 첫 번째 항목으로 포커스 이동
            const firstSubmenuItem = item.querySelector('.krds-mainmenu-dropdown-menu a, .krds-mainmenu-megamenu-list a');
            if (firstSubmenuItem) {
              firstSubmenuItem.focus();
            }
          } else {
            // 다음 메뉴 항목으로 포커스 이동
            const nextItem = item.nextElementSibling;
            if (nextItem) {
              const nextLink = nextItem.querySelector('.krds-mainmenu-link');
              if (nextLink) {
                nextLink.focus();
              }
            }
          }
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          
          // 이전 메뉴 항목으로 포커스 이동
          const prevItem = item.previousElementSibling;
          if (prevItem) {
            const prevLink = prevItem.querySelector('.krds-mainmenu-link');
            if (prevLink) {
              prevLink.focus();
            }
          }
        } else if (event.key === 'Escape') {
          // ESC 키로 드롭다운 메뉴 닫기
          if (isDropdownToggle && isExpanded) {
            link.click();
          }
        }
      });
    });
    
    // 서브메뉴 아이템 키보드 이벤트
    const submenuItems = menu.querySelectorAll('.krds-mainmenu-dropdown-item, .krds-mainmenu-megamenu-list a');
    
    submenuItems.forEach(item => {
      item.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          
          const prevItem = item.parentElement.previousElementSibling?.querySelector('a');
          if (prevItem) {
            prevItem.focus();
          } else {
            // 상위 메뉴로 이동
            const parentToggle = item.closest('.krds-mainmenu-dropdown, .krds-mainmenu-megamenu')?.querySelector('.krds-mainmenu-dropdown-toggle');
            if (parentToggle) {
              parentToggle.focus();
            }
          }
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          
          const nextItem = item.parentElement.nextElementSibling?.querySelector('a');
          if (nextItem) {
            nextItem.focus();
          }
        } else if (event.key === 'Escape') {
          event.preventDefault();
          
          // 상위 메뉴로 이동하고 드롭다운 닫기
          const dropdown = item.closest('.krds-mainmenu-dropdown, .krds-mainmenu-megamenu');
          const toggle = dropdown?.querySelector('.krds-mainmenu-dropdown-toggle');
          
          if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
            toggle.click();
            toggle.focus();
          }
        }
      });
    });
  });
};

/**
 * 반응형 동작 초기화 함수
 * 화면 크기 변경 시 메뉴 동작을 조정합니다.
 */
const initResponsiveBehavior = () => {
  // 화면 크기 변경 이벤트
  window.addEventListener('resize', () => {
    // 화면 크기가 desktop으로 변경될 때 모바일에서 열린 메뉴 처리
    if (window.innerWidth > 992) {
      // 모바일에서 열렸던 메뉴 닫기
      const mobileOpenCollapses = document.querySelectorAll('.krds-mainmenu-collapse.show');
      const mobileOpenToggles = document.querySelectorAll('.krds-mainmenu-toggle[aria-expanded="true"]');
      
      if (mobileOpenCollapses.length > 0 || mobileOpenToggles.length > 0) {
        mobileOpenCollapses.forEach(collapse => {
          // desktop에서는 collapse가 항상 표시되므로 show 클래스만 제거
          collapse.classList.remove('show');
        });
        
        mobileOpenToggles.forEach(toggle => {
          toggle.setAttribute('aria-expanded', 'false');
        });
      }
    }
  });
};

/**
 * 메인 메뉴 생성 함수
 * 동적으로 메인 메뉴를 생성합니다.
 * @param {Object} options - 메인 메뉴 옵션
 * @returns {HTMLElement} 생성된 메인 메뉴 요소
 */
const createMainMenu = (options = {}) => {
  const {
    brand = {}, // 브랜드 옵션 (logo, url)
    items = [], // 메뉴 항목 (배열)
    rightItems = [], // 우측 정렬 메뉴 항목 (배열)
    hasSearch = false, // 검색 기능 포함 여부
    isDark = false, // 다크 모드 여부
    id = null, // 메인 메뉴 ID
    className = null // 추가 클래스
  } = options;
  
  // 메인 메뉴 요소 생성
  const mainmenu = document.createElement('nav');
  mainmenu.className = `krds-mainmenu${isDark ? ' krds-mainmenu-dark' : ''}${className ? ` ${className}` : ''}`;
  
  if (id) {
    mainmenu.id = id;
  }
  
  // 메인 메뉴 컨테이너
  const container = document.createElement('div');
  container.className = 'krds-mainmenu-container';
  
  // 브랜드 영역
  const brandElement = document.createElement('div');
  brandElement.className = 'krds-mainmenu-brand';
  
  const brandLink = document.createElement('a');
  brandLink.href = brand.url || '#';
  
  if (brand.logo) {
    const logo = document.createElement('img');
    logo.src = brand.logo;
    logo.alt = brand.alt || '브랜드 로고';
    brandLink.appendChild(logo);
  } else if (brand.text) {
    brandLink.textContent = brand.text;
  }
  
  brandElement.appendChild(brandLink);
  container.appendChild(brandElement);
  
  // 토글 버튼 (모바일)
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'krds-mainmenu-toggle';
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-label', '메뉴 열기');
  
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'krds-mainmenu-toggle-icon';
  toggleBtn.appendChild(toggleIcon);
  
  container.appendChild(toggleBtn);
  
  // 메뉴 영역
  const collapse = document.createElement('div');
  collapse.className = 'krds-mainmenu-collapse';
  
  // 메인 메뉴 항목
  if (items.length > 0) {
    const nav = document.createElement('ul');
    nav.className = 'krds-mainmenu-nav';
    
    items.forEach(item => {
      const menuItem = createMenuItem(item);
      nav.appendChild(menuItem);
    });
    
    collapse.appendChild(nav);
  }
  
  // 우측 정렬 메뉴 항목
  if (rightItems.length > 0) {
    const rightNav = document.createElement('ul');
    rightNav.className = 'krds-mainmenu-nav krds-mainmenu-nav-right';
    
    rightItems.forEach(item => {
      const menuItem = createMenuItem(item);
      rightNav.appendChild(menuItem);
    });
    
    collapse.appendChild(rightNav);
  }
  
  // 검색 기능
  if (hasSearch) {
    const searchForm = document.createElement('form');
    searchForm.className = 'krds-mainmenu-search';
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'krds-mainmenu-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'krds-mainmenu-search-input';
    searchInput.placeholder = '검색어를 입력하세요...';
    
    const searchButton = document.createElement('button');
    searchButton.type = 'submit';
    searchButton.className = 'krds-mainmenu-search-button';
    searchButton.setAttribute('aria-label', '검색');
    searchButton.innerHTML = `
      <svg class="krds-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchButton);
    searchForm.appendChild(searchContainer);
    
    collapse.appendChild(searchForm);
  }
  
  container.appendChild(collapse);
  mainmenu.appendChild(container);
  
  return mainmenu;
};

/**
 * 메뉴 항목 생성 함수
 * 메인 메뉴의 항목(일반, 드롭다운, 메가 메뉴)을 생성합니다.
 * @param {Object} item - 메뉴 항목 옵션
 * @returns {HTMLElement} 생성된 메뉴 항목 요소
 */
const createMenuItem = (item) => {
  const {
    text, // 메뉴 항목 텍스트
    url = '#', // 링크 URL
    active = false, // 활성화 여부
    dropdown = null, // 드롭다운 메뉴 항목 (배열)
    megamenu = null, // 메가 메뉴 항목 (객체)
    isButton = false, // 버튼 스타일 여부
    buttonType = 'primary', // 버튼 타입
    buttonSize = 'sm', // 버튼 크기
    icon = null // 아이콘 HTML
  } = item;
  
  // 메뉴 항목 요소 생성
  const menuItem = document.createElement('li');
  menuItem.className = 'krds-mainmenu-item';
  
  if (active) {
    menuItem.classList.add('active');
  }
  
  // 드롭다운 메뉴
  if (dropdown) {
    menuItem.classList.add('krds-mainmenu-dropdown');
    
    // 드롭다운 토글 링크
    const toggleLink = document.createElement('a');
    toggleLink.href = url;
    toggleLink.className = 'krds-mainmenu-link krds-mainmenu-dropdown-toggle';
    toggleLink.setAttribute('aria-expanded', 'false');
    toggleLink.textContent = text;
    
    // 아이콘 추가
    toggleLink.innerHTML += `
      <svg class="krds-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    menuItem.appendChild(toggleLink);
    
    // 드롭다운 메뉴 목록
    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'krds-mainmenu-dropdown-menu';
    
    dropdown.forEach(subItem => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = subItem.url || '#';
      a.className = 'krds-mainmenu-dropdown-item';
      a.textContent = subItem.text;
      
      li.appendChild(a);
      dropdownMenu.appendChild(li);
    });
    
    menuItem.appendChild(dropdownMenu);
  }
  // 메가 메뉴
  else if (megamenu) {
    menuItem.classList.add('krds-mainmenu-megamenu');
    
    // 메가 메뉴 토글 링크
    const toggleLink = document.createElement('a');
    toggleLink.href = url;
    toggleLink.className = 'krds-mainmenu-link krds-mainmenu-dropdown-toggle';
    toggleLink.setAttribute('aria-expanded', 'false');
    toggleLink.textContent = text;
    
    // 아이콘 추가
    toggleLink.innerHTML += `
      <svg class="krds-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    menuItem.appendChild(toggleLink);
    
    // 메가 메뉴 패널
    const megaPanel = document.createElement('div');
    megaPanel.className = 'krds-mainmenu-megamenu-panel';
    
    const megaRow = document.createElement('div');
    megaRow.className = 'krds-mainmenu-megamenu-row';
    
    // 메가 메뉴 컬럼
    if (megamenu.columns && megamenu.columns.length > 0) {
      megamenu.columns.forEach(column => {
        const megaCol = document.createElement('div');
        megaCol.className = 'krds-mainmenu-megamenu-col';
        
        if (column.title) {
          const title = document.createElement('h3');
          title.className = 'krds-mainmenu-megamenu-title';
          title.textContent = column.title;
          megaCol.appendChild(title);
        }
        
        if (column.items && column.items.length > 0) {
          const list = document.createElement('ul');
          list.className = 'krds-mainmenu-megamenu-list';
          
          column.items.forEach(subItem => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = subItem.url || '#';
            a.textContent = subItem.text;
            
            li.appendChild(a);
            list.appendChild(li);
          });
          
          megaCol.appendChild(list);
        }
        
        megaRow.appendChild(megaCol);
      });
    }
    
    megaPanel.appendChild(megaRow);
    menuItem.appendChild(megaPanel);
  }
  // 일반 메뉴 항목
  else {
    // 메뉴 링크
    const link = document.createElement('a');
    link.href = url;
    link.className = 'krds-mainmenu-link';
    
    // 버튼 스타일
    if (isButton) {
      link.classList.add(`krds-btn`, `krds-btn-${buttonType}`, `krds-btn-${buttonSize}`);
    }
    
    // 아이콘 추가
    if (icon) {
      link.innerHTML = icon;
      link.innerHTML += ' ';
    }
    
    link.innerHTML += text;
    menuItem.appendChild(link);
  }
  
  return menuItem;
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initMainMenus);

// 외부로 공개할 API
window.krdsMainMenu = {
  init: initMainMenus,
  create: createMainMenu
}; 