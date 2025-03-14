import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  QueryPostDto,
} from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * 게시글 목록 조회 - 성능 최적화 적용
   */
  async findAllPosts(queryDto: QueryPostDto) {
    const { search, projectId, page = 1, limit = 10 } = queryDto;
    this.logger.log(`게시글 목록 조회 요청: ${JSON.stringify(queryDto)}`);

    // 검색 조건 생성
    const where: Prisma.CommunityPostWhereInput = {
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            content: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
      ...(projectId && { projectId }),
    };

    // 병렬 처리로 총 게시글 수와 게시글 목록 동시 조회
    const [total, posts] = await Promise.all([
      this.prisma.communityPost.count({ where }),
      this.prisma.communityPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    this.logger.debug(`게시글 ${posts.length}개 조회 완료, 총 ${total}개`);
    
    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  /**
   * 특정 게시글 상세 조회 - 성능 최적화 적용
   */
  async findOnePost(id: string) {
    this.logger.log(`게시글 상세 조회 요청: ${id}`);
    
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!post) {
      this.logger.warn(`게시글을 찾을 수 없음: ${id}`);
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  /**
   * 게시글 생성 - 트랜잭션 적용
   */
  async createPost(createPostDto: CreatePostDto, userId: string) {
    this.logger.log(`게시글 생성 요청: ${JSON.stringify(createPostDto)}`);
    
    return this.prisma.$transaction(async (tx) => {
      // 프로젝트 ID가 제공된 경우 존재 여부 확인
      if (createPostDto.projectId) {
        const projectExists = await tx.project.findUnique({
          where: { id: createPostDto.projectId },
          select: { id: true }, // 필요한 필드만 선택하여 성능 향상
        });

        if (!projectExists) {
          throw new NotFoundException('지정된 프로젝트를 찾을 수 없습니다.');
        }

        // 사용자가 해당 프로젝트에 접근할 수 있는지 확인
        const projectMember = await tx.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId,
              projectId: createPostDto.projectId,
            },
          },
          select: { userId: true }, // 필요한 필드만 선택하여 성능 향상
        });

        if (!projectMember) {
          throw new ForbiddenException('이 프로젝트에 게시글을 작성할 권한이 없습니다.');
        }
      }

      // 게시글 생성
      const data: Prisma.CommunityPostCreateInput = {
        title: createPostDto.title,
        content: createPostDto.content,
        user: {
          connect: {
            id: userId,
          },
        },
        ...(createPostDto.projectId && {
          project: {
            connect: {
              id: createPostDto.projectId,
            },
          },
        }),
      };

      const newPost = await tx.communityPost.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      this.logger.debug(`게시글 생성 완료: ${newPost.id}`);
      return newPost;
    });
  }

  /**
   * 게시글 수정 - 트랜잭션 적용
   */
  async updatePost(id: string, updatePostDto: UpdatePostDto, userId: string) {
    this.logger.log(`게시글 수정 요청: ${id}, ${JSON.stringify(updatePostDto)}`);
    
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.communityPost.findUnique({
        where: { id },
        select: { id: true, userId: true, projectId: true },
      });

      if (!post) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }

      // 작성자만 수정 가능
      if (post.userId !== userId) {
        throw new ForbiddenException('이 게시글을 수정할 권한이 없습니다.');
      }

      // 프로젝트 ID가 변경된 경우 유효성 검사
      if (updatePostDto.projectId !== undefined && updatePostDto.projectId !== post.projectId) {
        if (updatePostDto.projectId !== null) {
          const projectExists = await tx.project.findUnique({
            where: { id: updatePostDto.projectId },
            select: { id: true }, // 필요한 필드만 선택하여 성능 향상
          });

          if (!projectExists) {
            throw new NotFoundException('지정된 프로젝트를 찾을 수 없습니다.');
          }

          // 사용자가 해당 프로젝트에 접근할 수 있는지 확인
          const projectMember = await tx.projectMember.findUnique({
            where: {
              userId_projectId: {
                userId,
                projectId: updatePostDto.projectId,
              },
            },
            select: { userId: true }, // 필요한 필드만 선택하여 성능 향상
          });

          if (!projectMember) {
            throw new ForbiddenException('이 프로젝트에 게시글을 추가할 권한이 없습니다.');
          }
        }
      }

      // 게시글 업데이트
      const data: Prisma.CommunityPostUpdateInput = {};
      
      if (updatePostDto.title !== undefined) data.title = updatePostDto.title;
      if (updatePostDto.content !== undefined) data.content = updatePostDto.content;

      // 프로젝트 ID 처리
      if (updatePostDto.projectId !== undefined) {
        if (updatePostDto.projectId === null) {
          data.project = { disconnect: true };
        } else {
          data.project = { 
            connect: { 
              id: updatePostDto.projectId 
            } 
          };
        }
      }

      const updatedPost = await tx.communityPost.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      this.logger.debug(`게시글 수정 완료: ${id}`);
      return updatedPost;
    });
  }

  /**
   * 게시글 삭제 - 트랜잭션 적용
   */
  async removePost(id: string, userId: string) {
    this.logger.log(`게시글 삭제 요청: ${id}`);
    
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.communityPost.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });

      if (!post) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }

      // 작성자만 삭제 가능
      if (post.userId !== userId) {
        throw new ForbiddenException('이 게시글을 삭제할 권한이 없습니다.');
      }

      // 게시글 삭제 (댓글도 함께 삭제됨 - cascade)
      await tx.communityPost.delete({
        where: { id },
      });
      
      this.logger.debug(`게시글 삭제 완료: ${id}`);
      return { id };
    });
  }

  /**
   * 댓글 작성 - 트랜잭션 적용
   */
  async createComment(createCommentDto: CreateCommentDto, userId: string) {
    this.logger.log(`댓글 작성 요청: ${JSON.stringify(createCommentDto)}`);
    
    return this.prisma.$transaction(async (tx) => {
      // 게시글 존재 여부 확인
      const post = await tx.communityPost.findUnique({
        where: { id: createCommentDto.postId },
        select: { id: true, projectId: true },
      });

      if (!post) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }

      // 프로젝트 관련 게시글인 경우 프로젝트 멤버만 댓글 작성 가능
      if (post.projectId) {
        const projectMember = await tx.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId,
              projectId: post.projectId,
            },
          },
          select: { userId: true }, // 필요한 필드만 선택하여 성능 향상
        });

        if (!projectMember) {
          throw new ForbiddenException('이 게시글에 댓글을 작성할 권한이 없습니다.');
        }
      }

      // 댓글 생성
      const data: Prisma.CommentCreateInput = {
        content: createCommentDto.content,
        user: {
          connect: {
            id: userId,
          },
        },
        post: {
          connect: {
            id: createCommentDto.postId,
          },
        },
      };

      const newComment = await tx.comment.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      this.logger.debug(`댓글 작성 완료: ${newComment.id}`);
      return newComment;
    });
  }

  /**
   * 댓글 삭제 - 트랜잭션 적용
   */
  async removeComment(id: string, userId: string) {
    this.logger.log(`댓글 삭제 요청: ${id}`);
    
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.findUnique({
        where: { id },
        select: { id: true, userId: true, postId: true },
      });

      if (!comment) {
        throw new NotFoundException('댓글을 찾을 수 없습니다.');
      }

      // 작성자만 삭제 가능
      if (comment.userId !== userId) {
        throw new ForbiddenException('이 댓글을 삭제할 권한이 없습니다.');
      }

      // 댓글 삭제
      await tx.comment.delete({
        where: { id },
      });
      
      this.logger.debug(`댓글 삭제 완료: ${id}`);
      return { id };
    });
  }
} 