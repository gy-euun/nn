/**
 * 푸터 컴포넌트 로더
 * 
 * 푸터 HTML을 가져와서 지정된 컨테이너에 삽입하고, 초기화합니다.
 */
export function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  
  if (footerContainer) {
    fetch('/src/components/footer/Footer.html')
      .then(response => response.text())
      .then(html => {
        footerContainer.innerHTML = html;
        initializeFooter();
      })
      .catch(error => {
        console.error('푸터를 로드하는 중 오류가 발생했습니다:', error);
      });
  }
}

/**
 * 푸터 초기화 함수
 * 
 * 푸터 내의 동적 요소를 초기화합니다.
 */
function initializeFooter() {
  // 현재 연도로 저작권 연도 업데이트
  const copyrightEl = document.querySelector('.krds-footer__copyright');
  if (copyrightEl) {
    const currentYear = new Date().getFullYear();
    const copyrightText = copyrightEl.textContent;
    copyrightEl.textContent = copyrightText.replace(/\d{4}/, currentYear);
  }
  
  console.log('푸터가 초기화되었습니다.');
} 