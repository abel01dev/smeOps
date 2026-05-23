-- Buy now, pay later: credit sales, customer balances, payment collections

-- CreateEnum
CREATE TYPE "SalePaymentStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CREDIT';

-- AlterTable
ALTER TABLE "customers" ADD COLUMN "outstandingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN "creditLimit" DECIMAL(14,2);

-- AlterTable
ALTER TABLE "sales" ADD COLUMN "paymentStatus" "SalePaymentStatus" NOT NULL DEFAULT 'PAID';
ALTER TABLE "sales" ADD COLUMN "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "sales" ADD COLUMN "amountDue" DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE "sales" ADD COLUMN "dueDate" TIMESTAMP(3);

-- Backfill existing sales as fully paid
UPDATE "sales" SET "amountPaid" = "total", "amountDue" = 0 WHERE "paymentStatus" = 'PAID';

-- CreateTable
CREATE TABLE "customer_payments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "saleId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "recordedById" UUID NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_payments_organizationId_idx" ON "customer_payments"("organizationId");
CREATE INDEX "customer_payments_customerId_idx" ON "customer_payments"("customerId");
CREATE INDEX "customer_payments_saleId_idx" ON "customer_payments"("saleId");

-- CreateIndex
CREATE INDEX "sales_organizationId_paymentStatus_idx" ON "sales"("organizationId", "paymentStatus");

-- AddForeignKey
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "customer_payments" ADD CONSTRAINT "customer_payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
