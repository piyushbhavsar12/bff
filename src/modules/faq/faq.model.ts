import { Prisma } from '@prisma/client';

export class Faq implements Prisma.faqUncheckedCreateInput {
  id: number;
  question: string;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}