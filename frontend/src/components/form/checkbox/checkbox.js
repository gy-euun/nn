/**
 * KRDS 체크박스 컴포넌트 JavaScript
 * 체크박스 관련 상호작용 및 접근성 향상을 위한 기능을 제공합니다.
 */

/**
 * 체크박스 초기화 함수
 * 페이지 내의 모든 KRDS 체크박스에 이벤트 핸들러를 연결합니다.
 */
export function initCheckboxes() {
  // 그룹 체크박스 처리
  initGroupCheckboxes();
  
  // 접근성 강화
  enhanceCheckboxAccessibility();
  
  // 체크박스 추가 기능
  addAdvancedFunctionality();
}

/**
 * 그룹 체크박스 처리
 * 전체 선택/해제 기능이 있는 체크박스 그룹을 처리합니다.
 */
function initGroupCheckboxes() {
  // 전체 선택 체크박스 찾기
  const selectAllCheckboxes = document.querySelectorAll('.krds-form-check[data-select-all]');
  
  selectAllCheckboxes.forEach(container => {
    const checkbox = container.querySelector('input[type="checkbox"]');
    const targetGroup = container.getAttribute('data-select-all');
    const groupCheckboxes = document.querySelectorAll(`.krds-form-check[data-group="${targetGroup}"] input[type="checkbox"]:not(:disabled)`);
    
    if (!checkbox || groupCheckboxes.length === 0) return;
    
    // 전체 선택 체크박스 이벤트
    checkbox.addEventListener('change', function() {
      const isChecked = this.checked;
      
      groupCheckboxes.forEach(groupCheckbox => {
        // 상태 변경 및 이벤트 발생
        if (groupCheckbox.checked !== isChecked) {
          groupCheckbox.checked = isChecked;
          
          // 변경 이벤트 발생시키기
          const event = new Event('change', { bubbles: true });
          groupCheckbox.dispatchEvent(event);
        }
      });
    });
    
    // 그룹 체크박스 변경 시 전체 선택 체크박스 상태 업데이트
    groupCheckboxes.forEach(groupCheckbox => {
      groupCheckbox.addEventListener('change', function() {
        updateSelectAllState(checkbox, groupCheckboxes);
      });
    });
    
    // 초기 상태 설정
    updateSelectAllState(checkbox, groupCheckboxes);
  });
}

/**
 * 전체 선택 체크박스 상태 업데이트
 * @param {HTMLElement} selectAllCheckbox - 전체 선택 체크박스 요소
 * @param {NodeList} groupCheckboxes - 그룹 체크박스 노드 목록
 */
function updateSelectAllState(selectAllCheckbox, groupCheckboxes) {
  const totalCount = groupCheckboxes.length;
  let checkedCount = 0;
  
  groupCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      checkedCount++;
    }
  });
  
  // 모두 선택된 경우
  if (checkedCount === totalCount) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } 
  // 일부만 선택된 경우
  else if (checkedCount > 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  } 
  // 모두 선택되지 않은 경우
  else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  }
}

/**
 * 체크박스 접근성 향상
 */
function enhanceCheckboxAccessibility() {
  const checkboxes = document.querySelectorAll('.krds-form-check input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
    // 키보드 접근성
    checkbox.addEventListener('keydown', function(e) {
      // 스페이스 키를 제외한 특정 키에 대해 별도 처리
      if (e.key === 'Enter') {
        e.preventDefault();
        this.click();
      }
    });
    
    // 포커스 표시 개선
    checkbox.addEventListener('focus', function() {
      this.parentElement.classList.add('focus');
    });
    
    checkbox.addEventListener('blur', function() {
      this.parentElement.classList.remove('focus');
    });
  });
}

/**
 * 고급 체크박스 기능 추가
 */
function addAdvancedFunctionality() {
  // 상호 의존적 체크박스 처리
  const dependentCheckboxes = document.querySelectorAll('.krds-form-check[data-requires]');
  
  dependentCheckboxes.forEach(container => {
    const checkbox = container.querySelector('input[type="checkbox"]');
    const requiredCheckboxId = container.getAttribute('data-requires');
    const requiredCheckbox = document.getElementById(requiredCheckboxId);
    
    if (!checkbox || !requiredCheckbox) return;
    
    // 의존성 체크
    checkbox.addEventListener('change', function() {
      if (this.checked && !requiredCheckbox.checked) {
        // 의존 체크박스가 선택되어 있지 않으면 함께 선택
        requiredCheckbox.checked = true;
        
        // 사용자에게 알림
        const formFeedback = container.querySelector('.krds-form-feedback') || document.createElement('div');
        formFeedback.className = 'krds-form-feedback';
        formFeedback.textContent = `'${requiredCheckbox.nextElementSibling.textContent}'도 함께 선택되었습니다.`;
        
        if (!container.querySelector('.krds-form-feedback')) {
          container.appendChild(formFeedback);
          
          // 알림 자동 제거
          setTimeout(() => {
            formFeedback.remove();
          }, 3000);
        }
      }
    });
  });
}

// 페이지 로드 시 체크박스 초기화
document.addEventListener('DOMContentLoaded', initCheckboxes);

// 동적으로 추가된 체크박스 처리를 위한 함수
export function initDynamicCheckboxes(container = document) {
  // 여기에 동적으로 추가된 체크박스를 초기화하는 로직 구현
} 