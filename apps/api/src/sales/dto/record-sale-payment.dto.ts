import { recordSalePaymentSchema } from "@sme/shared";
import { createZodDto } from "nestjs-zod";

export class RecordSalePaymentDto extends createZodDto(recordSalePaymentSchema) {}
