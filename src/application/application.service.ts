import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import * as nodemailer from 'nodemailer';
import { text } from 'stream/consumers';

@Injectable()
export class ApplicationService {
    constructor(private prisma: PrismaService) {}
    async createApplication(
        dto: CreateApplicationDto,
        userId: number
    ) {
        const application = await this.prisma.application.create({
            data: {
                text: dto.text,
                status: 'PENDING',
                userId: userId
            }
        })

        await this.sendEmail(application, 'Новая заявка на рассмотрение')

        return application
    }
    
    async updateApplication(
        id: number,
        dto: UpdateApplicationDto
    ) {
        const { status } = dto

        const application = await this.prisma.application.findUnique({ where: { id } });
        if (!application) {
            throw new NotFoundException(`Application with ${id} not found`);
        }

        if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
            throw new BadRequestException(`Invalid status ${status}`);
        }

        const updatedApplication = await this.prisma.application.update({
            where: { id },
            data: { status },
            include: { user: true } 
        })

        await this.sendEmail(application, 'Статус вашей заявки был изменен')

        return {
            text: updatedApplication.text,
            status: updatedApplication.status,
            username: updatedApplication.user.username
        }
    }
    
    async getApplications() {
        return this.prisma.application.findMany();
    }

    private async sendEmail(application: { id: number, text: string, userId: number, }, subject: string) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'monstriqq1@gmail.com',
            subject: subject,
            text: `A new application has been created:\n\n
                    Application ID: ${application.id}\n
                    User ID: ${application.userId}\n
                    Text: ${application.text}\n
                    Status: PENDING`
        };

        try {
            await transporter.sendMail(mailOptions)
            console.log('Email sent')
        } catch (e) {
            console.log(e)
        };
    }
}
