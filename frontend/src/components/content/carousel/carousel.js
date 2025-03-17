/**
 * 캐러셀 컴포넌트 자바스크립트
 * 슬라이드 쇼, 자동 전환, 썸네일 및 멀티 아이템 기능을 제공합니다.
 */

/**
 * 캐러셀 클래스
 */
class KrdsCarousel {
  /**
   * 생성자
   * @param {HTMLElement} element - 캐러셀 요소
   * @param {Object} options - 설정 옵션
   */
  constructor(element, options = {}) {
    // 기본 설정과 사용자 설정 병합
    this.settings = Object.assign({
      interval: 5000,                // 자동 재생 간격 (ms)
      pauseOnHover: true,            // 마우스 오버 시 일시 정지
      keyboard: true,                // 키보드 제어 사용
      indicators: true,              // 인디케이터 사용
      fade: false,                   // 페이드 효과 사용
      swipe: true,                   // 스와이프 제스처 사용
      items: 1,                      // 한 번에 표시할 아이템 수
      itemsMobile: 1,                // 모바일에서 한 번에 표시할 아이템 수
      autoplay: false,               // 자동 재생 사용
      thumbnails: false              // 썸네일 사용
    }, options);
    
    // 요소 정의
    this.carousel = element;
    this.track = this.carousel.querySelector('.krds-carousel-track');
    this.slides = Array.from(this.carousel.querySelectorAll('.krds-carousel-slide'));
    this.prevButton = this.carousel.querySelector('.krds-carousel-control-prev');
    this.nextButton = this.carousel.querySelector('.krds-carousel-control-next');
    this.indicators = Array.from(this.carousel.querySelectorAll('.krds-carousel-indicator'));
    this.autoplayToggle = this.carousel.querySelector('.krds-carousel-autoplay-toggle');
    
    // 썸네일 정의
    if (this.settings.thumbnails) {
      const wrapper = this.carousel.closest('.krds-carousel-wrapper');
      if (wrapper) {
        this.thumbnailContainer = wrapper.querySelector('.krds-carousel-thumbnails');
        this.thumbnails = Array.from(this.thumbnailContainer.querySelectorAll('.krds-carousel-thumbnail'));
      }
    }
    
    // 상태 정의
    this.currentIndex = 0;
    this.autoplayTimer = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    // 자동 재생 설정 가져오기
    if (this.carousel.classList.contains('krds-carousel-autoplay') || this.carousel.dataset.autoplay === 'true') {
      this.settings.autoplay = true;
      
      // 자동 재생 간격 설정
      if (this.carousel.dataset.interval) {
        this.settings.interval = parseInt(this.carousel.dataset.interval, 10);
      }
    }
    
    // 페이드 효과 설정
    if (this.carousel.classList.contains('krds-carousel-fade')) {
      this.settings.fade = true;
    }
    
    // 멀티 아이템 설정
    if (this.carousel.classList.contains('krds-carousel-multi')) {
      if (this.carousel.dataset.items) {
        this.settings.items = parseInt(this.carousel.dataset.items, 10);
      }
      
      if (this.carousel.dataset.itemsMobile) {
        this.settings.itemsMobile = parseInt(this.carousel.dataset.itemsMobile, 10);
      }
    }
    
    // 초기화
    this.init();
  }
  
  /**
   * 초기화 함수
   */
  init() {
    // 슬라이드가 없으면 종료
    if (this.slides.length === 0) return;
    
    // 첫 번째 슬라이드 활성화
    if (!this.settings.fade) {
      this.goToSlide(0);
    } else {
      this.slides[0].classList.add('active');
    }
    
    // 이벤트 설정
    this.setEventListeners();
    
    // 자동 재생 시작
    if (this.settings.autoplay) {
      this.startAutoplay();
    }
    
    // 멀티 아이템 설정
    this.updateItemsPerView();
    window.addEventListener('resize', () => this.updateItemsPerView());
    
    // 접근성을 위한 ARIA 속성 설정
    this.setupAria();
  }
  
  /**
   * 이벤트 리스너 설정 함수
   */
  setEventListeners() {
    // 이전 버튼 클릭 이벤트
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.prevSlide());
    }
    
    // 다음 버튼 클릭 이벤트
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.nextSlide());
    }
    
    // 인디케이터 클릭 이벤트
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goToSlide(index));
    });
    
    // 자동 재생 토글 버튼 이벤트
    if (this.autoplayToggle) {
      this.autoplayToggle.addEventListener('click', () => this.toggleAutoplay());
    }
    
    // 키보드 이벤트
    if (this.settings.keyboard) {
      this.carousel.addEventListener('keydown', (event) => this.handleKeyDown(event));
    }
    
    // 마우스 호버 이벤트
    if (this.settings.autoplay && this.settings.pauseOnHover) {
      this.carousel.addEventListener('mouseenter', () => this.pause());
      this.carousel.addEventListener('mouseleave', () => this.resume());
    }
    
    // 터치 이벤트 (스와이프)
    if (this.settings.swipe) {
      this.carousel.addEventListener('touchstart', (event) => this.handleTouchStart(event), { passive: true });
      this.carousel.addEventListener('touchend', (event) => this.handleTouchEnd(event), { passive: true });
    }
    
    // 썸네일 이벤트
    if (this.thumbnails) {
      this.thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => this.goToSlide(index));
      });
    }
    
    // 슬라이드 전환 완료 이벤트
    this.slides.forEach(slide => {
      slide.addEventListener('transitionend', () => {
        this.carousel.dispatchEvent(new CustomEvent('krds-carousel-slide-changed', {
          bubbles: true,
          detail: { carousel: this.carousel, currentIndex: this.currentIndex }
        }));
      });
    });
  }
  
  /**
   * 다음 슬라이드로 이동 함수
   */
  nextSlide() {
    let nextIndex = this.currentIndex + 1;
    
    // 마지막 슬라이드인 경우 처음으로 이동
    if (nextIndex >= this.slides.length) {
      nextIndex = 0;
    }
    
    this.goToSlide(nextIndex);
  }
  
  /**
   * 이전 슬라이드로 이동 함수
   */
  prevSlide() {
    let prevIndex = this.currentIndex - 1;
    
    // 첫 번째 슬라이드인 경우 마지막으로 이동
    if (prevIndex < 0) {
      prevIndex = this.slides.length - 1;
    }
    
    this.goToSlide(prevIndex);
  }
  
  /**
   * 특정 슬라이드로 이동 함수
   * @param {number} index - 이동할 슬라이드 인덱스
   */
  goToSlide(index) {
    // 유효하지 않은 인덱스인 경우 종료
    if (index < 0 || index >= this.slides.length) return;
    
    // 전환 방향 결정
    const direction = index > this.currentIndex ? 'next' : 'prev';
    
    // 활성 슬라이드 변경
    if (this.settings.fade) {
      // 페이드 효과 사용 시
      this.slides.forEach(slide => slide.classList.remove('active'));
      this.slides[index].classList.add('active');
    } else {
      // 슬라이드 효과 사용 시
      const slideWidth = this.slides[0].offsetWidth;
      const itemsPerView = this.getItemsPerView();
      const offset = -(index * slideWidth / itemsPerView);
      this.track.style.transform = `translateX(${offset}px)`;
      
      // 애니메이션 클래스 추가 및 제거
      this.slides.forEach(slide => {
        slide.classList.remove('slide-in-right', 'slide-in-left');
      });
      
      if (direction === 'next') {
        this.slides[index].classList.add('slide-in-right');
      } else {
        this.slides[index].classList.add('slide-in-left');
      }
    }
    
    // 인디케이터 업데이트
    this.updateIndicators(index);
    
    // 썸네일 업데이트
    if (this.thumbnails) {
      this.updateThumbnails(index);
    }
    
    // 현재 인덱스 업데이트
    this.currentIndex = index;
    
    // 슬라이드 변경 이벤트 발생
    this.carousel.dispatchEvent(new CustomEvent('krds-carousel-slide-change', {
      bubbles: true,
      detail: { carousel: this.carousel, currentIndex: this.currentIndex, direction }
    }));
  }
  
  /**
   * 인디케이터 업데이트 함수
   * @param {number} activeIndex - 활성 슬라이드 인덱스
   */
  updateIndicators(activeIndex) {
    if (!this.indicators.length) return;
    
    this.indicators.forEach((indicator, index) => {
      if (index === activeIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
  
  /**
   * 썸네일 업데이트 함수
   * @param {number} activeIndex - 활성 슬라이드 인덱스
   */
  updateThumbnails(activeIndex) {
    if (!this.thumbnails) return;
    
    this.thumbnails.forEach((thumbnail, index) => {
      if (index === activeIndex) {
        thumbnail.classList.add('active');
      } else {
        thumbnail.classList.remove('active');
      }
    });
  }
  
  /**
   * 자동 재생 시작 함수
   */
  startAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
    }
    
    this.isPlaying = true;
    this.isPaused = false;
    
    this.updateAutoplayButton();
    
    this.autoplayTimer = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.settings.interval);
  }
  
  /**
   * 자동 재생 중지 함수
   */
  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    
    this.isPlaying = false;
    this.isPaused = false;
    
    this.updateAutoplayButton();
  }
  
  /**
   * 자동 재생 일시 정지 함수
   */
  pause() {
    this.isPaused = true;
    this.updateAutoplayButton();
  }
  
  /**
   * 자동 재생 재개 함수
   */
  resume() {
    this.isPaused = false;
    this.updateAutoplayButton();
  }
  
  /**
   * 자동 재생 토글 함수
   */
  toggleAutoplay() {
    if (this.isPlaying) {
      this.stopAutoplay();
    } else {
      this.startAutoplay();
    }
  }
  
  /**
   * 자동 재생 버튼 업데이트 함수
   */
  updateAutoplayButton() {
    if (!this.autoplayToggle) return;
    
    const pauseIcon = this.autoplayToggle.querySelector('.krds-carousel-autoplay-pause');
    const playIcon = this.autoplayToggle.querySelector('.krds-carousel-autoplay-play');
    
    if (this.isPlaying) {
      pauseIcon.style.display = '';
      playIcon.style.display = 'none';
      this.autoplayToggle.setAttribute('aria-label', '자동 재생 일시 정지');
    } else {
      pauseIcon.style.display = 'none';
      playIcon.style.display = '';
      this.autoplayToggle.setAttribute('aria-label', '자동 재생 시작');
    }
  }
  
  /**
   * 키보드 이벤트 처리 함수
   * @param {Event} event - 키보드 이벤트
   */
  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowLeft':
        this.prevSlide();
        break;
      case 'ArrowRight':
        this.nextSlide();
        break;
      case 'Home':
        this.goToSlide(0);
        break;
      case 'End':
        this.goToSlide(this.slides.length - 1);
        break;
      default:
        return;
    }
    
    event.preventDefault();
  }
  
  /**
   * 터치 시작 이벤트 처리 함수
   * @param {Event} event - 터치 이벤트
   */
  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
  }
  
  /**
   * 터치 종료 이벤트 처리 함수
   * @param {Event} event - 터치 이벤트
   */
  handleTouchEnd(event) {
    this.touchEndX = event.changedTouches[0].clientX;
    
    // 스와이프 감지
    const touchDiff = this.touchStartX - this.touchEndX;
    
    // 오른쪽에서 왼쪽으로 스와이프: 다음 슬라이드
    if (touchDiff > 50) {
      this.nextSlide();
    }
    
    // 왼쪽에서 오른쪽으로 스와이프: 이전 슬라이드
    if (touchDiff < -50) {
      this.prevSlide();
    }
  }
  
  /**
   * 화면 크기에 따른 아이템 수 업데이트 함수
   */
  updateItemsPerView() {
    const itemsPerView = this.getItemsPerView();
    
    // 멀티 아이템 캐러셀인 경우
    if (this.carousel.classList.contains('krds-carousel-multi')) {
      this.slides.forEach(slide => {
        const width = `calc(${100 / itemsPerView}% - ${16}px)`;
        slide.style.flex = `0 0 ${width}`;
        slide.style.maxWidth = width;
      });
    }
  }
  
  /**
   * 화면 크기에 따른 아이템 수 반환 함수
   * @returns {number} 아이템 수
   */
  getItemsPerView() {
    // 모바일 화면인 경우
    if (window.innerWidth <= 768) {
      return this.settings.itemsMobile;
    }
    
    return this.settings.items;
  }
  
  /**
   * 접근성을 위한 ARIA 속성 설정 함수
   */
  setupAria() {
    // 캐러셀에 role 및 aria-roledescription 설정
    this.carousel.setAttribute('role', 'region');
    this.carousel.setAttribute('aria-roledescription', '캐러셀');
    
    // 슬라이드에 role 및 aria-roledescription 설정
    this.slides.forEach((slide, index) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', '슬라이드');
      slide.setAttribute('aria-label', `${index + 1} / ${this.slides.length}`);
    });
    
    // 현재 슬라이드 상태 설정
    this.updateAriaLive();
  }
  
  /**
   * 접근성을 위한 ARIA 상태 업데이트 함수
   */
  updateAriaLive() {
    this.slides.forEach((slide, index) => {
      if (index === this.currentIndex) {
        slide.setAttribute('aria-current', 'true');
      } else {
        slide.removeAttribute('aria-current');
      }
    });
  }
}

/**
 * 모든 캐러셀 초기화 함수
 */
const initCarousels = () => {
  const carousels = document.querySelectorAll('.krds-carousel');
  
  carousels.forEach(carousel => {
    // 이미 초기화된 캐러셀인지 확인
    if (carousel.hasAttribute('data-initialized')) return;
    
    // 캐러셀 인스턴스 생성
    const options = {};
    
    // 옵션 설정
    if (carousel.classList.contains('krds-carousel-fade')) {
      options.fade = true;
    }
    
    if (carousel.classList.contains('krds-carousel-autoplay')) {
      options.autoplay = true;
      if (carousel.hasAttribute('data-interval')) {
        options.interval = parseInt(carousel.getAttribute('data-interval'), 10);
      }
    }
    
    if (carousel.classList.contains('krds-carousel-multi')) {
      if (carousel.hasAttribute('data-items')) {
        options.items = parseInt(carousel.getAttribute('data-items'), 10);
      }
      if (carousel.hasAttribute('data-items-mobile')) {
        options.itemsMobile = parseInt(carousel.getAttribute('data-items-mobile'), 10);
      }
    }
    
    // 썸네일 옵션 설정
    if (carousel.closest('.krds-carousel-wrapper')?.querySelector('.krds-carousel-thumbnails')) {
      options.thumbnails = true;
    }
    
    // 캐러셀 초기화
    new KrdsCarousel(carousel, options);
    
    // 초기화 표시
    carousel.setAttribute('data-initialized', 'true');
  });
};

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', initCarousels);

// 외부로 공개할 API
window.krdsCarousel = {
  init: initCarousels,
  create: (element, options) => new KrdsCarousel(element, options)
}; 