/**
 * 컴포넌트 로더 모듈
 * 
 * HTML 컴포넌트를 페이지에 동적으로 로드하는 기능을 제공합니다.
 */

/**
 * 헤더 컴포넌트를 로드합니다.
 * @param {string} containerId - 헤더 컴포넌트를 삽입할 컨테이너 요소의 ID
 * @returns {Promise} - 컴포넌트 로딩 결과를 담은 Promise 객체
 */
export const loadHeader = async (containerId = 'header-container') => {
  try {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`헤더 컨테이너 요소를 찾을 수 없습니다: #${containerId}`);
      return;
    }
    
    const response = await fetch('/src/components/header/Header.html');
    if (!response.ok) {
      throw new Error(`헤더 컴포넌트를 로드하는 중 오류가 발생했습니다: ${response.status}`);
    }
    
    const html = await response.text();
    container.innerHTML = html;
    
    // 모바일 메뉴 토글 기능 추가
    setupMobileMenu();
    
    // 현재 활성 메뉴 표시
    highlightActiveMenu();
    
    return true;
  } catch (error) {
    console.error('헤더 컴포넌트 로드 오류:', error);
    return false;
  }
};

/**
 * 푸터 컴포넌트를 로드합니다.
 * @param {string} containerId - 푸터 컴포넌트를 삽입할 컨테이너 요소의 ID
 * @returns {Promise} - 컴포넌트 로딩 결과를 담은 Promise 객체
 */
export const loadFooter = async (containerId = 'footer-container') => {
  try {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`푸터 컨테이너 요소를 찾을 수 없습니다: #${containerId}`);
      return;
    }
    
    const response = await fetch('/src/components/footer/Footer.html');
    if (!response.ok) {
      throw new Error(`푸터 컴포넌트를 로드하는 중 오류가 발생했습니다: ${response.status}`);
    }
    
    const html = await response.text();
    container.innerHTML = html;
    
    return true;
  } catch (error) {
    console.error('푸터 컴포넌트 로드 오류:', error);
    return false;
  }
};

/**
 * 모바일 메뉴 토글 기능을 설정합니다.
 */
function setupMobileMenu() {
  const menuToggle = document.querySelector('.krds-header__menu-toggle');
  const navigation = document.querySelector('.krds-navigation');
  
  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navigation.classList.toggle('is-open');
    });
  }
}

/**
 * 현재 페이지에 해당하는 메뉴 항목에 활성 클래스를 추가합니다.
 */
function highlightActiveMenu() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.krds-navigation__link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // 현재 경로가 링크의 경로와 일치하는지 확인
    if (currentPath === linkPath || 
        (currentPath.includes(linkPath) && linkPath !== '/')) {
      link.classList.add('is-active');
    }
  });
}

/**
 * 모든 컴포넌트를 로드합니다.
 * @returns {Promise} - 모든 컴포넌트 로딩 결과를 담은 Promise 객체
 */
export const loadAllComponents = async () => {
  const headerLoaded = await loadHeader();
  const footerLoaded = await loadFooter();
  
  return {
    header: headerLoaded,
    footer: footerLoaded
  };
}; 