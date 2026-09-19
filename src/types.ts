export interface ItemPhoto {
  id: string;
  url: string;
  file?: File;
  isMain: boolean;
}

export interface MarketData {
  available: boolean;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  comparableItems: number;
  observedSales: number;
  demand: 'Faible' | 'Moyenne' | 'Élevée' | 'Très élevée';
  competition: 'Faible' | 'Moyenne' | 'Élevée';
}

export interface ProfitAnalysis {
  purchasePrice: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  recommendedPrice: number;
  quickSalePrice: number;
  maxReasonablePrice: number;
  profit: number;
  margin: number;
  roi: number;
  status: 'TRÈS RENTABLE' | 'RENTABLE' | 'FAIBLE RENTABILITÉ' | 'NON RENTABLE';
}

export interface ScoreBreakdown {
  total: number;
  explanation: string;
}

export interface VintedListing {
  title: string;
  description: string;
  hashtags: string[];
}

export interface ItemAnalysis {
  id: string;
  date: string;
  photos: ItemPhoto[];
  brand: string;
  model: string;
  category: string;
  size: string;
  material: string;
  condition: string;
  color: string;
  aiConfidence: number;
  profit: ProfitAnalysis;
  market: MarketData;
  score: ScoreBreakdown;
  listing: VintedListing;
}
