/**
 * PoultryCockpit - Business Engine Calculation Boundary
 * Module 2 Domain Formulas Execution Engine
 */

import { DailyLogRecord, LiftingRecord } from '../types';

export interface BatchCalculationSummary {
  daysInHouse: number;
  currentLiveBirds: number;
  totalMortality: number;
  totalCulls: number;
  totalFeedConsumedKg: number;
  totalWaterConsumedLiters: number;
  totalLiftedBirds: number;
  totalLiftedWeightKg: number;
  avgFinalWeightKg: number;
  cumulativeFcr: number | null;
  mortalityPct: number;
  adgGrams: number | null;
}

export interface SettlementCalculationSummary {
  totalFeedCost: number;
  totalChickCost: number;
  totalProductionCost: number;
  productionCostPerKg: number;
  totalGcAmount: number;
  netSettlementAmount: number;
}

export const BusinessEngineCalculations = {
  calculateBatchSummary(
    chicksPlaced: number,
    dailyLogs: DailyLogRecord[],
    liftings: LiftingRecord[]
  ): BatchCalculationSummary {
    const daysInHouse = dailyLogs.length > 0 ? Math.max(...dailyLogs.map((l) => l.day_in_house)) : 0;
    const totalMortality = dailyLogs.reduce((acc, l) => acc + (l.mortality_count || 0), 0);
    const totalCulls = dailyLogs.reduce((acc, l) => acc + (l.culls_count || 0), 0);
    const totalFeedConsumedKg = dailyLogs.reduce((acc, l) => acc + (l.feed_consumed_kg || 0), 0);
    const totalWaterConsumedLiters = dailyLogs.reduce((acc, l) => acc + (l.water_consumed_liters || 0), 0);

    const totalLiftedBirds = liftings.reduce((acc, l) => acc + (l.birds_lifted || 0), 0);
    const totalLiftedWeightKg = liftings.reduce((acc, l) => acc + (l.total_weight_kg || 0), 0);

    const currentLiveBirds = Math.max(0, chicksPlaced - totalMortality - totalCulls - totalLiftedBirds);

    const mortalityPct = chicksPlaced > 0 ? +((totalMortality / chicksPlaced) * 100).toFixed(2) : 0;

    const latestLogWithWeight = [...dailyLogs]
      .sort((a, b) => b.day_in_house - a.day_in_house)
      .find((l) => l.avg_body_weight_grams > 0);

    const latestAvgWeightGrams = latestLogWithWeight ? latestLogWithWeight.avg_body_weight_grams : 0;
    const avgFinalWeightKg = totalLiftedBirds > 0
      ? +(totalLiftedWeightKg / totalLiftedBirds).toFixed(3)
      : +(latestAvgWeightGrams / 1000).toFixed(3);

    const totalBiomassKg = totalLiftedWeightKg > 0
      ? totalLiftedWeightKg
      : (currentLiveBirds * latestAvgWeightGrams) / 1000;

    const cumulativeFcr = totalBiomassKg > 0 ? +(totalFeedConsumedKg / totalBiomassKg).toFixed(2) : null;

    const adgGrams = daysInHouse > 0 && latestAvgWeightGrams > 0
      ? +((latestAvgWeightGrams - 42) / daysInHouse).toFixed(1)
      : null;

    return {
      daysInHouse,
      currentLiveBirds,
      totalMortality,
      totalCulls,
      totalFeedConsumedKg,
      totalWaterConsumedLiters,
      totalLiftedBirds,
      totalLiftedWeightKg,
      avgFinalWeightKg,
      cumulativeFcr,
      mortalityPct,
      adgGrams,
    };
  },

  calculateSettlementSummary(
    feedKg: number,
    feedRatePerKg: number,
    chicksPlaced: number,
    chickRatePerBird: number,
    medicineCost: number,
    gcRatePerKg: number,
    totalWeightLiftedKg: number,
    additions: number,
    deductions: number
  ): SettlementCalculationSummary {
    const totalFeedCost = feedKg * feedRatePerKg;
    const totalChickCost = chicksPlaced * chickRatePerBird;
    const totalProductionCost = totalFeedCost + totalChickCost + medicineCost;
    const productionCostPerKg = totalWeightLiftedKg > 0 ? +(totalProductionCost / totalWeightLiftedKg).toFixed(2) : 0;
    const totalGcAmount = totalWeightLiftedKg * gcRatePerKg;
    const netSettlementAmount = totalGcAmount + additions - deductions;

    return {
      totalFeedCost,
      totalChickCost,
      totalProductionCost,
      productionCostPerKg,
      totalGcAmount,
      netSettlementAmount,
    };
  },
};
