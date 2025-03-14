'use client';

import { useSnapshot } from 'valtio';
import { DeductiveExpensesCard } from '~/components/DeductiveExpensesCard';
import { IncomeDetailsCard } from '~/components/IncomeDetailsCard';
import { InputCard } from '~/components/InputCard';
import { SettingsInfoCard } from '~/components/SettingsInfoCard';
import { TaxationDetailsCard } from '~/components/TaxationDetailsCard';
import { state } from '~/lib/state';
import { useTaxesCalculator } from '~/lib/taxes';

export default function HomePageContent() {
  const snap = useSnapshot(state);

  const {
    grossIncomeInBaseCurrency,
    totalTaxAmountInBaseCurrency,
    totalTaxPercentage,
    pensionTaxAmountInBaseCurrency,
    healthTaxAmountInBaseCurrency,
    incomeTaxAmountInBaseCurrency,
    netIncome,
    totalNetIncomeInBaseCurrency,
    exchangeRates,
    exchangeRatesLoading,
    totalNetTaxPercentage,
    totalDeductibleExpensesPercentage
  } = useTaxesCalculator(snap);

  // Regular accent color based on tax percentage
  const accentColor = totalTaxPercentage
    ? totalTaxPercentage > 100
      ? 'red'
      : totalTaxPercentage > 50
      ? 'orange'
      : 'blue'
    : 'blue';
    
  // Check if expenses are greater than income
  const expensesGreaterThanIncome = 
    grossIncomeInBaseCurrency !== undefined && 
    snap.deductibleExpenses !== undefined && 
    snap.deductibleExpensesCurrency !== undefined && 
    (snap.deductibleExpensesCurrency === 'RON' 
      ? snap.deductibleExpenses > grossIncomeInBaseCurrency
      : (snap.deductibleExpenses * (exchangeRates?.[snap.deductibleExpensesCurrency] || 0)) > grossIncomeInBaseCurrency);
      
  // Special accent color for IncomeDetailsCard when net income is negative
  const incomeDetailsAccentColor = 
    (totalNetIncomeInBaseCurrency !== undefined && totalNetIncomeInBaseCurrency < 0) || expensesGreaterThanIncome
      ? 'red'
      : accentColor;
      
  // Special accent color for DeductiveExpensesCard when expenses are greater than income
  const deductiveExpensesAccentColor = expensesGreaterThanIncome ? 'red' : accentColor;

  const grossIncomeOverVATThreshold =
    grossIncomeInBaseCurrency !== undefined && grossIncomeInBaseCurrency > snap.vatThreshold;

  return (
    <>
      <InputCard grossIncomeOverVATThreshold={grossIncomeOverVATThreshold} />
      <TaxationDetailsCard
        accentColor={accentColor}
        totalTaxAmountInBaseCurrency={totalTaxAmountInBaseCurrency}
        totalTaxPercentage={totalTaxPercentage}
        healthTaxAmountInBaseCurrency={healthTaxAmountInBaseCurrency}
        pensionTaxAmountInBaseCurrency={pensionTaxAmountInBaseCurrency}
        incomeTaxAmountInBaseCurrency={incomeTaxAmountInBaseCurrency}
        exchangeRatesLoading={exchangeRatesLoading}
      />

      {totalDeductibleExpensesPercentage! > 0 ? (
        <DeductiveExpensesCard
          accentColor={deductiveExpensesAccentColor}
          exchangeRatesLoading={exchangeRatesLoading}
          totalDeductibleExpensesPercentage={totalDeductibleExpensesPercentage}
          exchangeRates={exchangeRates}
        />
      ) : null}
      
      <IncomeDetailsCard
        accentColor={incomeDetailsAccentColor}
        totalNetIncomeInBaseCurrency={totalNetIncomeInBaseCurrency}
        netIncome={netIncome}
        grossIncomeInBaseCurrency={grossIncomeInBaseCurrency}
        totalNetTaxPercentage={totalNetTaxPercentage}
        exchangeRatesLoading={exchangeRatesLoading}
      />
      <SettingsInfoCard
        grossIncomeOverVATThreshold={grossIncomeOverVATThreshold}
        exchangeRatesLoading={exchangeRatesLoading}
        exchangeRates={exchangeRates}
      />
    </>
  );
}
