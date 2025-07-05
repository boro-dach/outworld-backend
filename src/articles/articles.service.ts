import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateArticleDto } from './dto/articles.dto';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArticleDto, userId: string) {
    const article = await this.prisma.article.create({
      data: {
        title: dto.title,
        text: dto.text,
        userId,
      },
    });

    return article;
  }

  async getAll() {
    const articles = await this.prisma.article.findMany();

    return articles;
  }

  async delete(id: string) {
    const article = await this.prisma.article.delete({
      where: {
        id,
      },
    });

    return article;
  }
}
