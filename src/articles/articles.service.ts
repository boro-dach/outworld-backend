import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateArticleDto, DeleteArticleDto } from './dto/articles.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArticleDto, userId: string) {
    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        text: dto.text,
        type: dto.type,
        userId,
      },
    });

    return article;
  }

  async getAll(userId: string) {
    const articles = await this.prisma.article.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
        likes: {
          where: {
            userId,
          },
          select: {
            userId: true,
          },
        },
      },
    });

    return articles.map(({ _count, likes, ...article }) => ({
      ...article,
      likes: _count.likes,
      isLiked: likes.length > 0,
    }));
  }

  async delete(dto: DeleteArticleDto) {
    const article = await this.prisma.article.delete({
      where: {
        id: dto.articleId,
      },
    });

    return article;
  }

  async likeArticle(articleId: string, userId: string) {
    const existingLike = await this.prisma.articleLike.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingLike) {
      return this.prisma.articleLike.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
    } else {
      return this.prisma.articleLike.create({
        data: {
          userId,
          articleId,
        },
      });
    }
  }
}
