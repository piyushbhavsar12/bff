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

  async findAll(): Promise<Faq[]> {
    return this.prisma.faq.findMany();
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