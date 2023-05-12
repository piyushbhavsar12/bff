import { BadRequestException, Injectable } from "@nestjs/common";
import {
  document as Document,
  prompt_history as PromptHistory,
} from "@prisma/client";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import { CreatePromptDto, SearchPromptHistoryDto } from "./prompt.dto";
import { fetchWithAlert } from "../../common/utils";

export interface EmbeddingResponse {
  embedding: number[];
  text: string;
}

@Injectable()
export class PromptHistoryService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    // AUTH_HEADER = this.configService.get("AUTH_HEADER");
  }
  async createOrUpdate(data: CreatePromptDto): Promise<PromptHistory> {
    let olderDocument;
    let document: PromptHistory;
    try {
      if (!isNaN(parseInt(data.id)))
        olderDocument = await this.prisma.prompt_history.findUnique({
          where: {
            id: parseInt(data.id),
          },
        });
      if (olderDocument) {
        document = await this.prisma.prompt_history.update({
          where: { id: parseInt(data.id) },
          data: { timesUsed: olderDocument.timesUsed + 1 },
        });
      } else {
        let embedding = (await this.getEmbedding(data.queryInEnglish))[0];
        document = await this.prisma.prompt_history.create({
          data: {
            queryInEnglish: data.queryInEnglish,
            responseInEnglish: data.responseInEnglish,
            timesUsed: 0,
            responseTime: data.responseTime,
            metadata: data.metadata,
            queryId: data.queryId
          },
        });
        await this.prisma.$queryRawUnsafe(
          `UPDATE prompt_history SET embedding = '[${embedding.embedding
            .map((x) => `${x}`)
            .join(",")}]' WHERE id = ${document.id}`
        );
      }
    } catch (error) {
      throw new BadRequestException(error);
    }
    return document;
  }

  async findByCriteria(searchQueryDto: SearchPromptHistoryDto): Promise<any> {
    const embedding: EmbeddingResponse = (
      await this.getEmbedding(searchQueryDto.query)
    )[0];
    const results = await this.prisma
      .$queryRawUnsafe(`SELECT * FROM match_prompt_history(
                query_embedding := '[${embedding.embedding
                  .map((x) => `${x}`)
                  .join(",")}]',
                similarity_threshold := ${searchQueryDto.similarityThreshold},
                match_count := ${searchQueryDto.matchCount}
              );`);

    return results;
  }

  async getEmbedding(query: string): Promise<EmbeddingResponse[]> {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      this.configService.get("AI_TOOLS_AUTH_HEADER")
    );

    var raw = JSON.stringify({
      text: [query],
    });

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const embeddings = await fetchWithAlert(
      `${this.configService.get(
        "AI_TOOLS_BASE_URL"
      )}/t2embedding/openai/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => result as EmbeddingResponse[])
      .catch((error) => console.log("error", error));

    if (embeddings) return embeddings
    else return []
  }

  async findOne(id: number): Promise<Document | null> {
    try {
      let document = await this.prisma.document.findUnique({
        where: { id },
      });
      return document;
    } catch {
      return null;
    }
  }

  async softDeleteRelatedToDocument(documentId) {
    const affectedPromptHistories = await this.prisma.similarity_search_response.findMany({
      where: {
        documentId: documentId.id,
      },
      select: {
        queryId: true,
      },
    });
    // Soft delete the affected prompt_history records
    let updated = await Promise.all(
      affectedPromptHistories.map(({ queryId }) =>
        this.prisma.prompt_history.updateMany({
          where: {
            queryId,
          },
          data: {
            deletedAt: new Date(),
          },
        }),
      ),
    );
    return updated
  }
}
