import {
  IsInt,
  IsNotEmpty,
  Max,
  Min,
  IsPhoneNumber,
  IsDefined,
  ValidateIf,
  IsUUID,
} from "class-validator";

export class CreateDocumentDto {
  @IsDefined({ message: "Unique ID is required to ingest embeddings" })
  id: number;

  @IsDefined({ message: "Tags cannot be empty" })
  tags: string;

  content: string;
}

export class SearchQueryDto {
  @IsDefined({ message: "Query needs to be defined to search documents" })
  query: string;

  @IsDefined({ message: "Similarity Threashold needs to be defined" })
  similarityThreshold: number;

  @IsDefined({
    message: "Max matched documents need to be difined to limit search results",
  })
  matchCount: number;
}
