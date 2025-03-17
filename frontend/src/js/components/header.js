/**
 * 헤더 컴포넌트 로더
 * 
 * 헤더 HTML을 가져와서 지정된 컨테이너에 삽입하고, 초기화합니다.
 */
export function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  
  if (headerContainer) {
    fetch('/src/components/header/Header.html')
      .then(response => response.text())
      .then(html => {
        headerContainer.innerHTML = html;
        initializeHeader();
      })
      .catch(error => {
        console.error('헤더를 로드하는 중 오류가 발생했습니다:', error);
      });
  }
}

/**
 * 헤더 초기화 함수
 * 
 * 헤더 내의 모바일 메뉴 토글 및 기타 기능을 초기화합니다.
 */
function initializeHeader() {
  // 모바일 메뉴 토글 기능
  const mobileToggle = document.querySelector('.krds-header__mobile-toggle');
  const mainNav = document.querySelector('.krds-main-nav');
  
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !expanded);
      mainNav.classList.toggle('is-active');
    });
  }
  
  // 현재 페이지에 해당하는 메뉴 항목 활성화
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.krds-main-nav__link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('krds-main-nav__link--active');
    }
  });
  
  console.log('헤더가 초기화되었습니다.');
} 