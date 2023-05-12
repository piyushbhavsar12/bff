import { Controller, Get, Post, Patch, Delete, Body, HttpException, HttpStatus, Param, NotFoundException, Query, UseGuards } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CreateFaqDto } from "./faq.dto";
import { FAQService } from "./faq.service";
import { AuthGuard } from "../../common/auth-gaurd";

@Controller("faq")
@UseGuards(AuthGuard)
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Post()
  async create(@Body() createFaqDto: CreateFaqDto) {
    try {
      const faq = await this.faqService.create(createFaqDto);
      return { message: 'Faq created successfully', faq };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query("page") page: number, @Query("perPage") perPage: number) {
    try {
      page = page ? parseInt(`${page}`) : 1;
      perPage = perPage ? parseInt(`${perPage}`) : 10;
      const faqs = await this.faqService.findAll(page,perPage);
      return faqs;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    try {
      const faq = await this.faqService.findOne(id);
      return faq;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateFaqDto: CreateFaqDto) {
    try {
      const updatedFaq = await this.faqService.update(id, updateFaqDto);
      if (!updatedFaq) {
        throw new NotFoundException(`Faq with id ${id} not found`);
      }
      return { message: 'Faq updated successfully', faq: updatedFaq };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Faq with id ${id} not found`);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      const deletedFaq = await this.faqService.remove(id);
      if (!deletedFaq) {
        throw new NotFoundException(`Faq with id ${id} not found`);
      }
      return { message: 'Faq deleted successfully', faq: deletedFaq };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Faq with id ${id} not found`);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
