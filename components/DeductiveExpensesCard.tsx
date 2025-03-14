import {
  Card,
  Flex,
  type MantineColor,
  type MantineStyleProps,
  Text,
} from "@mantine/core";
import { useSnapshot } from "valtio";
import { BASE_CURRENCY, INCOME_INTERVALS, NEXT_YEAR } from "~/lib/config";
import {
  formatAsBaseCurrency,
  formatAsDecimal
} from "~/lib/format";
import { state } from "~/lib/state";
import type { ExchangeRates } from "~/lib/exchangeRates";
import { ExchangeRatesLoadingOverlay } from "./ExchangeRatesLoadingOverlay";
import { IncomePercentageRing } from "./IncomePercentageRing";

export type DeductiveExpensesCardProps = {
	accentColor: MantineColor;
	totalDeductibleExpensesPercentage: number | undefined;
	exchangeRatesLoading: boolean;
	exchangeRates?: ExchangeRates;
};

export function DeductiveExpensesCard({
	accentColor,
	totalDeductibleExpensesPercentage,
	exchangeRatesLoading,
	exchangeRates,
}: DeductiveExpensesCardProps) {
	const {
		incomeCurrency,
		incomeInterval,
		deductibleExpenses,
		deductibleExpensesCurrency
	} = useSnapshot(state);
	
	const textAlign: MantineStyleProps["ta"] = { base: "center", xs: "left" };
  
	return (
		<Card withBorder p="md" radius="md" pos="relative">
			<Flex
				direction={{ base: "column", xs: "row" }}
				align={{ base: "center", xs: "flex-start" }}
			>
				<ExchangeRatesLoadingOverlay
					exchangeRatesLoading={exchangeRatesLoading}
				/>
				<Flex
					direction="column"
					gap={{ base: "sm", xs: "lg" }}
					align={{ base: "center", xs: "flex-start" }}
				>
					<Text
						fw={700}
						fz={24}
						lh={1.25}
						mt={{ base: "xs", xs: "md" }}
						ta={textAlign}
					>
						Ai cheltuit în {NEXT_YEAR - 1}
					</Text>
					<div>
						<Text fz="sm" c="dimmed" ta={textAlign}>
							Suma de
						</Text>
						<Text fw={700} lh={1} c={accentColor} ta={textAlign} fz={36}>
							{deductibleExpensesCurrency === BASE_CURRENCY
								? formatAsBaseCurrency(deductibleExpenses)
								: formatAsBaseCurrency(deductibleExpenses * (exchangeRates?.[deductibleExpensesCurrency] || 0))}
						</Text>
					</div>
					{/* Show original currency when expense currency is not base currency */}
					{deductibleExpensesCurrency !== BASE_CURRENCY && (
						<div>
							<Text fz="sm" c="dimmed" ta={textAlign}>
								Adică
							</Text>
							<Text fw={700} lh={1} ta={textAlign} className="nowrap">
								{formatAsDecimal(deductibleExpenses)} {deductibleExpensesCurrency}
							</Text>
						</div>
					)}
					{/* Only show income currency equivalent if it's different from both base and expense currency */}
					{(incomeCurrency !== BASE_CURRENCY && incomeCurrency !== deductibleExpensesCurrency) && (
						<div>
							<Text fz="sm" c="dimmed" ta={textAlign}>
								Adică aproximativ
							</Text>
							<Text fw={700} lh={1} ta={textAlign} className="nowrap">
								{formatAsDecimal(
									deductibleExpenses && exchangeRates
										? deductibleExpensesCurrency === BASE_CURRENCY
											? deductibleExpenses / exchangeRates[incomeCurrency]
											: (deductibleExpenses * exchangeRates[deductibleExpensesCurrency]) / exchangeRates[incomeCurrency]
										: 0
								)}{" "}
								{incomeCurrency}
								{incomeInterval !== "yearly" &&
									` ${INCOME_INTERVALS.find((interval) => interval.value === incomeInterval)?.label}`}
							</Text>
						</div>
					)}
				</Flex>
				<IncomePercentageRing
					type="netIncome"
					value={totalDeductibleExpensesPercentage}
					color={accentColor}
				/>
			</Flex>
		</Card>
	);
}
