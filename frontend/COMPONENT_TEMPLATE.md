# KRDS 컴포넌트 템플릿

이 문서는 KRDS 디자인 시스템 기반으로 컴포넌트를 구현할 때 사용하는 템플릿입니다.

## 컴포넌트 기본 구조

### HTML 구조

```html
<!-- 컴포넌트명.html -->
<div class="krds-{컴포넌트명}" id="{고유ID}" aria-{ARIA속성}="{값}">
  <div class="krds-{컴포넌트명}__element">
    <!-- 내부 요소 -->
  </div>
</div>
```

### SCSS 구조

```scss
// 컴포넌트명.scss
@import '../../styles/tokens/colors.scss';
@import '../../styles/tokens/typography.scss';
@import '../../styles/tokens/layout.scss';
@import '../../styles/tokens/shape.scss';
@import '../../styles/tokens/elevation.scss';

// 컴포넌트 기본 스타일
.krds-{컴포넌트명} {
  // 기본 스타일
  
  // 요소(Element) 스타일
  &__element {
    // 요소 스타일
  }
  
  // 상태(State) 스타일
  &--active {
    // 활성화 상태 스타일
  }
  
  &--disabled {
    // 비활성화 상태 스타일
  }
  
  // 크기 변형(Modifier) 스타일
  &--small {
    // 작은 크기 스타일
  }
  
  &--large {
    // 큰 크기 스타일
  }
  
  // 반응형 스타일
  @media (max-width: 768px) {
    // 모바일 스타일
  }
}
```

### JavaScript 구조

```javascript
// 컴포넌트명.js

/**
 * 컴포넌트명 컴포넌트
 * 
 * 컴포넌트에 대한 간단한 설명
 */

/**
 * 컴포넌트 초기화 함수
 * @param {string} selector - 컴포넌트를 적용할 요소의 선택자
 * @param {Object} options - 컴포넌트 옵션
 */
export function initialize{컴포넌트명}(selector = '.krds-{컴포넌트명}', options = {}) {
  const elements = document.querySelectorAll(selector);
  
  if (!elements.length) {
    return;
  }
  
  // 기본 옵션과 사용자 옵션 병합
  const defaultOptions = {
    // 기본 옵션 설정
  };
  
  const settings = { ...defaultOptions, ...options };
  
  // 각 요소에 대한 이벤트 처리
  elements.forEach(element => {
    // 초기화 로직
    setupEventListeners(element, settings);
  });
}

/**
 * 이벤트 리스너 설정
 * @param {HTMLElement} element - 컴포넌트 요소
 * @param {Object} settings - 설정 옵션
 */
function setupEventListeners(element, settings) {
  // 이벤트 리스너 로직
}

/**
 * 접근성 설정
 * @param {HTMLElement} element - 컴포넌트 요소
 */
function setupAccessibility(element) {
  // 접근성 관련 설정
}

// 자동 초기화 (DOMContentLoaded 이벤트 발생 시)
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    initialize{컴포넌트명}();
  });
}
```

## 구현 체크리스트

- [ ] 컴포넌트 HTML 구조 정의
- [ ] 컴포넌트 SCSS 스타일 작성
- [ ] JavaScript 기능 구현 (필요한 경우)
- [ ] 컴포넌트 접근성 검증
  - [ ] 키보드 접근성
  - [ ] 스크린 리더 지원
  - [ ] 색상 대비
- [ ] 반응형 디자인 구현
- [ ] 크로스 브라우저 테스트
- [ ] 문서화

## 컴포넌트 문서화 예시

### 컴포넌트명

컴포넌트에 대한 간단한 설명. 언제, 어떤 상황에서 사용하는지 설명합니다.

#### 예시

```html
<div class="krds-{컴포넌트명}">
  <div class="krds-{컴포넌트명}__element">내용</div>
</div>
```

#### 속성 및 옵션

| 속성/옵션 | 유형 | 기본값 | 설명 |
|----------|------|--------|------|
| `disabled` | Boolean | `false` | 컴포넌트 비활성화 여부 |
| `size` | String | `'medium'` | 컴포넌트 크기 ('small', 'medium', 'large') |

#### 변형

- `.krds-{컴포넌트명}--primary`: 주요 강조 스타일
- `.krds-{컴포넌트명}--secondary`: 보조 스타일
- `.krds-{컴포넌트명}--small`: 작은 크기
- `.krds-{컴포넌트명}--large`: 큰 크기

#### 이벤트

| 이벤트 | 발생 시점 | 전달 데이터 |
|--------|----------|------------|
| `change` | 값이 변경될 때 | `{ value: String }` |
| `click` | 클릭될 때 | `{ target: Element }` |

#### 접근성 고려사항

- 키보드 접근성: Tab 키로 포커스 이동, Enter/Space로 활성화
- ARIA 속성: `aria-label`, `aria-expanded` 등 사용
- 색상 대비: WCAG 2.1 AA 수준 준수

#### 주의사항 및 제한사항

- 특정 브라우저에서의 제한사항
- 성능 이슈
- 사용 시 고려사항 