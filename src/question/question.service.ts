import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/global-services/prisma.service";

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async fetchResponse(userQuestion: string): Promise<{ question: string; response: string }> {
    // Step 1: Check if the question matches a MainQuestion
    const mainQuestion = await this.prisma.mainQuestion.findFirst({
      where: { question: userQuestion },
      select: { question: true, response: true },
    });

    if (mainQuestion) {
      return mainQuestion;
    }

    // Step 2: Check if the question matches a Variation
    const variation = await this.prisma.variations.findFirst({
      where: { variation: userQuestion },
      select: { mainQuestion: { select: { question: true, response: true } } },
    });

    if (variation && variation.mainQuestion) {
      return variation.mainQuestion;
    }

    // Step 3: If no match, throw an error
    throw new NotFoundException('No matching question found in the database.');
  }
}