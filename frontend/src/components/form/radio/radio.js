/**
 * KRDS 라디오 버튼 컴포넌트
 * 
 * 라디오 버튼 그룹과 관련된 기능을 초기화하고 관리합니다.
 */

// 라디오 버튼 컴포넌트 초기화
function initRadioButtons() {
  const radioGroups = getRadioGroups();
  
  if (!radioGroups.length) return;
  
  radioGroups.forEach(group => {
    setupRadioGroupEvents(group);
    setupInitialState(group);
  });
  
  // 필수 항목인 라디오 그룹에 대한 유효성 검사 설정
  setupRequiredValidation();
}

/**
 * 페이지 내 라디오 버튼 그룹 가져오기
 * @returns {Array} - 라디오 버튼 그룹 배열
 */
function getRadioGroups() {
  const radioAreas = document.querySelectorAll('.krds-check-area');
  const radioGroups = [];
  
  radioAreas.forEach(area => {
    // 동일한 name을 가진 라디오 버튼 그룹화
    const inputs = area.querySelectorAll('input[type="radio"]');
    const nameGroups = {};
    
    inputs.forEach(input => {
      const name = input.getAttribute('name');
      if (!name) return;
      
      if (!nameGroups[name]) {
        nameGroups[name] = [];
      }
      
      nameGroups[name].push(input);
    });
    
    // 각 그룹을 배열에 추가
    Object.values(nameGroups).forEach(group => {
      if (group.length > 0) {
        radioGroups.push({
          area,
          inputs: group,
          name: group[0].getAttribute('name')
        });
      }
    });
  });
  
  return radioGroups;
}

/**
 * 라디오 그룹에 이벤트 설정
 * @param {Object} group - 라디오 그룹 객체
 */
function setupRadioGroupEvents(group) {
  group.inputs.forEach(radio => {
    // 변경 이벤트 리스너
    radio.addEventListener('change', (event) => {
      handleRadioChange(event, group);
    });
    
    // 키보드 접근성
    radio.addEventListener('keydown', (event) => {
      handleRadioKeydown(event, group);
    });
  });
}

/**
 * 라디오 그룹의 초기 상태 설정
 * @param {Object} group - 라디오 그룹 객체
 */
function setupInitialState(group) {
  // 선택된 항목 찾기
  const checkedInput = group.inputs.find(input => input.checked);
  
  // 선택된 항목이 있으면 변경 이벤트 트리거
  if (checkedInput) {
    const event = new Event('change');
    checkedInput.dispatchEvent(event);
  }
}

/**
 * 라디오 버튼 변경 이벤트 처리
 * @param {Event} event - 이벤트 객체
 * @param {Object} group - 라디오 그룹 객체
 */
function handleRadioChange(event, group) {
  const currentInput = event.target;
  
  // 변경 이벤트 콜백 실행 (커스텀 이벤트로 전달)
  const customEvent = new CustomEvent('krds:radio:change', {
    detail: {
      name: group.name,
      value: currentInput.value,
      checked: currentInput.checked,
      element: currentInput
    },
    bubbles: true
  });
  
  currentInput.dispatchEvent(customEvent);
  
  // required 유효성 검사 업데이트
  if (currentInput.hasAttribute('required')) {
    validateRadioGroup(group);
  }
}

/**
 * 라디오 버튼 키보드 이벤트 처리 (접근성 강화)
 * @param {KeyboardEvent} event - 키보드 이벤트 객체
 * @param {Object} group - 라디오 그룹 객체
 */
function handleRadioKeydown(event, group) {
  // 방향키 탐색 구현
  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft' || 
      event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    
    event.preventDefault();
    
    const currentIndex = group.inputs.findIndex(input => input === event.target);
    let nextIndex;
    
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      // 이전 항목으로 이동 (순환)
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = group.inputs.length - 1;
    } else {
      // 다음 항목으로 이동 (순환)
      nextIndex = currentIndex + 1;
      if (nextIndex >= group.inputs.length) nextIndex = 0;
    }
    
    // 비활성화된 항목 건너뛰기
    while (group.inputs[nextIndex].disabled) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        nextIndex--;
        if (nextIndex < 0) nextIndex = group.inputs.length - 1;
      } else {
        nextIndex++;
        if (nextIndex >= group.inputs.length) nextIndex = 0;
      }
      
      // 모든 항목이 비활성화된 경우 무한 루프 방지
      if (nextIndex === currentIndex) break;
    }
    
    // 다음 항목 선택 및 포커스
    if (!group.inputs[nextIndex].disabled) {
      group.inputs[nextIndex].checked = true;
      group.inputs[nextIndex].focus();
      group.inputs[nextIndex].dispatchEvent(new Event('change'));
    }
  }
}

/**
 * 필수 라디오 그룹에 대한 유효성 검사 설정
 */
function setupRequiredValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (event) => {
      const radioGroups = getRadioGroups().filter(group => {
        return group.inputs.some(input => input.hasAttribute('required'));
      });
      
      let isValid = true;
      
      // 각 필수 라디오 그룹 검증
      radioGroups.forEach(group => {
        if (!validateRadioGroup(group)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  });
}

/**
 * 라디오 그룹 유효성 검사
 * @param {Object} group - 라디오 그룹 객체
 * @returns {boolean} - 유효성 검사 결과
 */
function validateRadioGroup(group) {
  // 필수 항목이 아니면 항상 유효
  if (!group.inputs.some(input => input.hasAttribute('required'))) {
    return true;
  }
  
  // 선택된 항목이 있는지 확인
  const isChecked = group.inputs.some(input => input.checked);
  
  // 유효성 검사 결과에 따라 클래스 토글
  if (isChecked) {
    group.area.classList.remove('is-invalid');
    group.area.classList.add('is-valid');
    return true;
  } else {
    group.area.classList.remove('is-valid');
    group.area.classList.add('is-invalid');
    return false;
  }
}

/**
 * 라디오 버튼 그룹 생성 함수
 * @param {Object} options - 옵션 객체
 * @returns {HTMLElement} - 생성된 라디오 버튼 그룹 요소
 */
function createRadioGroup(options = {}) {
  const defaults = {
    name: 'radio-group',
    items: [],
    inline: false,
    column: false,
    required: false,
    label: '',
    validationMessage: ''
  };
  
  const settings = { ...defaults, ...options };
  
  // 컨테이너 생성
  const groupContainer = document.createElement('div');
  groupContainer.className = 'form-group';
  
  // 라벨이 있는 경우 추가
  if (settings.label) {
    const labelContainer = document.createElement('div');
    labelContainer.className = 'form-label';
    
    const labelElement = document.createElement('label');
    labelElement.textContent = settings.label;
    
    if (settings.required) {
      labelElement.className = 'required';
    }
    
    labelContainer.appendChild(labelElement);
    groupContainer.appendChild(labelContainer);
  }
  
  // 폼 컨텐츠 컨테이너
  const formConts = document.createElement('div');
  formConts.className = 'form-conts';
  
  // 라디오 버튼 영역
  const checkArea = document.createElement('div');
  checkArea.className = 'krds-check-area';
  
  if (settings.inline) {
    checkArea.classList.add('inline');
  }
  
  if (settings.column) {
    checkArea.classList.add('chk-column');
  }
  
  // 항목 생성
  settings.items.forEach((item, index) => {
    const formCheck = document.createElement('div');
    formCheck.className = 'krds-form-check';
    
    // 라디오 버튼 입력 요소
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = settings.name;
    input.id = `${settings.name}-${index}`;
    input.value = item.value || '';
    
    if (item.checked) {
      input.checked = true;
    }
    
    if (item.disabled) {
      input.disabled = true;
    }
    
    if (settings.required) {
      input.required = true;
    }
    
    // 라벨 요소
    const label = document.createElement('label');
    label.setAttribute('for', input.id);
    label.textContent = item.label || '';
    
    formCheck.appendChild(input);
    formCheck.appendChild(label);
    
    // 부가 설명이 있는 경우
    if (item.description) {
      const cnt = document.createElement('div');
      cnt.className = 'krds-form-check-cnt';
      
      const p = document.createElement('p');
      p.className = 'krds-form-check-p';
      p.textContent = item.description;
      
      cnt.appendChild(p);
      formCheck.appendChild(cnt);
    }
    
    checkArea.appendChild(formCheck);
  });
  
  formConts.appendChild(checkArea);
  
  // 유효성 검사 메시지가 있는 경우
  if (settings.validationMessage) {
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback invalid';
    feedback.textContent = settings.validationMessage;
    formConts.appendChild(feedback);
  }
  
  groupContainer.appendChild(formConts);
  
  return groupContainer;
}

// DOMContentLoaded 이벤트에서 라디오 버튼 초기화
document.addEventListener('DOMContentLoaded', () => {
  initRadioButtons();
});

// 모듈로 내보내기 (필요한 경우)
export {
  initRadioButtons,
  createRadioGroup,
  validateRadioGroup
}; 