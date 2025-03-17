/**
 * 카드 컴포넌트 자바스크립트
 * 액션 카드 및 카드 상호작용을 관리합니다.
 */

/**
 * 카드 초기화 함수
 * 모든 카드 요소에 필요한 이벤트 리스너를 추가합니다.
 */
const initCards = () => {
  // 액션 카드 초기화
  initActionCards();
  
  // 카드 호버 효과 초기화 (필요한 경우)
  initCardHoverEffects();
};

/**
 * 액션 카드 초기화 함수
 * 클릭 가능한 카드에 이벤트 리스너를 추가합니다.
 */
const initActionCards = () => {
  const actionCards = document.querySelectorAll('.krds-card-action');
  
  actionCards.forEach(card => {
    // 액션 카드의 링크 요소 가져오기
    const link = card.querySelector('.krds-card-link');
    if (!link) return;
    
    // 카드 클릭 시 링크 클릭과 동일한 동작
    card.addEventListener('click', (event) => {
      // 내부 링크나 버튼을 클릭한 경우 이벤트 버블링 중단
      if (event.target.closest('a, button, input, select, textarea')) {
        return;
      }
      
      // link의 href 속성을 가져와 페이지 이동
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        if (link.target === '_blank') {
          window.open(href, '_blank');
        } else {
          window.location.href = href;
        }
      }
      
      // 사용자 정의 이벤트 발생
      const customEvent = new CustomEvent('krds-card-action', {
        bubbles: true,
        detail: { cardId: card.id }
      });
      card.dispatchEvent(customEvent);
    });
    
    // 카드 내부 키보드 접근성
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        link.click();
      }
    });
    
    // 포커스 가능하도록 tabindex 속성 추가
    if (!card.hasAttribute('tabindex')) {
      card.setAttribute('tabindex', '0');
    }
    
    // 포커스 시 링크에 포커스 전달
    card.addEventListener('focus', () => {
      link.focus();
    });
  });
};

/**
 * 카드 호버 효과 초기화 함수
 * 특정 카드 유형에 커스텀 호버 효과를 추가합니다.
 */
const initCardHoverEffects = () => {
  const cards = document.querySelectorAll('.krds-card');
  
  cards.forEach(card => {
    // 호버 효과를 위한 이벤트 리스너 추가
    card.addEventListener('mouseenter', () => {
      // 특정 카드 유형에 따른 커스텀 호버 효과
      if (card.classList.contains('krds-card-shadow')) {
        // 그림자 카드의 경우 이미 SCSS에서 처리됨
      }
    });
    
    card.addEventListener('mouseleave', () => {
      // 호버 효과 제거
    });
  });
};

/**
 * 동적으로 카드 생성하는 함수
 * @param {Object} options - 카드 옵션
 * @returns {HTMLElement} 생성된 카드 요소
 */
const createCard = (options = {}) => {
  const {
    title = '',
    content = '',
    type = '', // 'action', 'shadow', 'outlined', 'horizontal', 'icon' 중 하나
    imageUrl = '',
    imagePosition = 'top', // 'top', 'bottom', 또는 'left' (horizontal 카드의 경우)
    link = '',
    iconSvg = '',
    header = '',
    footer = '',
    footerText = '',
    buttons = []
  } = options;
  
  // 기본 카드 요소 생성
  const card = document.createElement('div');
  card.className = 'krds-card';
  
  // 카드 타입에 따른 추가 클래스
  if (type) {
    card.classList.add(`krds-card-${type}`);
    
    if (type === 'horizontal') {
      imagePosition = 'left';
    }
  }
  
  // 카드 내용 구성
  let cardHtml = '';
  
  // 헤더 추가
  if (header) {
    cardHtml += `
      <div class="krds-card-header">
        <h3 class="krds-card-header-title">${header}</h3>
      </div>
    `;
  }
  
  // 이미지 추가 (상단)
  if (imageUrl && imagePosition === 'top') {
    cardHtml += `
      <div class="krds-card-img-top">
        <img src="${imageUrl}" alt="${title} 이미지">
      </div>
    `;
  }
  
  // 이미지 추가 (수평 레이아웃)
  if (imageUrl && imagePosition === 'left') {
    cardHtml += `
      <div class="krds-card-img">
        <img src="${imageUrl}" alt="${title} 이미지">
      </div>
    `;
  }
  
  // 아이콘 추가
  if (iconSvg && type === 'icon') {
    cardHtml += `
      <div class="krds-card-icon-wrapper">
        ${iconSvg}
      </div>
    `;
  }
  
  // 카드 본문 추가
  cardHtml += `
    <div class="krds-card-body">
      ${title ? `<h3 class="krds-card-title">${title}</h3>` : ''}
      ${content ? `<p class="krds-card-text">${content}</p>` : ''}
      ${buttons.length > 0 && !footer ? `
        <div class="krds-card-actions">
          ${buttons.map(btn => `
            <a href="${btn.link || '#'}" class="krds-btn ${btn.class || 'krds-btn-primary'}">${btn.text}</a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  // 이미지 추가 (하단)
  if (imageUrl && imagePosition === 'bottom') {
    cardHtml += `
      <div class="krds-card-img-bottom">
        <img src="${imageUrl}" alt="${title} 이미지">
      </div>
    `;
  }
  
  // 푸터 추가
  if (footer || footerText || (buttons.length > 0 && footer)) {
    cardHtml += `
      <div class="krds-card-footer">
        ${footerText ? `<span class="krds-card-footer-text">${footerText}</span>` : ''}
        ${footer || ''}
        ${buttons.length > 0 && footer ? `
          <div class="krds-card-footer-actions">
            ${buttons.map(btn => `
              <button class="krds-btn ${btn.class || 'krds-btn-primary'}">${btn.text}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // 액션 카드의 경우 링크 추가
  if (type === 'action' && link) {
    cardHtml += `<a href="${link}" class="krds-card-link" aria-label="${title}"></a>`;
  }
  
  // HTML 삽입
  card.innerHTML = cardHtml;
  
  return card;
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initCards);

// 외부로 공개할 API
window.krdsCard = {
  init: initCards,
  create: createCard
}; 