/**
 * 셀렉트/드롭다운 컴포넌트
 * 
 * 이 모듈은 다양한 유형의 셀렉트/드롭다운 컴포넌트에 대한 JavaScript 기능을 구현합니다.
 * - 기본 네이티브 셀렉트 초기화
 * - 커스텀 드롭다운 기능 (열기/닫기, 옵션 선택)
 * - 검색 가능한 드롭다운
 * - 다중 선택 드롭다운
 * - 키보드 접근성
 */

// 모든 셀렉트/드롭다운 요소 초기화
function initSelects() {
  initNativeSelects();
  initCustomSelects();
  initSearchableSelects();
  initMultipleSelects();
  
  // DOM 변경 감지하여 동적으로 추가된 셀렉트 요소 초기화
  observeNewSelectElements();
}

// 네이티브 셀렉트 요소 초기화
function initNativeSelects() {
  const nativeSelects = document.querySelectorAll('.select-native');
  
  nativeSelects.forEach(select => {
    // 이미 초기화된 셀렉트는 건너뛰기
    if (select.dataset.initialized) return;
    
    // 유효성 검사 이벤트 리스너 추가
    if (select.hasAttribute('required')) {
      select.addEventListener('change', validateSelect);
      select.addEventListener('blur', validateSelect);
    }
    
    // 초기화 완료 표시
    select.dataset.initialized = 'true';
  });
}

// 커스텀 셀렉트 요소 초기화
function initCustomSelects() {
  const customSelects = document.querySelectorAll('.select-custom:not(.select-custom--searchable):not(.select-custom--multiple)');
  
  customSelects.forEach(select => {
    // 이미 초기화된 셀렉트는 건너뛰기
    if (select.dataset.initialized) return;
    
    const selected = select.querySelector('.select-custom__selected');
    const options = select.querySelector('.select-custom__options');
    const hiddenInput = select.querySelector('input[type="hidden"]');
    
    // 클릭 이벤트로 드롭다운 토글
    select.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(select);
    });
    
    // 옵션 선택 이벤트 등록
    if (options) {
      const optionItems = options.querySelectorAll('.select-custom__option');
      
      optionItems.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          selectOption(select, option);
        });
      });
    }
    
    // 키보드 접근성 추가
    select.addEventListener('keydown', handleSelectKeydown);
    
    // 초기화 완료 표시
    select.dataset.initialized = 'true';
  });
  
  // 외부 클릭 시 모든 드롭다운 닫기
  document.addEventListener('click', closeAllDropdowns);
}

// 검색 가능한 셀렉트 초기화
function initSearchableSelects() {
  const searchableSelects = document.querySelectorAll('.select-custom--searchable');
  
  searchableSelects.forEach(select => {
    // 이미 초기화된 셀렉트는 건너뛰기
    if (select.dataset.initialized) return;
    
    const searchInput = select.querySelector('.select-custom__search');
    const options = select.querySelector('.select-custom__options');
    const hiddenInput = select.querySelector('input[type="hidden"]');
    
    // 검색 입력 이벤트
    if (searchInput) {
      // 아이콘 클릭 시 드롭다운 토글
      const icon = select.querySelector('.select-custom__icon');
      if (icon) {
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleDropdown(select);
          if (select.getAttribute('aria-expanded') === 'true') {
            searchInput.focus();
          }
        });
      }
      
      // 검색 입력 시 필터링
      searchInput.addEventListener('input', () => {
        filterOptions(select, searchInput.value);
      });
      
      // 검색 입력란 클릭 시 이벤트 전파 중지 (드롭다운이 닫히지 않게)
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
        if (select.getAttribute('aria-expanded') !== 'true') {
          toggleDropdown(select);
        }
      });
      
      // 키보드 처리
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          navigateOptions(select, e.key === 'ArrowDown' ? 'next' : 'prev');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          selectFocusedOption(select);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown(select);
        }
      });
    }
    
    // 옵션 선택 이벤트 등록
    if (options) {
      const optionItems = options.querySelectorAll('.select-custom__option');
      
      optionItems.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          selectOption(select, option);
          if (searchInput) searchInput.value = '';
          filterOptions(select, '');
        });
      });
    }
    
    // 초기화 완료 표시
    select.dataset.initialized = 'true';
  });
}

// 다중 선택 셀렉트 초기화
function initMultipleSelects() {
  const multipleSelects = document.querySelectorAll('.select-custom--multiple');
  
  multipleSelects.forEach(select => {
    // 이미 초기화된 셀렉트는 건너뛰기
    if (select.dataset.initialized) return;
    
    const tagsContainer = select.querySelector('.select-custom__tags');
    const searchInput = select.querySelector('.select-custom__search');
    const options = select.querySelector('.select-custom__options');
    const nativeSelect = select.querySelector('select[multiple]');
    
    // 초기 선택 상태 설정
    if (nativeSelect) {
      Array.from(nativeSelect.selectedOptions).forEach(option => {
        const matchingOption = options.querySelector(`.select-custom__option[data-value="${option.value}"]`);
        if (matchingOption) {
          selectMultipleOption(select, matchingOption, false);
        }
      });
    }
    
    // 검색 기능 설정
    if (searchInput) {
      // 아이콘 클릭 시 드롭다운 토글
      const icon = select.querySelector('.select-custom__icon');
      if (icon) {
        icon.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleDropdown(select);
          if (select.getAttribute('aria-expanded') === 'true') {
            searchInput.focus();
          }
        });
      }
      
      // 검색 입력 시 필터링
      searchInput.addEventListener('input', () => {
        filterOptions(select, searchInput.value);
      });
      
      // 검색 입력란 클릭 시 이벤트 전파 중지
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
        if (select.getAttribute('aria-expanded') !== 'true') {
          toggleDropdown(select);
        }
      });
      
      // 키보드 처리
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          navigateOptions(select, e.key === 'ArrowDown' ? 'next' : 'prev');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const focusedOption = options.querySelector('.select-custom__option:focus');
          if (focusedOption) {
            selectMultipleOption(select, focusedOption);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown(select);
        } else if (e.key === 'Backspace' && searchInput.value === '') {
          // 마지막 태그 제거
          const tags = tagsContainer.querySelectorAll('.select-custom__tag');
          if (tags.length > 0) {
            const lastTag = tags[tags.length - 1];
            const value = lastTag.dataset.value;
            removeTag(select, value);
          }
        }
      });
    }
    
    // 옵션 선택 이벤트 등록
    if (options) {
      const optionItems = options.querySelectorAll('.select-custom__option');
      
      optionItems.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          selectMultipleOption(select, option);
          if (searchInput) {
            searchInput.value = '';
            filterOptions(select, '');
            searchInput.focus();
          }
        });
      });
    }
    
    // 셀렉트 영역 클릭 시 드롭다운 토글
    select.addEventListener('click', (e) => {
      if (!e.target.closest('.select-custom__tag')) {
        toggleDropdown(select);
        if (select.getAttribute('aria-expanded') === 'true' && searchInput) {
          searchInput.focus();
        }
      }
    });
    
    // 초기화 완료 표시
    select.dataset.initialized = 'true';
  });
}

// 네이티브 셀렉트 유효성 검사
function validateSelect(e) {
  const select = e.target;
  const validationMessage = select.nextElementSibling;
  
  if (select.hasAttribute('required') && select.value === '') {
    select.setCustomValidity('이 필드는 필수입니다.');
    if (validationMessage && validationMessage.classList.contains('validation-message')) {
      validationMessage.textContent = '이 필드는 필수입니다.';
    }
  } else {
    select.setCustomValidity('');
    if (validationMessage && validationMessage.classList.contains('validation-message')) {
      validationMessage.textContent = '';
    }
  }
}

// 드롭다운 토글
function toggleDropdown(select) {
  const isExpanded = select.getAttribute('aria-expanded') === 'true';
  
  // 비활성화된 상태면 무시
  if (select.classList.contains('select-custom--disabled')) {
    return;
  }
  
  if (isExpanded) {
    closeDropdown(select);
  } else {
    // 다른 모든 드롭다운 닫기
    closeAllDropdowns();
    
    // 현재 드롭다운 열기
    select.setAttribute('aria-expanded', 'true');
    
    // 옵션 목록 위치 조정 (아래 공간이 부족하면 위로 표시)
    positionDropdown(select);
  }
}

// 모든 드롭다운 닫기
function closeAllDropdowns() {
  const openDropdowns = document.querySelectorAll('.select-custom[aria-expanded="true"]');
  openDropdowns.forEach(dropdown => {
    closeDropdown(dropdown);
  });
}

// 특정 드롭다운 닫기
function closeDropdown(select) {
  select.setAttribute('aria-expanded', 'false');
}

// 드롭다운 위치 조정
function positionDropdown(select) {
  const options = select.querySelector('.select-custom__options');
  if (!options) return;
  
  // 기본 위치 초기화
  options.style.bottom = 'auto';
  options.style.top = 'calc(100% + 5px)';
  
  // 뷰포트에서의 위치 확인
  const selectRect = select.getBoundingClientRect();
  const optionsHeight = options.offsetHeight;
  const viewportHeight = window.innerHeight;
  
  // 아래쪽 공간이 부족하면 위로 표시
  if (selectRect.bottom + optionsHeight > viewportHeight && selectRect.top > optionsHeight) {
    options.style.top = 'auto';
    options.style.bottom = 'calc(100% + 5px)';
  }
}

// 옵션 선택
function selectOption(select, option) {
  const selected = select.querySelector('.select-custom__selected');
  const hiddenInput = select.querySelector('input[type="hidden"]');
  const value = option.dataset.value;
  const text = option.textContent.trim();
  
  // 이미 선택된 옵션 상태 제거
  const allOptions = select.querySelectorAll('.select-custom__option');
  allOptions.forEach(opt => {
    opt.classList.remove('select-custom__option--selected');
    opt.setAttribute('aria-selected', 'false');
  });
  
  // 선택된 옵션 상태 추가
  option.classList.add('select-custom__option--selected');
  option.setAttribute('aria-selected', 'true');
  
  // 선택된 텍스트 업데이트
  if (selected) {
    selected.textContent = text;
  }
  
  // 히든 인풋 값 업데이트
  if (hiddenInput) {
    hiddenInput.value = value;
    
    // 변경 이벤트 트리거
    const changeEvent = new Event('change', { bubbles: true });
    hiddenInput.dispatchEvent(changeEvent);
  }
  
  // 드롭다운 닫기
  closeDropdown(select);
}

// 다중 선택 옵션 선택/해제
function selectMultipleOption(select, option, closeAfterSelect = false) {
  const tagsContainer = select.querySelector('.select-custom__tags');
  const nativeSelect = select.querySelector('select[multiple]');
  const value = option.dataset.value;
  const text = option.textContent.trim();
  
  // 옵션 선택 상태 토글
  if (option.classList.contains('select-custom__option--selected')) {
    // 선택 해제
    option.classList.remove('select-custom__option--selected');
    option.setAttribute('aria-selected', 'false');
    
    // 태그 제거
    removeTag(select, value);
  } else {
    // 선택
    option.classList.add('select-custom__option--selected');
    option.setAttribute('aria-selected', 'true');
    
    // 태그 추가
    const tag = document.createElement('div');
    tag.className = 'select-custom__tag';
    tag.dataset.value = value;
    tag.innerHTML = `
      ${text}
      <span class="tag-remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </span>
    `;
    
    // 태그 삭제 버튼 이벤트 추가
    const removeButton = tag.querySelector('.tag-remove');
    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      removeTag(select, value);
    });
    
    tagsContainer.appendChild(tag);
  }
  
  // 네이티브 셀렉트 옵션 업데이트
  if (nativeSelect) {
    const nativeOption = Array.from(nativeSelect.options).find(opt => opt.value === value);
    if (nativeOption) {
      nativeOption.selected = option.classList.contains('select-custom__option--selected');
      
      // 변경 이벤트 트리거
      const changeEvent = new Event('change', { bubbles: true });
      nativeSelect.dispatchEvent(changeEvent);
    }
  }
  
  // 필요한 경우 드롭다운 닫기
  if (closeAfterSelect) {
    closeDropdown(select);
  }
}

// 태그 제거
function removeTag(select, value) {
  const tagsContainer = select.querySelector('.select-custom__tags');
  const tag = tagsContainer.querySelector(`.select-custom__tag[data-value="${value}"]`);
  const option = select.querySelector(`.select-custom__option[data-value="${value}"]`);
  const nativeSelect = select.querySelector('select[multiple]');
  
  // 태그 제거
  if (tag) {
    tag.remove();
  }
  
  // 옵션 선택 해제
  if (option) {
    option.classList.remove('select-custom__option--selected');
    option.setAttribute('aria-selected', 'false');
  }
  
  // 네이티브 셀렉트 옵션 업데이트
  if (nativeSelect) {
    const nativeOption = Array.from(nativeSelect.options).find(opt => opt.value === value);
    if (nativeOption) {
      nativeOption.selected = false;
      
      // 변경 이벤트 트리거
      const changeEvent = new Event('change', { bubbles: true });
      nativeSelect.dispatchEvent(changeEvent);
    }
  }
}

// 검색어로 옵션 필터링
function filterOptions(select, query) {
  const options = select.querySelectorAll('.select-custom__option');
  const normalizedQuery = query.toLowerCase().trim();
  
  options.forEach(option => {
    const text = option.textContent.toLowerCase();
    if (text.includes(normalizedQuery)) {
      option.style.display = '';
    } else {
      option.style.display = 'none';
    }
  });
}

// 키보드 이벤트 처리
function handleSelectKeydown(e) {
  const select = e.currentTarget;
  
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      toggleDropdown(select);
      break;
    case 'Escape':
      e.preventDefault();
      closeDropdown(select);
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (select.getAttribute('aria-expanded') === 'true') {
        navigateOptions(select, 'next');
      } else {
        toggleDropdown(select);
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      if (select.getAttribute('aria-expanded') === 'true') {
        navigateOptions(select, 'prev');
      }
      break;
    case 'Tab':
      closeDropdown(select);
      break;
  }
}

// 키보드로 옵션 탐색
function navigateOptions(select, direction) {
  const options = Array.from(select.querySelectorAll('.select-custom__option:not([style*="display: none"])'));
  if (options.length === 0) return;
  
  const focusedOption = select.querySelector('.select-custom__option:focus');
  let nextIndex = 0;
  
  if (focusedOption) {
    const currentIndex = options.indexOf(focusedOption);
    if (direction === 'next') {
      nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    }
  }
  
  options[nextIndex].focus();
}

// 포커스된 옵션 선택
function selectFocusedOption(select) {
  const focusedOption = select.querySelector('.select-custom__option:focus');
  if (focusedOption) {
    if (select.classList.contains('select-custom--multiple')) {
      selectMultipleOption(select, focusedOption);
    } else {
      selectOption(select, focusedOption);
    }
  }
}

// DOM 변경 감지하여 새로 추가된 셀렉트 요소 초기화
function observeNewSelectElements() {
  const observer = new MutationObserver((mutations) => {
    let shouldInit = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element 노드인 경우
            // 새로 추가된 셀렉트 요소 확인
            if (
              node.classList && (
                node.classList.contains('select-native') ||
                node.classList.contains('select-custom')
              )
            ) {
              shouldInit = true;
            } else if (node.querySelectorAll) {
              // 새로 추가된 요소 내부의 셀렉트 요소 확인
              const hasSelects = node.querySelectorAll('.select-native, .select-custom').length > 0;
              if (hasSelects) shouldInit = true;
            }
          }
        });
      }
    });
    
    if (shouldInit) {
      initSelects();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 새 셀렉트 요소 생성
function createSelect(options = {}) {
  const {
    type = 'native', // 'native', 'custom', 'searchable', 'multiple'
    id = `select-${Date.now()}`,
    label = '셀렉트',
    labelId = `${id}-label`,
    placeholder = '옵션을 선택하세요',
    options: selectOptions = [], // { value, text, selected, disabled }
    required = false,
    disabled = false,
    size = '', // 'small', '', 'large'
  } = options;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'form-group';
  
  // 레이블 생성
  const labelElement = document.createElement('label');
  labelElement.id = labelId;
  labelElement.setAttribute('for', type === 'native' ? id : null);
  labelElement.textContent = label;
  
  if (required) {
    const requiredMark = document.createElement('span');
    requiredMark.className = 'required-mark';
    requiredMark.textContent = '*';
    labelElement.appendChild(requiredMark);
  }
  
  wrapper.appendChild(labelElement);
  
  // 셀렉트 요소 생성
  if (type === 'native') {
    // 네이티브 셀렉트
    const select = document.createElement('select');
    select.id = id;
    select.className = 'select-native';
    
    if (required) select.required = true;
    if (disabled) select.disabled = true;
    
    // 기본 옵션 추가
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);
    
    // 선택 옵션 추가
    selectOptions.forEach(optionData => {
      const option = document.createElement('option');
      option.value = optionData.value;
      option.textContent = optionData.text;
      if (optionData.disabled) option.disabled = true;
      if (optionData.selected) option.selected = true;
      select.appendChild(option);
    });
    
    wrapper.appendChild(select);
    
    // 유효성 검사 메시지 영역
    if (required) {
      const validationMessage = document.createElement('div');
      validationMessage.className = 'validation-message';
      validationMessage.setAttribute('aria-live', 'polite');
      wrapper.appendChild(validationMessage);
    }
  } else {
    // 커스텀 셀렉트
    const customClassModifier = size ? ` select-custom--${size}` : '';
    const customTypeModifier = type !== 'custom' ? ` select-custom--${type}` : '';
    const disabledModifier = disabled ? ' select-custom--disabled' : '';
    
    const select = document.createElement('div');
    select.className = `select-custom${customClassModifier}${customTypeModifier}${disabledModifier}`;
    select.tabIndex = disabled ? -1 : 0;
    select.setAttribute('aria-labelledby', labelId);
    select.setAttribute('role', 'combobox');
    select.setAttribute('aria-haspopup', 'listbox');
    select.setAttribute('aria-expanded', 'false');
    
    // 선택된 값 영역 생성
    const selectedArea = document.createElement('div');
    selectedArea.className = 'select-custom__selected';
    
    if (type === 'multiple') {
      // 다중 선택인 경우 태그 컨테이너와 검색 입력란 추가
      const tagsContainer = document.createElement('div');
      tagsContainer.className = 'select-custom__tags';
      selectedArea.appendChild(tagsContainer);
      
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'select-custom__search';
      searchInput.placeholder = placeholder;
      searchInput.setAttribute('aria-labelledby', labelId);
      selectedArea.appendChild(searchInput);
    } else if (type === 'searchable') {
      // 검색 가능한 경우 검색 입력란 추가
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.className = 'select-custom__search';
      searchInput.placeholder = placeholder;
      searchInput.setAttribute('aria-labelledby', labelId);
      selectedArea.appendChild(searchInput);
    } else {
      // 기본 커스텀 셀렉트
      selectedArea.textContent = placeholder;
    }
    
    select.appendChild(selectedArea);
    
    // 아이콘 추가
    const iconContainer = document.createElement('div');
    iconContainer.className = 'select-custom__icon';
    
    const iconSize = size === 'small' ? 14 : (size === 'large' ? 18 : 16);
    iconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    
    select.appendChild(iconContainer);
    
    // 옵션 목록 생성
    const optionsList = document.createElement('ul');
    optionsList.className = 'select-custom__options';
    optionsList.setAttribute('role', 'listbox');
    optionsList.setAttribute('aria-labelledby', labelId);
    
    if (type === 'multiple') {
      optionsList.setAttribute('aria-multiselectable', 'true');
    }
    
    // 옵션 추가
    selectOptions.forEach(optionData => {
      const option = document.createElement('li');
      option.className = 'select-custom__option';
      option.setAttribute('role', 'option');
      option.dataset.value = optionData.value;
      option.tabIndex = -1;
      
      if (optionData.disabled) {
        option.classList.add('select-custom__option--disabled');
        option.setAttribute('aria-disabled', 'true');
      }
      
      if (optionData.selected) {
        option.classList.add('select-custom__option--selected');
        option.setAttribute('aria-selected', 'true');
      }
      
      if (type === 'multiple') {
        // 다중 선택인 경우 체크박스 추가
        const checkbox = document.createElement('span');
        checkbox.className = 'select-custom__checkbox';
        option.appendChild(checkbox);
      }
      
      option.appendChild(document.createTextNode(optionData.text));
      optionsList.appendChild(option);
    });
    
    select.appendChild(optionsList);
    
    // 히든 인풋 또는 네이티브 셀렉트 추가
    if (type === 'multiple') {
      const nativeSelect = document.createElement('select');
      nativeSelect.name = id;
      nativeSelect.multiple = true;
      nativeSelect.hidden = true;
      
      selectOptions.forEach(optionData => {
        const option = document.createElement('option');
        option.value = optionData.value;
        option.textContent = optionData.text;
        if (optionData.selected) option.selected = true;
        nativeSelect.appendChild(option);
      });
      
      select.appendChild(nativeSelect);
    } else {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = id;
      
      if (selectOptions.some(opt => opt.selected)) {
        const selectedOption = selectOptions.find(opt => opt.selected);
        hiddenInput.value = selectedOption.value;
      } else {
        hiddenInput.value = '';
      }
      
      select.appendChild(hiddenInput);
    }
    
    wrapper.appendChild(select);
  }
  
  return wrapper;
}

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initSelects);

// 모듈 내보내기
export {
  initSelects,
  createSelect
}; 