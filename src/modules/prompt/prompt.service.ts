import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../global-services/prisma.service";
import { ConfigService } from "@nestjs/config";
import fetch from "node-fetch";
import { prompt as Prompt } from "@prisma/client";
import { CreatePromptDto } from "../prompt-history/prompt.dto";

@Injectable()
export class PromptService {}
