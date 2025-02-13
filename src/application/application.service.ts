import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ApplicationService {
    constructor(private prisma: PrismaService) {}

    async createApplication(dto: CreateApplicationDto, userId: number) {
        // Получаем пользователя, чтобы узнать его email
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const application = await this.prisma.application.create({
            data: {
                text: dto.text,
                status: 'PENDING',
                userId: userId,
            },
        });

        // Отправляем письмо на email пользователя
        await this.sendEmail(
            application,
            'Новая заявка на рассмотрение',
            'monstriqq1@gmail.com'
        );

        return application;
    }

    async updateApplication(id: number, dto: UpdateApplicationDto) {
        const { status } = dto;

        const application = await this.prisma.application.findUnique({
            where: { id },
            include: { user: true }, // Включаем данные пользователя
        });
        if (!application) {
            throw new NotFoundException(`Application with ID ${id} not found`);
        }

        if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
            throw new BadRequestException(`Invalid status ${status}`);
        }

        const updatedApplication = await this.prisma.application.update({
            where: { id },
            data: { status },
            include: { user: true }, // Включаем данные пользователя
        });

        // Отправляем письмо на email пользователя
        await this.sendEmail(
            updatedApplication,
            'Статус вашей заявки был изменен',
            updatedApplication.user.email // Передаем email пользователя
        );

        return {
            text: updatedApplication.text,
            status: updatedApplication.status,
            username: updatedApplication.user.username,
        };
    }

    async getApplications() {
        return this.prisma.application.findMany();
    }

    private async sendEmail(
        application: { id: number; text: string; userId: number; status?: string },
        subject: string,
        userEmail: string
    ) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: subject,
            text: `Детали заявки:\n\n
                   ID заявки: ${application.id}\n
                   ID пользователя: ${application.userId}\n
                   Текст: ${application.text}\n
                   Статус: ${application.status || 'PENDING'}`,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent to:', userEmail);
        } catch (e) {
            console.log('Error sending email:', e);
        }
    }
}