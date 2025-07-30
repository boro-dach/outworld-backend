import { Body, Controller, Delete, HttpCode, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'generated/prisma';
import { CreateArticleDto, LikeArticleDto } from './dto/articles.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { Job } from 'src/jobs/decorators/jobs.decorator';

@Controller('article')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Job('JOURNALIST')
  @HttpCode(200)
  @Post('create')
  async create(
    @Body() dto: CreateArticleDto,
    @CurrentUser('id') userId: string,
  ) {
    const article = await this.articlesService.create(dto, userId);

    return article;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('get-all')
  async getAll(@CurrentUser('id') userId: string) {
    const articles = await this.articlesService.getAll(userId);

    return articles;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @Job('JOURNALIST')
  @HttpCode(200)
  @Post('delete')
  async delete(@Body() id: string) {
    const article = await this.articlesService.delete(id);

    return article;
  }

  @Auth(UserRole.USER, UserRole.ADMIN)
  @HttpCode(200)
  @Post('like')
  async like(@Body() dto: LikeArticleDto, @CurrentUser('id') userId: string) {
    const like = await this.articlesService.likeArticle(dto.articleId, userId);

    return like;
  }
}
