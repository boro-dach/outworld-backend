import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ApplicationModule } from './application/application.module';
import { ArticlesModule } from './articles/articles.module';
import { OrderModule } from './order/order.module';
import { MinecraftModule } from './minecraft/minecraft.module';
import { TransactionModule } from './transaction/transaction.module';
import { CardModule } from './card/card.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { JobModule } from './job/job.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    ApplicationModule,
    ArticlesModule,
    OrderModule,
    MinecraftModule,
    TransactionModule,
    CardModule,
    VacancyModule,
    JobModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
