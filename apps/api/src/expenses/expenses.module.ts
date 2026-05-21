import { Module } from "@nestjs/common";

import { ExpenseCategoriesController } from "./expense-categories.controller";
import { ExpenseCategoriesService } from "./expense-categories.service";
import { ExpensesController } from "./expenses.controller";
import { ExpensesService } from "./expenses.service";

@Module({
  controllers: [ExpenseCategoriesController, ExpensesController],
  providers: [ExpenseCategoriesService, ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
