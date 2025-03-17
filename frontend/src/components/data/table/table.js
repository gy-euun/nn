/**
 * 테이블 컴포넌트 자바스크립트
 * 정렬, 페이지네이션, 검색 및 선택 기능을 제공합니다.
 */

/**
 * 테이블 초기화 함수
 */
const initTables = () => {
  // 모든 테이블 초기화
  const tables = document.querySelectorAll('.krds-table');
  tables.forEach(table => {
    initSortableColumns(table);
    initSelectAll(table);
    initResponsiveTable(table);
  });

  // 테이블 검색 초기화
  initTableSearch();
  
  // 페이지네이션 초기화
  initTablePagination();
};

/**
 * 정렬 가능한 컬럼 초기화 함수
 * @param {HTMLElement} table - 테이블 요소
 */
const initSortableColumns = (table) => {
  const sortableHeaders = table.querySelectorAll('th.sortable');
  
  sortableHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const sortDirection = header.getAttribute('data-sort-direction') || 'none';
      const sortField = header.getAttribute('data-sort');
      const sortIcon = header.querySelector('.sort-icon');
      
      // 기존 정렬 상태 초기화
      sortableHeaders.forEach(h => {
        if (h !== header) {
          h.setAttribute('data-sort-direction', 'none');
          const icon = h.querySelector('.sort-icon');
          if (icon) icon.textContent = '';
        }
      });
      
      // 정렬 방향 결정
      let newDirection = 'asc';
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = 'none';
      }
      
      // 정렬 아이콘 업데이트
      if (sortIcon) {
        if (newDirection === 'asc') {
          sortIcon.textContent = '↑';
        } else if (newDirection === 'desc') {
          sortIcon.textContent = '↓';
        } else {
          sortIcon.textContent = '';
        }
      }
      
      // 정렬 방향 업데이트
      header.setAttribute('data-sort-direction', newDirection);
      
      // 테이블 정렬 실행
      sortTable(table, sortField, newDirection);
    });
  });
};

/**
 * 테이블 정렬 함수
 * @param {HTMLElement} table - 테이블 요소
 * @param {string} field - 정렬할 필드
 * @param {string} direction - 정렬 방향 ('asc', 'desc', 'none')
 */
const sortTable = (table, field, direction) => {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // 정렬이 'none'이면 원래 순서로 복원
  if (direction === 'none') {
    // 원래 순서로 복원하는 로직 (데이터 속성에 원래 순서를 저장해두어야 함)
    rows.sort((a, b) => {
      return parseInt(a.getAttribute('data-original-index')) - parseInt(b.getAttribute('data-original-index'));
    });
  } else {
    // 첫 정렬 시 원래 순서 저장
    if (!rows[0].hasAttribute('data-original-index')) {
      rows.forEach((row, index) => {
        row.setAttribute('data-original-index', index);
      });
    }
    
    // 정렬 실행
    rows.sort((a, b) => {
      const cellA = a.querySelector(`td:nth-child(${getColumnIndex(table, field)})`);
      const cellB = b.querySelector(`td:nth-child(${getColumnIndex(table, field)})`);
      
      if (!cellA || !cellB) return 0;
      
      let valueA = cellA.textContent.trim();
      let valueB = cellB.textContent.trim();
      
      // 날짜 형식 확인 및 변환
      if (isDate(valueA) && isDate(valueB)) {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }
      // 숫자 형식 확인 및 변환
      else if (isNumeric(valueA) && isNumeric(valueB)) {
        valueA = parseFloat(valueA.replace(/[^\d.-]/g, ''));
        valueB = parseFloat(valueB.replace(/[^\d.-]/g, ''));
      }
      
      // 정렬 방향에 따른 비교
      if (direction === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
  }
  
  // 정렬된 행을 DOM에 다시 추가
  rows.forEach(row => {
    tbody.appendChild(row);
  });
  
  // 정렬 이벤트 발생
  const sortEvent = new CustomEvent('krds-table-sort', {
    bubbles: true,
    detail: { table, field, direction }
  });
  table.dispatchEvent(sortEvent);
};

/**
 * 컬럼 인덱스 가져오기 함수
 * @param {HTMLElement} table - 테이블 요소
 * @param {string} field - 필드명
 * @returns {number} 컬럼 인덱스
 */
const getColumnIndex = (table, field) => {
  const headers = table.querySelectorAll('th');
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].getAttribute('data-sort') === field) {
      return i + 1;
    }
  }
  return 1; // 기본값
};

/**
 * 날짜 형식 확인 함수
 * @param {string} value - 확인할 값
 * @returns {boolean} 날짜 형식 여부
 */
const isDate = (value) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(value) && !isNaN(new Date(value).getTime());
};

/**
 * 숫자 형식 확인 함수
 * @param {string} value - 확인할 값
 * @returns {boolean} 숫자 형식 여부
 */
const isNumeric = (value) => {
  return !isNaN(parseFloat(value.replace(/[^\d.-]/g, ''))) && isFinite(value.replace(/[^\d.-]/g, ''));
};

/**
 * 전체 선택 초기화 함수
 * @param {HTMLElement} table - 테이블 요소
 */
const initSelectAll = (table) => {
  const selectAllCheckbox = table.querySelector('#select-all');
  if (!selectAllCheckbox) return;
  
  const checkboxes = table.querySelectorAll('tbody input[name="select-row"]');
  
  // 전체 선택 체크박스 이벤트
  selectAllCheckbox.addEventListener('change', () => {
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });
    
    // 선택 변경 이벤트 발생
    const selectEvent = new CustomEvent('krds-table-select', {
      bubbles: true,
      detail: { 
        table, 
        selectAll: selectAllCheckbox.checked,
        selectedRows: getSelectedRows(table)
      }
    });
    table.dispatchEvent(selectEvent);
  });
  
  // 개별 체크박스 이벤트
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      // 모든 체크박스가 선택되었는지 확인
      const allChecked = Array.from(checkboxes).every(cb => cb.checked);
      const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
      
      // 전체 선택 체크박스 상태 업데이트
      selectAllCheckbox.checked = allChecked;
      selectAllCheckbox.indeterminate = anyChecked && !allChecked;
      
      // 선택 변경 이벤트 발생
      const selectEvent = new CustomEvent('krds-table-select', {
        bubbles: true,
        detail: { 
          table, 
          selectAll: allChecked,
          selectedRows: getSelectedRows(table)
        }
      });
      table.dispatchEvent(selectEvent);
    });
  });
};

/**
 * 선택된 행 가져오기 함수
 * @param {HTMLElement} table - 테이블 요소
 * @returns {Array} 선택된 행 배열
 */
const getSelectedRows = (table) => {
  const checkboxes = table.querySelectorAll('tbody input[name="select-row"]:checked');
  return Array.from(checkboxes).map(checkbox => checkbox.closest('tr'));
};

/**
 * 반응형 테이블 초기화 함수
 * @param {HTMLElement} table - 테이블 요소
 */
const initResponsiveTable = (table) => {
  // 모바일 환경에서 테이블을 반응형으로 변경
  if (window.innerWidth <= 768 && table.classList.contains('krds-table-complex')) {
    const headers = table.querySelectorAll('thead th');
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        if (index < headers.length) {
          const headerText = headers[index].textContent.trim();
          cell.setAttribute('data-label', headerText);
        }
      });
    });
  }
};

/**
 * 테이블 검색 초기화 함수
 */
const initTableSearch = () => {
  const searchInputs = document.querySelectorAll('.krds-table-search .krds-search-input');
  searchInputs.forEach(input => {
    const searchButton = input.nextElementSibling;
    const table = input.closest('.table-container').querySelector('.krds-table');
    
    if (!table) return;
    
    // 검색 버튼 클릭 이벤트
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        searchTable(table, input.value);
      });
    }
    
    // 엔터 키 이벤트
    input.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        searchTable(table, input.value);
      }
    });
  });
};

/**
 * 테이블 검색 함수
 * @param {HTMLElement} table - 테이블 요소
 * @param {string} query - 검색어
 */
const searchTable = (table, query) => {
  const rows = table.querySelectorAll('tbody tr');
  const term = query.toLowerCase().trim();
  
  // 빈 검색어인 경우 모든 행 표시
  if (term === '') {
    rows.forEach(row => {
      row.style.display = '';
    });
    return;
  }
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(term)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
  
  // 검색 이벤트 발생
  const searchEvent = new CustomEvent('krds-table-search', {
    bubbles: true,
    detail: { table, query }
  });
  table.dispatchEvent(searchEvent);
};

/**
 * 테이블 페이지네이션 초기화 함수
 */
const initTablePagination = () => {
  const paginationContainers = document.querySelectorAll('.krds-table-pagination');
  paginationContainers.forEach(container => {
    const table = container.closest('.table-container').querySelector('.krds-table');
    if (!table) return;
    
    const pagination = container.querySelector('.krds-pagination');
    if (!pagination) return;
    
    const firstBtn = pagination.querySelector('.krds-pagination-first');
    const prevBtn = pagination.querySelector('.krds-pagination-prev');
    const nextBtn = pagination.querySelector('.krds-pagination-next');
    const lastBtn = pagination.querySelector('.krds-pagination-last');
    const pageLinks = pagination.querySelectorAll('.krds-pagination-link');
    
    // 페이지 링크 클릭 이벤트
    pageLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        
        // 현재 활성화된 페이지 링크 비활성화
        const activePage = pagination.querySelector('.krds-pagination-active');
        if (activePage) {
          activePage.classList.remove('krds-pagination-active');
        }
        
        // 클릭된 페이지 링크 활성화
        link.classList.add('krds-pagination-active');
        
        // 페이지 변경 이벤트 발생
        const page = parseInt(link.textContent);
        const pageEvent = new CustomEvent('krds-table-page', {
          bubbles: true,
          detail: { table, page }
        });
        table.dispatchEvent(pageEvent);
      });
    });
    
    // 네비게이션 버튼 이벤트
    if (firstBtn) {
      firstBtn.addEventListener('click', () => {
        const firstPageLink = pagination.querySelector('.krds-pagination-link');
        if (firstPageLink) {
          firstPageLink.click();
        }
      });
    }
    
    if (lastBtn) {
      lastBtn.addEventListener('click', () => {
        const pageLinks = pagination.querySelectorAll('.krds-pagination-link');
        const lastPageLink = pageLinks[pageLinks.length - 1];
        if (lastPageLink) {
          lastPageLink.click();
        }
      });
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const activePage = pagination.querySelector('.krds-pagination-active');
        if (activePage) {
          const prevPage = activePage.parentElement.previousElementSibling;
          if (prevPage && prevPage.querySelector('.krds-pagination-link')) {
            prevPage.querySelector('.krds-pagination-link').click();
          }
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const activePage = pagination.querySelector('.krds-pagination-active');
        if (activePage) {
          const nextPage = activePage.parentElement.nextElementSibling;
          if (nextPage && nextPage.querySelector('.krds-pagination-link')) {
            nextPage.querySelector('.krds-pagination-link').click();
          }
        }
      });
    }
  });
};

/**
 * 테이블 데이터를 얻어오는 함수
 * @param {HTMLElement} table - 테이블 요소
 * @returns {Array} 테이블 데이터 배열
 */
const getTableData = (table) => {
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
  const rows = table.querySelectorAll('tbody tr');
  const data = [];
  
  rows.forEach(row => {
    const rowData = {};
    const cells = row.querySelectorAll('td');
    
    cells.forEach((cell, index) => {
      if (index < headers.length) {
        rowData[headers[index]] = cell.textContent.trim();
      }
    });
    
    data.push(rowData);
  });
  
  return data;
};

/**
 * 테이블 행을 생성하는 함수
 * @param {Array} data - 테이블 데이터
 * @param {Array} columns - 컬럼 설정
 * @returns {HTMLElement} TR 요소
 */
const createTableRow = (data, columns) => {
  const tr = document.createElement('tr');
  
  columns.forEach(column => {
    const td = document.createElement('td');
    
    if (column.render) {
      // 렌더링 함수가 있는 경우
      td.innerHTML = column.render(data[column.field], data);
    } else {
      // 기본 텍스트 렌더링
      td.textContent = data[column.field] || '';
    }
    
    tr.appendChild(td);
  });
  
  return tr;
};

/**
 * 테이블 데이터를 설정하는 함수
 * @param {HTMLElement} table - 테이블 요소
 * @param {Array} data - 테이블 데이터
 * @param {Object} options - 옵션
 */
const setTableData = (table, data, options = {}) => {
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  // 기존 행 제거
  tbody.innerHTML = '';
  
  // 옵션 처리
  const {
    columns = [],
    pageSize = 10,
    currentPage = 1
  } = options;
  
  // 페이지네이션 처리
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageData = data.slice(startIndex, endIndex);
  
  // 데이터가 없는 경우 처리
  if (pageData.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = '데이터가 없습니다.';
    td.colSpan = columns.length || table.querySelectorAll('thead th').length;
    td.style.textAlign = 'center';
    td.style.padding = '1rem';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  
  // 행 생성 및 추가
  if (columns.length > 0) {
    // 컬럼 설정이 있는 경우
    pageData.forEach(rowData => {
      const tr = createTableRow(rowData, columns);
      tbody.appendChild(tr);
    });
  } else {
    // 컬럼 설정이 없는 경우 (기존 테이블 구조 사용)
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    
    pageData.forEach(rowData => {
      const tr = document.createElement('tr');
      
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = rowData[header] || '';
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
  }
  
  // 테이블 업데이트 이벤트 발생
  const updateEvent = new CustomEvent('krds-table-update', {
    bubbles: true,
    detail: { 
      table, 
      data,
      pageData,
      currentPage,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize)
    }
  });
  table.dispatchEvent(updateEvent);
  
  // 필요한 경우 페이지네이션 업데이트
  if (options.updatePagination) {
    updateTablePagination(table, currentPage, Math.ceil(data.length / pageSize));
  }
};

/**
 * 테이블 페이지네이션 업데이트 함수
 * @param {HTMLElement} table - 테이블 요소
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 */
const updateTablePagination = (table, currentPage, totalPages) => {
  const container = table.closest('.table-container');
  if (!container) return;
  
  const pagination = container.querySelector('.krds-pagination');
  if (!pagination) return;
  
  const pageList = pagination.querySelector('.krds-pagination-list');
  if (!pageList) return;
  
  // 페이지 목록 초기화
  pageList.innerHTML = '';
  
  // 최대 표시할 페이지 수
  const maxVisiblePages = 5;
  
  // 표시할 페이지 범위 계산
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // 범위 조정
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // 첫 페이지 표시
  if (startPage > 1) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'krds-pagination-link';
    link.textContent = '1';
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setTableData(table, table.tableData, { currentPage: 1, pageSize: table.pageSize, updatePagination: true });
    });
    
    li.appendChild(link);
    pageList.appendChild(li);
    
    // 생략 부호 표시
    if (startPage > 2) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.className = 'krds-pagination-ellipsis';
      span.textContent = '…';
      li.appendChild(span);
      pageList.appendChild(li);
    }
  }
  
  // 페이지 링크 생성
  for (let i = startPage; i <= endPage; i++) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'krds-pagination-link';
    if (i === currentPage) {
      link.classList.add('krds-pagination-active');
    }
    link.textContent = i.toString();
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setTableData(table, table.tableData, { currentPage: i, pageSize: table.pageSize, updatePagination: true });
    });
    
    li.appendChild(link);
    pageList.appendChild(li);
  }
  
  // 마지막 페이지 표시
  if (endPage < totalPages) {
    // 생략 부호 표시
    if (endPage < totalPages - 1) {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.className = 'krds-pagination-ellipsis';
      span.textContent = '…';
      li.appendChild(span);
      pageList.appendChild(li);
    }
    
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'krds-pagination-link';
    link.textContent = totalPages.toString();
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setTableData(table, table.tableData, { currentPage: totalPages, pageSize: table.pageSize, updatePagination: true });
    });
    
    li.appendChild(link);
    pageList.appendChild(li);
  }
  
  // 페이지 정보 업데이트
  const infoElement = container.querySelector('.krds-table-info');
  if (infoElement) {
    const pageSize = table.pageSize || 10;
    const totalItems = table.tableData ? table.tableData.length : 0;
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    
    infoElement.textContent = `총 ${totalItems}개 항목 중 ${start}-${end} 표시 중`;
  }
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initTables);

// 외부로 공개할 API
window.krdsTable = {
  init: initTables,
  sort: sortTable,
  search: searchTable,
  getData: getTableData,
  setData: setTableData,
  getSelectedRows: getSelectedRows
}; 