/**
 * 페이지네이션 컴포넌트 자바스크립트
 * 페이지 전환 및 상태 관리 기능을 제공합니다.
 */

// 페이지네이션 기본 설정
const DEFAULT_CONFIG = {
  totalItems: 100,     // 전체 아이템 수
  itemsPerPage: 10,    // 페이지당 아이템 수
  currentPage: 1,      // 현재 페이지
  visiblePages: 5,     // 화면에 표시할 페이지 링크 수
};

/**
 * 페이지네이션 초기화 함수
 * @param {HTMLElement} container - 페이지네이션 컨테이너 요소
 * @param {Object} config - 페이지네이션 설정
 */
const initPagination = (container, config = {}) => {
  // 기본 설정과 사용자 설정 병합
  const settings = { ...DEFAULT_CONFIG, ...config };
  const totalPages = Math.ceil(settings.totalItems / settings.itemsPerPage);
  
  // 페이지네이션 상태 업데이트
  const updatePagination = (currentPage) => {
    // 현재 페이지 업데이트
    settings.currentPage = currentPage;
    
    // 페이지 링크 업데이트
    updatePageLinks(container, currentPage, totalPages, settings.visiblePages);
    
    // 이전/다음 버튼 상태 업데이트
    updateNavigationButtons(container, currentPage, totalPages);
    
    // 간소화된 페이지네이션 업데이트
    updateSimplePagination(container, currentPage, totalPages);
    
    // 페이지 변경 이벤트 발생
    dispatchPageChangeEvent(container, currentPage, totalPages);
  };
  
  // 페이지 링크에 이벤트 리스너 추가
  const pageLinks = container.querySelectorAll('.krds-pagination-link');
  pageLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const pageNum = parseInt(link.textContent, 10);
      updatePagination(pageNum);
    });
  });
  
  // 네비게이션 버튼에 이벤트 리스너 추가
  const firstBtn = container.querySelector('.krds-pagination-first');
  const prevBtn = container.querySelector('.krds-pagination-prev');
  const nextBtn = container.querySelector('.krds-pagination-next');
  const lastBtn = container.querySelector('.krds-pagination-last');
  
  if (firstBtn) {
    firstBtn.addEventListener('click', () => {
      if (settings.currentPage > 1) {
        updatePagination(1);
      }
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (settings.currentPage > 1) {
        updatePagination(settings.currentPage - 1);
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (settings.currentPage < totalPages) {
        updatePagination(settings.currentPage + 1);
      }
    });
  }
  
  if (lastBtn) {
    lastBtn.addEventListener('click', () => {
      if (settings.currentPage < totalPages) {
        updatePagination(totalPages);
      }
    });
  }
  
  // 초기 상태로 업데이트
  updatePagination(settings.currentPage);
};

/**
 * 페이지 링크 업데이트 함수
 * @param {HTMLElement} container - 페이지네이션 컨테이너
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 * @param {number} visiblePages - 화면에 표시할 페이지 링크 수
 */
const updatePageLinks = (container, currentPage, totalPages, visiblePages) => {
  const pageList = container.querySelector('.krds-pagination-list');
  if (!pageList) return;
  
  // 페이지 범위 계산
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages, startPage + visiblePages - 1);
  
  if (endPage - startPage + 1 < visiblePages) {
    startPage = Math.max(1, endPage - visiblePages + 1);
  }
  
  // 기존 페이지 링크 제거
  pageList.innerHTML = '';
  
  // 첫 페이지 표시
  if (startPage > 1) {
    appendPageLink(pageList, 1, currentPage === 1);
    
    // 생략 표시
    if (startPage > 2) {
      appendEllipsis(pageList);
    }
  }
  
  // 페이지 링크 생성
  for (let i = startPage; i <= endPage; i++) {
    appendPageLink(pageList, i, currentPage === i);
  }
  
  // 마지막 페이지 표시
  if (endPage < totalPages) {
    // 생략 표시
    if (endPage < totalPages - 1) {
      appendEllipsis(pageList);
    }
    
    appendPageLink(pageList, totalPages, currentPage === totalPages);
  }
};

/**
 * 페이지 링크 추가 함수
 * @param {HTMLElement} pageList - 페이지 목록 요소
 * @param {number} pageNum - 페이지 번호
 * @param {boolean} isActive - 활성화 여부
 */
const appendPageLink = (pageList, pageNum, isActive) => {
  const li = document.createElement('li');
  li.className = 'krds-pagination-item';
  
  const a = document.createElement('a');
  a.className = 'krds-pagination-link';
  a.href = '#';
  a.textContent = pageNum;
  
  if (isActive) {
    a.setAttribute('aria-current', 'page');
  }
  
  a.addEventListener('click', (event) => {
    event.preventDefault();
    // 상위 컴포넌트의 이벤트 핸들러에서 처리
  });
  
  li.appendChild(a);
  pageList.appendChild(li);
};

/**
 * 생략 표시 추가 함수
 * @param {HTMLElement} pageList - 페이지 목록 요소
 */
const appendEllipsis = (pageList) => {
  const li = document.createElement('li');
  li.className = 'krds-pagination-item krds-pagination-ellipsis';
  
  const span = document.createElement('span');
  span.textContent = '...';
  
  li.appendChild(span);
  pageList.appendChild(li);
};

/**
 * 네비게이션 버튼 상태 업데이트 함수
 * @param {HTMLElement} container - 페이지네이션 컨테이너
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 */
const updateNavigationButtons = (container, currentPage, totalPages) => {
  const firstBtn = container.querySelector('.krds-pagination-first');
  const prevBtn = container.querySelector('.krds-pagination-prev');
  const nextBtn = container.querySelector('.krds-pagination-next');
  const lastBtn = container.querySelector('.krds-pagination-last');
  
  if (firstBtn) {
    firstBtn.disabled = currentPage === 1;
  }
  
  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
  }
  
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
  }
  
  if (lastBtn) {
    lastBtn.disabled = currentPage === totalPages;
  }
};

/**
 * 간소화된 페이지네이션 업데이트 함수
 * @param {HTMLElement} container - 페이지네이션 컨테이너
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 */
const updateSimplePagination = (container, currentPage, totalPages) => {
  const currentPageEl = container.querySelector('.krds-pagination-current');
  const totalPagesEl = container.querySelector('.krds-pagination-total');
  
  if (currentPageEl) {
    currentPageEl.textContent = currentPage;
  }
  
  if (totalPagesEl) {
    totalPagesEl.textContent = totalPages;
  }
};

/**
 * 페이지 변경 이벤트 발생 함수
 * @param {HTMLElement} container - 페이지네이션 컨테이너
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 */
const dispatchPageChangeEvent = (container, currentPage, totalPages) => {
  const event = new CustomEvent('krds-page-change', {
    bubbles: true,
    detail: {
      currentPage,
      totalPages
    }
  });
  
  container.dispatchEvent(event);
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
  const paginationContainers = document.querySelectorAll('.krds-pagination');
  
  paginationContainers.forEach(container => {
    // 데이터 속성에서 설정 값 가져오기
    const totalItems = parseInt(container.dataset.totalItems || DEFAULT_CONFIG.totalItems, 10);
    const itemsPerPage = parseInt(container.dataset.itemsPerPage || DEFAULT_CONFIG.itemsPerPage, 10);
    const currentPage = parseInt(container.dataset.currentPage || DEFAULT_CONFIG.currentPage, 10);
    const visiblePages = parseInt(container.dataset.visiblePages || DEFAULT_CONFIG.visiblePages, 10);
    
    initPagination(container, {
      totalItems,
      itemsPerPage,
      currentPage,
      visiblePages
    });
  });
});