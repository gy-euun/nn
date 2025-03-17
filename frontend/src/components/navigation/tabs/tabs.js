/**
 * 탭 컴포넌트 자바스크립트
 * 탭 전환 기능과 접근성을 관리합니다.
 */

// 탭 컴포넌트 초기화 함수
const initTabs = () => {
  const tabContainers = document.querySelectorAll('.krds-tabs');

  tabContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.krds-tabs-btn');
    const tabPanels = container.querySelectorAll('.krds-tabs-panel');

    // 각 탭 버튼에 클릭 이벤트 추가
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 현재 활성화된 탭 버튼 및 패널 비활성화
        const activeButton = container.querySelector('.krds-tabs-btn.active');
        const activePanel = container.querySelector('.krds-tabs-panel.active');

        if (activeButton) {
          activeButton.classList.remove('active');
          activeButton.setAttribute('aria-selected', 'false');
        }

        if (activePanel) {
          activePanel.classList.remove('active');
          activePanel.setAttribute('hidden', '');
        }

        // 선택한 탭 버튼 및 패널 활성화
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');

        const panelId = button.getAttribute('aria-controls');
        const targetPanel = container.querySelector(`#${panelId}`);

        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.removeAttribute('hidden');
        }
      });

      // 키보드 접근성 추가
      button.addEventListener('keydown', (event) => {
        const buttons = Array.from(tabButtons);
        const index = buttons.indexOf(button);
        let nextButton = null;

        switch (event.key) {
          case 'ArrowRight':
            nextButton = buttons[(index + 1) % buttons.length];
            break;
          case 'ArrowLeft':
            nextButton = buttons[(index - 1 + buttons.length) % buttons.length];
            break;
          case 'Home':
            nextButton = buttons[0];
            break;
          case 'End':
            nextButton = buttons[buttons.length - 1];
            break;
          default:
            return;
        }

        if (nextButton) {
          event.preventDefault();
          nextButton.focus();
          nextButton.click();
        }
      });
    });
  });
};

// 스크롤 가능한 탭 처리
const handleScrollableTabs = () => {
  const scrollableTabs = document.querySelectorAll('.krds-tabs-scrollable');

  scrollableTabs.forEach(tabs => {
    const tabList = tabs.querySelector('.krds-tabs-list');
    const activeTab = tabs.querySelector('.krds-tabs-btn.active');

    if (tabList && activeTab) {
      // 활성 탭이 화면 중앙에 위치하도록 스크롤
      const tabListRect = tabList.getBoundingClientRect();
      const activeTabRect = activeTab.getBoundingClientRect();
      
      const scrollPosition = activeTabRect.left - tabListRect.left - 
                            (tabListRect.width / 2) + (activeTabRect.width / 2);
      
      tabList.parentElement.scrollLeft = scrollPosition;
    }
  });
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  handleScrollableTabs();
}); 