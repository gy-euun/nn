/**
 * KRDS 링크 컴포넌트
 * 
 * 링크 컴포넌트의 기능을 초기화하고 관리합니다.
 */

// 링크 컴포넌트 초기화
function initLinks() {
  const links = document.querySelectorAll('.krds-link');
  
  if (!links.length) return;
  
  links.forEach(link => {
    // 외부 링크 처리
    if (link.classList.contains('external') && !link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
    
    // 비활성화된 링크 처리
    if (link.classList.contains('disabled')) {
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.addEventListener('click', preventDefaultForDisabled);
    }
    
    // 키보드 접근성 처리
    link.addEventListener('keydown', handleLinkKeydown);
  });
}

/**
 * 비활성화된 링크의 기본 동작 방지
 * @param {Event} event - 이벤트 객체
 */
function preventDefaultForDisabled(event) {
  event.preventDefault();
}

/**
 * 링크 키보드 접근성 처리
 * @param {KeyboardEvent} event - 키보드 이벤트 객체
 */
function handleLinkKeydown(event) {
  // Space 키로 링크 활성화 (Enter 키는 기본적으로 링크를 활성화함)
  if (event.key === ' ' || event.key === 'Spacebar') {
    event.preventDefault();
    event.target.click();
  }
}

/**
 * 외부 링크 생성 함수
 * @param {string} url - 링크 URL
 * @param {string} text - 링크 텍스트
 * @param {Object} options - 추가 옵션 (클래스, 타겟 등)
 * @returns {HTMLElement} - 생성된 링크 요소
 */
function createExternalLink(url, text, options = {}) {
  const link = document.createElement('a');
  link.href = url;
  link.classList.add('krds-link', 'external');
  
  // 기본 옵션 설정
  const defaultOptions = {
    target: '_blank',
    rel: 'noopener noreferrer',
    classes: []
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  // 클래스 추가
  if (mergedOptions.classes.length) {
    mergedOptions.classes.forEach(cls => link.classList.add(cls));
  }
  
  // 속성 설정
  if (mergedOptions.target) {
    link.setAttribute('target', mergedOptions.target);
  }
  
  if (mergedOptions.rel) {
    link.setAttribute('rel', mergedOptions.rel);
  }
  
  // 텍스트와 아이콘 추가
  const span = document.createElement('span');
  span.classList.add('underline');
  span.textContent = text;
  link.appendChild(span);
  
  // 아이콘 추가 (외부 링크 아이콘)
  if (!mergedOptions.noIcon) {
    const icon = document.createElement('i');
    icon.classList.add('krds-icon', 'icon-external');
    link.appendChild(icon);
  }
  
  return link;
}

/**
 * 다운로드 링크 생성 함수
 * @param {string} url - 다운로드할 파일 URL
 * @param {string} text - 링크 텍스트
 * @param {string} filename - 다운로드할 파일명 (옵션)
 * @param {Object} options - 추가 옵션 (클래스 등)
 * @returns {HTMLElement} - 생성된 링크 요소
 */
function createDownloadLink(url, text, filename = '', options = {}) {
  const link = document.createElement('a');
  link.href = url;
  link.classList.add('krds-link', 'download');
  link.setAttribute('download', filename || true);
  
  // 추가 클래스 설정
  if (options.classes && options.classes.length) {
    options.classes.forEach(cls => link.classList.add(cls));
  }
  
  // 텍스트와 아이콘 추가
  const span = document.createElement('span');
  span.classList.add('underline');
  span.textContent = text;
  link.appendChild(span);
  
  // 아이콘 추가 (다운로드 아이콘)
  if (!options.noIcon) {
    const icon = document.createElement('i');
    icon.classList.add('krds-icon', 'icon-download');
    link.appendChild(icon);
  }
  
  return link;
}

// DOMContentLoaded 이벤트에서 링크 초기화
document.addEventListener('DOMContentLoaded', () => {
  initLinks();
});

// 모듈로 내보내기 (필요한 경우)
export {
  initLinks,
  createExternalLink,
  createDownloadLink
}; 