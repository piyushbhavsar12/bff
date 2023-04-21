import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateDocumentDto } from "./embeddings.dto";

import { document as Document, document } from "@prisma/client";
import { PrismaService } from "src/global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import fetch from "node-fetch";

interface EmbeddingResponse {
  embedding: number[];
  text: string;
}

@Injectable()
export class EmbeddingsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    // AUTH_HEADER = this.configService.get("AUTH_HEADER");
  }
  async createOrUpdate(allData: CreateDocumentDto[]): Promise<Document[]> {
    const response: Document[] = [];
    if (Array.isArray(allData)) {
      for (const data of allData) {
        let olderDocument;
        let document: Document;
        try {
          olderDocument = await this.prisma.document.findUnique({
            where: {
              id: data.id,
            },
          });
          if (olderDocument) {
            if (olderDocument.tags == data.tags) {
              olderDocument.content = data.content;
              document = await this.prisma.document.update({
                where: { id: data.id },
                data: { content: data.content },
              });
            } else {
              // get new embeddings for newer tags
              // get new embeddings for newer tags if they have changed
              let embedding = (await this.getEmbedding(data.tags))[0];
              document = await this.prisma.document.update({
                where: { id: data.id },
                data: {
                  tags: data.tags,
                  content: data.content,
                },
              });
              await this.prisma.$queryRawUnsafe(
                `UPDATE document SET embedding = '[${embedding.embedding
                  .map((x) => `${x}`)
                  .join(",")}]' WHERE id = ${document.id}`
              );
            }
          } else {
            let embedding = (await this.getEmbedding(data.tags))[0];
            document = await this.prisma.document.create({
              data: {
                id: data.id,
                tags: data.tags,
                content: data.content,
              },
            });
            await this.prisma.$queryRawUnsafe(
              `UPDATE document SET embedding = '[${embedding.embedding
                .map((x) => `${x}`)
                .join(",")}]' WHERE id = ${document.id}`
            );
          }
          response.push(document);
        } catch (error) {
          throw new BadRequestException(error);
        }
      }
    }
    return response;
  }

  async findByCriteria(searchQueryDto): Promise<any> {
    const embedding: EmbeddingResponse = (
      await this.getEmbedding(searchQueryDto.query)
    )[0];
    const results = await this.prisma
      .$queryRawUnsafe(`SELECT * FROM match_documents(
        query_embedding := '[${embedding.embedding
          .map((x) => `${x}`)
          .join(",")}]',
        similarity_threshold := ${searchQueryDto.similarityThreshold},
        match_count := ${searchQueryDto.matchCount}
      );`);

    console.log(results);
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

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const embeddings = await fetch(
      `${this.configService.get(
        "AI_TOOLS_BASE_URL"
      )}/t2embedding/openai/remote`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => result as EmbeddingResponse[])
      .catch((error) => console.log("error", error));

    return embeddings;
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

  async update(data: CreateDocumentDto): Promise<Document> {
    const document = await this.createOrUpdate([data]);
    return data[0];
  }
}
