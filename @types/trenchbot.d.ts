interface TrenchBotResponse {
  bonded: boolean;
  creatorAnalysis: {
    currentHoldings: number;
    holdingPercentage: number;
    riskLevel: string;
  };
  totalBundles: number;
  totalHoldingAmount: number;
  totalHoldingPercentage: number;
  totalPercentageBundled: number;
  totalSolSpent: number;
  totalTokensBundled: number;
}
