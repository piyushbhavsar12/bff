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
