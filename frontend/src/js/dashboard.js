/**
 * 대시보드 관련 기능을 제공하는 모듈
 */
import { api } from './api.js';

/**
 * 대시보드 요약 데이터를 가져옵니다.
 * @returns {Promise<Object>} 대시보드 데이터 객체
 */
export async function fetchDashboardData() {
  try {
    const response = await api.get('/statistics/dashboard');
    return response.data;
  } catch (error) {
    console.error('대시보드 데이터를 가져오는 중 오류 발생:', error);
    
    // API 연동 전 임시 데이터
    return {
      projectCount: 5,
      riskAssessmentCount: 12,
      documentCount: 24,
      workerCount: 48
    };
  }
}

/**
 * 최근 활동 데이터를 가져옵니다.
 * @param {number} limit - 가져올 활동 수 (기본값: 5)
 * @returns {Promise<Array>} 최근 활동 배열
 */
export async function fetchRecentActivities(limit = 5) {
  try {
    const response = await api.get(`/activities/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('최근 활동 데이터를 가져오는 중 오류 발생:', error);
    
    // API 연동 전 임시 데이터
    return [
      {
        id: 1,
        type: 'project',
        title: '새 프로젝트가 생성되었습니다.',
        description: 'OO 건설 현장 안전 관리',
        time: '방금 전'
      },
      {
        id: 2,
        type: 'risk',
        title: '위험성 평가가 완료되었습니다.',
        description: '고소작업 위험성 평가',
        time: '1시간 전'
      },
      {
        id: 3,
        type: 'document',
        title: '새 안전 문서가 업로드되었습니다.',
        description: '안전 교육 매뉴얼 v2.0',
        time: '3시간 전'
      },
      {
        id: 4,
        type: 'worker',
        title: '근로자가 추가되었습니다.',
        description: '홍길동 (전기 기술자)',
        time: '어제'
      },
      {
        id: 5,
        type: 'community',
        title: '새 게시글이 작성되었습니다.',
        description: '이번 주 안전 점검 결과 공유',
        time: '어제'
      }
    ];
  }
}

/**
 * 프로젝트 통계 데이터를 가져옵니다.
 * @returns {Promise<Object>} 프로젝트 통계 데이터
 */
export async function fetchProjectStatistics() {
  try {
    const response = await api.get('/statistics/projects');
    return response.data;
  } catch (error) {
    console.error('프로젝트 통계 데이터를 가져오는 중 오류 발생:', error);
    
    // API 연동 전 임시 데이터
    return {
      totalProjects: 8,
      activeProjects: 5,
      completedProjects: 2,
      cancelledProjects: 1,
      projectsByMonth: [
        { month: '1월', count: 1 },
        { month: '2월', count: 2 },
        { month: '3월', count: 1 },
        { month: '4월', count: 0 },
        { month: '5월', count: 1 },
        { month: '6월', count: 3 }
      ]
    };
  }
}

/**
 * 위험성 평가 통계 데이터를 가져옵니다.
 * @returns {Promise<Object>} 위험성 평가 통계 데이터
 */
export async function fetchRiskAssessmentStatistics() {
  try {
    const response = await api.get('/statistics/risk-assessments');
    return response.data;
  } catch (error) {
    console.error('위험성 평가 통계 데이터를 가져오는 중 오류 발생:', error);
    
    // API 연동 전 임시 데이터
    return {
      totalAssessments: 12,
      byStatus: {
        draft: 2,
        completed: 8,
        approved: 2,
        rejected: 0
      },
      byRiskLevel: {
        low: 5,
        medium: 4,
        high: 2,
        critical: 1
      }
    };
  }
}

/**
 * 근로자 통계 데이터를 가져옵니다.
 * @returns {Promise<Object>} 근로자 통계 데이터
 */
export async function fetchWorkerStatistics() {
  try {
    const response = await api.get('/statistics/workers');
    return response.data;
  } catch (error) {
    console.error('근로자 통계 데이터를 가져오는 중 오류 발생:', error);
    
    // API 연동 전 임시 데이터
    return {
      totalWorkers: 48,
      byProject: [
        { project: '프로젝트 A', count: 15 },
        { project: '프로젝트 B', count: 12 },
        { project: '프로젝트 C', count: 8 },
        { project: '프로젝트 D', count: 7 },
        { project: '프로젝트 E', count: 6 }
      ],
      checkinToday: 32
    };
  }
} 