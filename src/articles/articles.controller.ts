import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserRole } from 'generated/prisma';
import { CreateArticleDto } from './dto/articles.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Auth(UserRole.ADMIN)
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
  async getAll() {
    const articles = await this.articlesService.getAll();

    return articles;
  }

  @Auth(UserRole.ADMIN)
  @HttpCode(200)
  @Post('delete')
  async delete(@Body() id: string) {
    const article = await this.articlesService.delete(id);

    return article;
  }
}
