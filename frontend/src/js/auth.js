import { authAPI } from './api.js';

/**
 * 인증 관련 유틸리티 모듈
 * 
 * 로그인, 회원가입, 로그아웃 등 인증 관련 기능을 제공합니다.
 */

// 사용자 세션 저장 키
const USER_SESSION_KEY = 'user_session';
const REMEMBER_ME_KEY = 'remember_me';

/**
 * 로그인 기능 구현
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 * @param {boolean} rememberMe - 로그인 상태 유지 여부
 * @returns {Promise<Object>} 로그인 결과
 */
export async function login(email, password, rememberMe = false) {
  try {
    const response = await authAPI.login({ email, password });
    const { token, user } = response.data;
    
    // 토큰 저장
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // 세션 저장
    setUserSession(user, rememberMe);
    
    return { success: true, user };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || '로그인에 실패했습니다.' 
    };
  }
}

/**
 * 회원가입 기능 구현
 * @param {string} name - 사용자 이름
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} 회원가입 결과
 */
export async function signup(name, email, password) {
  try {
    // 실제 구현에서는 API 호출 필요
    // const response = await authAPI.register({ name, email, password });
    // return { success: true, user: response.data };
    
    // 테스트용 임시 코드
    const mockResponse = mockSignupAPI(name, email, password);
    
    return {
      success: mockResponse.success,
      message: mockResponse.message
    };
  } catch (error) {
    console.error('회원가입 오류:', error);
    return { success: false, message: '회원가입 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 로그아웃 기능 구현
 * 로컬 스토리지에서 인증 정보를 제거하고 로그인 페이지로 리다이렉트
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(USER_SESSION_KEY);
  window.location.href = '/login.html';
}

/**
 * 사용자 인증 상태 확인
 * @returns {boolean} 인증 여부
 */
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * 현재 로그인한 사용자 정보 조회
 * @returns {Object|null} 사용자 정보
 */
export function getCurrentUser() {
  const sessionUser = sessionStorage.getItem(USER_SESSION_KEY);
  const localUser = localStorage.getItem(USER_SESSION_KEY);
  
  if (sessionUser) {
    return JSON.parse(sessionUser);
  } else if (localUser) {
    // 세션 스토리지에도 복사 (브라우저 탭 간 동기화)
    sessionStorage.setItem(USER_SESSION_KEY, localUser);
    return JSON.parse(localUser);
  }
  
  return null;
}

/**
 * 사용자 프로필 업데이트
 * @param {Object} userData - 업데이트할 사용자 정보
 * @returns {Promise<Object>} 업데이트 결과
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await authAPI.updateProfile(userData);
    const updatedUser = response.data;
    
    // 로컬 스토리지 업데이트
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || '프로필 업데이트에 실패했습니다.' 
    };
  }
};

/**
 * 페이지 접근 제어 - 인증 필요
 * 현재 페이지가 인증이 필요한 페이지일 경우 로그인 상태를 확인
 */
export const requireAuth = () => {
  if (!isAuthenticated()) {
    // 현재 URL을 저장하고 로그인 페이지로 리다이렉트
    const currentPath = window.location.pathname;
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    window.location.href = '/login.html';
  }
};

/**
 * 로그인 성공 후 원래 접근하려던 페이지로 리다이렉트
 */
export const redirectAfterLogin = () => {
  const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/index.html';
  sessionStorage.removeItem('redirectAfterLogin');
  window.location.href = redirectPath;
};

/**
 * 페이지 접근 제어 - 권한 확인
 * @param {string[]} requiredRoles - 필요한 권한 배열
 * @returns {boolean} 접근 가능 여부
 */
export const checkPermission = (requiredRoles) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // 관리자는 모든 권한 보유
  if (user.role === 'ADMIN') return true;
  
  // 필요한 권한 중 하나라도 있으면 접근 가능
  return requiredRoles.includes(user.role);
};

/**
 * 사용자 세션 저장
 * @param {Object} user - 사용자 정보
 * @param {boolean} rememberMe - 로그인 상태 유지 여부
 */
function setUserSession(user, rememberMe) {
  const userJSON = JSON.stringify(user);
  
  // 세션 스토리지에 항상 저장 (현재 탭에서 사용)
  sessionStorage.setItem(USER_SESSION_KEY, userJSON);
  
  // 로그인 상태 유지시 로컬 스토리지에도 저장
  if (rememberMe) {
    localStorage.setItem(USER_SESSION_KEY, userJSON);
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

/**
 * 테스트용 로그인 API 모의 구현
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Object} - 모의 응답 객체
 */
function mockLoginAPI(email, password) {
  // 테스트용 계정: admin@example.com / password123
  if (email === 'admin@example.com' && password === 'password123') {
    return {
      success: true,
      user: {
        id: 1,
        name: '관리자',
        email: 'admin@example.com',
        role: 'ADMIN'
      }
    };
  }
  
  // 테스트용 계정: user@example.com / password123
  if (email === 'user@example.com' && password === 'password123') {
    return {
      success: true,
      user: {
        id: 2,
        name: '일반 사용자',
        email: 'user@example.com',
        role: 'USER'
      }
    };
  }
  
  return {
    success: false,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
  };
}

/**
 * 테스트용 회원가입 API 모의 구현
 * @param {string} name - 사용자 이름
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Object} - 모의 응답 객체
 */
function mockSignupAPI(name, email, password) {
  // 이메일 유효성 검사
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: '유효하지 않은 이메일 형식입니다.'
    };
  }
  
  // 이메일 중복 검사 (테스트용)
  if (email === 'admin@example.com' || email === 'user@example.com') {
    return {
      success: false,
      message: '이미 사용 중인 이메일입니다.'
    };
  }
  
  // 비밀번호 유효성 검사
  if (password.length < 8) {
    return {
      success: false,
      message: '비밀번호는 8자 이상이어야 합니다.'
    };
  }
  
  // 회원가입 성공
  return {
    success: true,
    message: '회원가입이 완료되었습니다.'
  };
} 