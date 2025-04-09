interface GetMetadataResponse {
  mint: string;
  name: string;
  symbol: string;
  description: string;
  imageUri: string;
  metadataUri: string;
  twitter: string;
  telegram: string;
  bondingCurve: string;
  associatedBondingCurve: string;
  creator: string;
  createdTimestamp: number;
  raydiumPool: string | null;
  complete: boolean;
  virtualSolReserves: number;
  virtualTokenReserves: number;
  totalSupply: number;
  website: string;
  showName: boolean;
  kingOfTheHillTimestamp: number;
  marketCap: number;
  replyCount: number;
  lastReply: number;
  nsfw: boolean;
  marketId: string | null;
  usdMarketCap: number;
}
