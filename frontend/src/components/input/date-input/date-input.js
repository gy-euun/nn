(function() {
  'use strict';

  // 날짜 포맷 헬퍼 함수
  function formatDate(date, format = 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }
  
  // 문자열 날짜를 JavaScript Date 객체로 변환
  function parseDate(dateString) {
    if (!dateString) return null;
    
    // YYYY-MM-DD 형식 확인
    const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = dateString.match(regex);
    
    if (!match) return null;
    
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-11 매핑
    const day = parseInt(match[3], 10);
    
    const date = new Date(year, month, day);
    
    // 유효한 날짜인지 확인
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return null; // 유효하지 않은 날짜
    }
    
    return date;
  }
  
  // 날짜가 같은지 비교
  function isSameDay(date1, date2) {
    if (!date1 || !date2) return false;
    
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  // 날짜가 범위에 포함되는지 확인
  function isDateInRange(date, startDate, endDate) {
    if (!date || !startDate || !endDate) return false;
    
    return date >= startDate && date <= endDate;
  }
  
  // 달력 생성
  function createCalendar(year, month, selectedDate = null, startDate = null, endDate = null) {
    const calendar = document.createElement('div');
    calendar.className = 'krds-calendar';
    
    // 달력 헤더
    const calendarHeader = document.createElement('div');
    calendarHeader.className = 'krds-calendar-header';
    
    const prevMonthBtn = document.createElement('button');
    prevMonthBtn.type = 'button';
    prevMonthBtn.className = 'krds-calendar-nav-btn prev-month';
    prevMonthBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;
    prevMonthBtn.addEventListener('click', function() {
      const newMonth = month - 1;
      const newYear = year;
      
      if (newMonth < 0) {
        renderCalendar(calendar.parentNode, newYear - 1, 11, selectedDate, startDate, endDate);
      } else {
        renderCalendar(calendar.parentNode, newYear, newMonth, selectedDate, startDate, endDate);
      }
    });
    
    const calendarTitle = document.createElement('span');
    calendarTitle.className = 'krds-calendar-title';
    calendarTitle.textContent = `${year}년 ${month + 1}월`;
    
    const nextMonthBtn = document.createElement('button');
    nextMonthBtn.type = 'button';
    nextMonthBtn.className = 'krds-calendar-nav-btn next-month';
    nextMonthBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    `;
    nextMonthBtn.addEventListener('click', function() {
      const newMonth = month + 1;
      const newYear = year;
      
      if (newMonth > 11) {
        renderCalendar(calendar.parentNode, newYear + 1, 0, selectedDate, startDate, endDate);
      } else {
        renderCalendar(calendar.parentNode, newYear, newMonth, selectedDate, startDate, endDate);
      }
    });
    
    calendarHeader.appendChild(prevMonthBtn);
    calendarHeader.appendChild(calendarTitle);
    calendarHeader.appendChild(nextMonthBtn);
    calendar.appendChild(calendarHeader);
    
    // 요일 헤더
    const weekdaysContainer = document.createElement('div');
    weekdaysContainer.className = 'krds-calendar-weekdays';
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(weekday => {
      const weekdayElement = document.createElement('div');
      weekdayElement.className = 'krds-calendar-weekday';
      weekdayElement.textContent = weekday;
      weekdaysContainer.appendChild(weekdayElement);
    });
    
    calendar.appendChild(weekdaysContainer);
    
    // 날짜 계산
    const daysContainer = document.createElement('div');
    daysContainer.className = 'krds-calendar-days';
    
    // 현재 월의 첫 날
    const firstDayOfMonth = new Date(year, month, 1);
    // 현재 월의 마지막 날
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 이전 월의 마지막 날
    const lastDayOfPrevMonth = new Date(year, month, 0);
    
    // 첫째 주 이전 월의 날짜 채우기
    const firstWeekday = firstDayOfMonth.getDay(); // 0: 일요일, 6: 토요일
    
    for (let i = firstWeekday - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth.getDate() - i;
      const date = new Date(year, month - 1, day);
      
      const dayElement = createDayElement(
        day,
        date,
        true, // 이전 월 날짜는 비활성화
        false,
        selectedDate,
        startDate,
        endDate
      );
      
      daysContainer.appendChild(dayElement);
    }
    
    // 현재 월 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const isToday = isSameDay(date, today);
      
      const dayElement = createDayElement(
        day,
        date,
        false,
        isToday,
        selectedDate,
        startDate,
        endDate
      );
      
      daysContainer.appendChild(dayElement);
    }
    
    // 마지막 주 다음 월의 날짜 채우기
    const lastWeekday = lastDayOfMonth.getDay(); // 0: 일요일, 6: 토요일
    
    for (let i = 1; i < 7 - lastWeekday; i++) {
      const date = new Date(year, month + 1, i);
      
      const dayElement = createDayElement(
        i,
        date,
        true, // 다음 월 날짜는 비활성화
        false,
        selectedDate,
        startDate,
        endDate
      );
      
      daysContainer.appendChild(dayElement);
    }
    
    calendar.appendChild(daysContainer);
    
    // 달력 푸터
    const calendarFooter = document.createElement('div');
    calendarFooter.className = 'krds-calendar-footer';
    
    const todayBtn = document.createElement('button');
    todayBtn.type = 'button';
    todayBtn.className = 'krds-calendar-today-btn';
    todayBtn.textContent = '오늘';
    todayBtn.addEventListener('click', function() {
      const today = new Date();
      const input = calendar.closest('.krds-calendar-popup').dataset.targetInput;
      const inputElement = document.getElementById(input);
      
      if (inputElement) {
        inputElement.value = formatDate(today);
        hideCalendar();
        
        // 유효성 검사 상태 업데이트
        updateValidationState(inputElement);
        
        // 변경 이벤트 트리거
        triggerChangeEvent(inputElement);
      }
    });
    
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'krds-calendar-clear-btn';
    clearBtn.textContent = '지우기';
    clearBtn.addEventListener('click', function() {
      const input = calendar.closest('.krds-calendar-popup').dataset.targetInput;
      const inputElement = document.getElementById(input);
      
      if (inputElement) {
        inputElement.value = '';
        hideCalendar();
        
        // 유효성 검사 상태 업데이트
        updateValidationState(inputElement);
        
        // 변경 이벤트 트리거
        triggerChangeEvent(inputElement);
      }
    });
    
    calendarFooter.appendChild(todayBtn);
    calendarFooter.appendChild(clearBtn);
    calendar.appendChild(calendarFooter);
    
    return calendar;
  }
  
  // 날짜 요소 생성
  function createDayElement(day, date, isDisabled, isToday, selectedDate, startDate, endDate) {
    const dayElement = document.createElement('button');
    dayElement.type = 'button';
    dayElement.className = 'krds-calendar-day';
    dayElement.textContent = day;
    
    // 비활성화 날짜
    if (isDisabled) {
      dayElement.classList.add('disabled');
      return dayElement;
    }
    
    // 오늘 날짜
    if (isToday) {
      dayElement.classList.add('today');
    }
    
    // 선택된 날짜 (단일 선택)
    if (selectedDate && isSameDay(date, selectedDate)) {
      dayElement.classList.add('selected');
    }
    
    // 날짜 범위 선택
    if (startDate && endDate) {
      // 시작 날짜
      if (isSameDay(date, startDate)) {
        dayElement.classList.add('start-date');
      }
      
      // 종료 날짜
      if (isSameDay(date, endDate)) {
        dayElement.classList.add('end-date');
      }
      
      // 범위 내 날짜
      if (isDateInRange(date, startDate, endDate) && 
          !isSameDay(date, startDate) &&
          !isSameDay(date, endDate)) {
        dayElement.classList.add('in-range');
      }
    }
    
    // 클릭 이벤트
    dayElement.addEventListener('click', function() {
      const calendarPopup = dayElement.closest('.krds-calendar-popup');
      const input = calendarPopup.dataset.targetInput;
      const inputElement = document.getElementById(input);
      
      if (!inputElement) return;
      
      // 날짜 범위 선택인 경우
      if (calendarPopup.classList.contains('range-calendar')) {
        handleRangeSelection(inputElement, date);
      } else {
        // 단일 날짜 선택
        inputElement.value = formatDate(date);
        hideCalendar();
        
        // 유효성 검사 상태 업데이트
        updateValidationState(inputElement);
        
        // 변경 이벤트 트리거
        triggerChangeEvent(inputElement);
      }
    });
    
    return dayElement;
  }
  
  // 달력 렌더링
  function renderCalendar(container, year, month, selectedDate, startDate, endDate) {
    container.innerHTML = '';
    const calendar = createCalendar(year, month, selectedDate, startDate, endDate);
    container.appendChild(calendar);
  }
  
  // 범위 선택 처리
  function handleRangeSelection(inputElement, date) {
    // 시작 날짜와 종료 날짜 입력 필드 찾기
    const rangeWrapper = inputElement.closest('.krds-date-range-wrapper');
    
    if (!rangeWrapper) return;
    
    const startInput = rangeWrapper.querySelector('#date-range-start');
    const endInput = rangeWrapper.querySelector('#date-range-end');
    
    if (!startInput || !endInput) return;
    
    // 시작 날짜 또는 종료 날짜를 설정
    if (inputElement.id === 'date-range-start') {
      startInput.value = formatDate(date);
      
      // 종료 날짜가 이미 설정되어 있고 시작 날짜보다 이전인 경우 초기화
      const endDate = parseDate(endInput.value);
      if (endDate && date > endDate) {
        endInput.value = '';
      }
      
      // 다음으로 종료 날짜를 선택하도록 포커스 변경
      if (endInput.value === '') {
        hideCalendar();
        setTimeout(() => endInput.click(), 100);
      } else {
        hideCalendar();
      }
    } else if (inputElement.id === 'date-range-end') {
      // 시작 날짜가 설정되어 있지 않으면 시작 날짜부터 설정하도록 함
      if (startInput.value === '') {
        startInput.value = formatDate(date);
        hideCalendar();
        setTimeout(() => endInput.click(), 100);
        return;
      }
      
      const startDate = parseDate(startInput.value);
      
      // 선택한 날짜가 시작 날짜보다 이전이면 시작 날짜로 설정하고 현재 시작 날짜를 종료 날짜로 설정
      if (date < startDate) {
        endInput.value = startInput.value;
        startInput.value = formatDate(date);
      } else {
        endInput.value = formatDate(date);
      }
      
      hideCalendar();
    }
    
    // 유효성 검사 상태 업데이트
    updateValidationState(startInput);
    updateValidationState(endInput);
    
    // 변경 이벤트 트리거
    triggerChangeEvent(startInput);
    triggerChangeEvent(endInput);
  }
  
  // 날짜 입력 필드 초기화
  function initDateInputs() {
    const dateInputs = document.querySelectorAll('.krds-date-input');
    
    dateInputs.forEach(input => {
      // 이미 초기화된 경우 건너뛰기
      if (input.dataset.initialized === 'true') return;
      
      // 달력 표시 이벤트
      input.addEventListener('click', function() {
        showCalendar(input);
      });
      
      // 키보드 이벤트
      input.addEventListener('keydown', function(e) {
        // Escape 키로 달력 닫기
        if (e.key === 'Escape') {
          hideCalendar();
        }
      });
      
      // 초기화 완료 표시
      input.dataset.initialized = 'true';
    });
    
    // 외부 클릭 시 달력 닫기
    document.addEventListener('click', function(e) {
      const calendarPopup = document.querySelector('.krds-calendar-popup');
      if (!calendarPopup) return;
      
      // 달력 또는 입력 필드 외부 클릭 시 달력 닫기
      if (
        !e.target.closest('.krds-calendar-popup') &&
        !e.target.classList.contains('krds-date-input') &&
        !e.target.closest('.krds-date-input-wrapper')
      ) {
        hideCalendar();
      }
    });
    
    // API 예제 버튼 초기화
    initApiButtons();
    
    // DOM 변경 감지를 위한 옵저버 설정
    observeNewDateInputs();
  }
  
  // 달력 표시
  function showCalendar(input) {
    // 비활성화된 입력 필드는 처리 안함
    if (input.disabled) return;
    
    // 기존 달력 닫기
    hideCalendar();
    
    // 입력 필드의 값이 있으면 해당 날짜로 달력 표시, 없으면 현재 날짜
    const inputDate = parseDate(input.value);
    const today = new Date();
    const date = inputDate || today;
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 날짜 범위 정보 가져오기
    let startDate = null;
    let endDate = null;
    
    const rangeWrapper = input.closest('.krds-date-range-wrapper');
    if (rangeWrapper) {
      const startInput = rangeWrapper.querySelector('#date-range-start');
      const endInput = rangeWrapper.querySelector('#date-range-end');
      
      if (startInput && endInput) {
        startDate = parseDate(startInput.value);
        endDate = parseDate(endInput.value);
      }
    }
    
    // 달력 팝업 생성
    const calendarPopup = document.createElement('div');
    calendarPopup.className = 'krds-calendar-popup';
    calendarPopup.dataset.targetInput = input.id;
    
    // 날짜 범위 선택인 경우 클래스 추가
    if (rangeWrapper) {
      calendarPopup.classList.add('range-calendar');
    }
    
    // 달력 렌더링
    renderCalendar(calendarPopup, year, month, inputDate, startDate, endDate);
    
    // 입력 필드 아래에 달력 위치 조정
    const inputRect = input.getBoundingClientRect();
    calendarPopup.style.position = 'absolute';
    calendarPopup.style.top = `${inputRect.bottom + window.scrollY + 5}px`;
    calendarPopup.style.left = `${inputRect.left + window.scrollX}px`;
    calendarPopup.style.zIndex = '1000';
    
    // 달력 추가
    document.body.appendChild(calendarPopup);
    
    // 포커스 상태 클래스 추가
    input.closest('.krds-date-input-wrapper').classList.add('focus');
  }
  
  // 달력 숨기기
  function hideCalendar() {
    const calendarPopup = document.querySelector('.krds-calendar-popup');
    if (calendarPopup) {
      document.body.removeChild(calendarPopup);
    }
    
    // 모든 입력 필드에서 포커스 상태 클래스 제거
    document.querySelectorAll('.krds-date-input-wrapper.focus').forEach(wrapper => {
      wrapper.classList.remove('focus');
    });
  }
  
  // API 예제 버튼 초기화
  function initApiButtons() {
    // 오늘 날짜 설정 버튼
    const setDateButtons = document.querySelectorAll('.btn-set-date');
    setDateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          const today = new Date();
          input.value = formatDate(today);
          
          // 유효성 검사 상태 업데이트
          updateValidationState(input);
          
          // 변경 이벤트 트리거
          triggerChangeEvent(input);
        }
      });
    });
    
    // 날짜 지우기 버튼
    const clearDateButtons = document.querySelectorAll('.btn-clear-date');
    clearDateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          input.value = '';
          
          // 유효성 검사 상태 업데이트
          updateValidationState(input);
          
          // 변경 이벤트 트리거
          triggerChangeEvent(input);
        }
      });
    });
    
    // 비활성화 토글 버튼
    const toggleDisableButtons = document.querySelectorAll('.btn-toggle-disable');
    toggleDisableButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          input.disabled = !input.disabled;
          this.textContent = input.disabled ? '활성화하기' : '비활성화하기';
        }
      });
    });
    
    // 유효성 검사 버튼
    const validateButtons = document.querySelectorAll('.btn-validate');
    validateButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input) {
          validateDateInput(input);
        }
      });
    });
  }
  
  // 유효성 검사
  function validateDateInput(input) {
    const dateValue = input.value.trim();
    
    if (!dateValue) {
      updateValidationState(input, false, '날짜를 선택해 주세요.');
      return false;
    }
    
    const date = parseDate(dateValue);
    
    if (!date) {
      updateValidationState(input, false, '유효하지 않은 날짜 형식입니다.');
      return false;
    }
    
    updateValidationState(input, true, '유효한 날짜입니다.');
    return true;
  }
  
  // 유효성 검사 상태 업데이트
  function updateValidationState(input, isValid, message) {
    // 이전 상태 클래스 제거
    input.classList.remove('is-valid', 'is-invalid');
    
    // 명시적인 유효성 상태가 지정되지 않은 경우 기존 상태 유지
    if (typeof isValid === 'undefined') return;
    
    // 피드백 요소 찾기
    const formGroup = input.closest('.krds-form-group');
    let feedback = formGroup ? formGroup.querySelector('.krds-date-input-feedback') : null;
    
    // 피드백 요소가 없으면 생성
    if (!feedback && formGroup && message) {
      feedback = document.createElement('div');
      feedback.className = 'krds-date-input-feedback';
      formGroup.appendChild(feedback);
    }
    
    if (feedback && message) {
      // 유효성 상태에 따라 클래스 및 메시지 설정
      if (isValid) {
        input.classList.add('is-valid');
        feedback.className = 'krds-date-input-feedback valid';
        feedback.textContent = message;
      } else {
        input.classList.add('is-invalid');
        feedback.className = 'krds-date-input-feedback invalid';
        feedback.textContent = message;
      }
    }
  }
  
  // 변경 이벤트 트리거
  function triggerChangeEvent(input) {
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  }
  
  // DOM 변경 감지를 위한 옵저버 설정
  function observeNewDateInputs() {
    // MutationObserver가 지원되는지 확인
    if (!window.MutationObserver) {
      return;
    }
    
    // DOM 변경 감지를 위한 옵저버 생성
    const observer = new MutationObserver(function(mutations) {
      let shouldInit = false;
      
      // 추가된 노드 확인
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          // 추가된 각 노드 확인
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            
            // 노드가 엘리먼트인지 확인
            if (node.nodeType === 1) {
              // 노드가 날짜 입력 필드이거나 날짜 입력 필드를 포함하는지 확인
              if (node.classList && node.classList.contains('krds-date-input') || 
                  node.querySelector && node.querySelector('.krds-date-input')) {
                shouldInit = true;
                break;
              }
            }
          }
        }
      });
      
      // 새로운 날짜 입력 필드가 추가된 경우 초기화
      if (shouldInit) {
        initDateInputs();
      }
    });
    
    // 옵저버 설정 및 시작
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 새 날짜 입력 필드 생성 함수
  function createDateInput(options = {}) {
    const defaults = {
      id: 'date-input-' + Date.now(),
      label: '',
      description: '',
      placeholder: 'YYYY-MM-DD',
      size: 'default', // 'small', 'default', 'large'
      disabled: false,
      required: false,
      value: '',
      isValid: null, // true, false, null (검증 상태 없음)
      validationMessage: ''
    };
    
    // 기본 옵션과 사용자 옵션 병합
    const settings = { ...defaults, ...options };
    
    // 폼 그룹 생성
    const formGroup = document.createElement('div');
    formGroup.className = 'krds-form-group';
    
    // 라벨 생성
    if (settings.label) {
      const label = document.createElement('label');
      label.htmlFor = settings.id;
      label.className = 'krds-label';
      if (settings.required) {
        label.classList.add('required');
      }
      label.textContent = settings.label;
      formGroup.appendChild(label);
    }
    
    // 입력 필드 래퍼 생성
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'krds-date-input-wrapper';
    
    // 입력 필드 생성
    const input = document.createElement('input');
    input.type = 'text';
    input.id = settings.id;
    input.className = 'krds-date-input';
    
    // 크기 설정
    if (settings.size === 'small') {
      input.classList.add('krds-date-input-sm');
    } else if (settings.size === 'large') {
      input.classList.add('krds-date-input-lg');
    }
    
    input.placeholder = settings.placeholder;
    input.readOnly = true;
    
    if (settings.disabled) {
      input.disabled = true;
    }
    
    if (settings.required) {
      input.required = true;
    }
    
    if (settings.value) {
      input.value = settings.value;
    }
    
    // 유효성 상태 설정
    if (settings.isValid === true) {
      input.classList.add('is-valid');
    } else if (settings.isValid === false) {
      input.classList.add('is-invalid');
    }
    
    inputWrapper.appendChild(input);
    
    // 아이콘 추가
    const icon = document.createElement('span');
    icon.className = 'krds-date-input-icon';
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    `;
    inputWrapper.appendChild(icon);
    
    formGroup.appendChild(inputWrapper);
    
    // 설명 텍스트 추가
    if (settings.description) {
      const description = document.createElement('div');
      description.className = 'krds-date-input-description';
      description.textContent = settings.description;
      formGroup.appendChild(description);
    }
    
    // 유효성 피드백 메시지 추가
    if (settings.validationMessage && (settings.isValid === true || settings.isValid === false)) {
      const feedback = document.createElement('div');
      feedback.className = `krds-date-input-feedback ${settings.isValid ? 'valid' : 'invalid'}`;
      feedback.textContent = settings.validationMessage;
      formGroup.appendChild(feedback);
    }
    
    // 날짜 입력 필드 초기화 (이벤트 리스너 등)
    setTimeout(() => {
      initDateInputs();
    }, 0);
    
    return formGroup;
  }
  
  // 페이지 로드 시 초기화
  document.addEventListener('DOMContentLoaded', initDateInputs);
  
  // 외부 사용을 위한 함수 내보내기
  window.KRDS = window.KRDS || {};
  window.KRDS.DateInput = {
    init: initDateInputs,
    show: showCalendar,
    hide: hideCalendar,
    validate: validateDateInput,
    create: createDateInput,
    format: formatDate,
    parse: parseDate
  };
})(); 