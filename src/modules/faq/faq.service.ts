import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { CreateFaqDto, UpdateFaqDto } from './faq.dto';
import { Faq } from "./faq.model";

@Injectable()
export class FAQService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    return this.prisma.faq.create({
      data: createFaqDto,
    });
  }

  async findAll(page: number, perPage: number): Promise<any> {
    const faqs = await this.prisma.faq.findMany({
      take: perPage,
      skip: (page - 1) * perPage
    });
    const totalFaqs = await this.prisma.faq.count();
    return {
      pagination: {
        page,
        perPage,
        totalPages: Math.ceil(totalFaqs / perPage),
        totalFaqs,
      },
      faqs: faqs,
    };
  }

  async findOne(id: number): Promise<Faq> {
    return this.prisma.faq.findUnique({
      where: { id: parseInt(`${id}`) },
    });
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    return this.prisma.faq.update({
      where: { id: parseInt(`${id}`) },
      data: updateFaqDto,
    });
  }

  async remove(id: number): Promise<Faq> {
    return this.prisma.faq.delete({
      where: { id: parseInt(`${id}`) },
    });
  }
}