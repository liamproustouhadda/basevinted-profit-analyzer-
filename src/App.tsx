import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Trash2, RefreshCw, Layers, Sparkles, Copy, Check, 
  LayoutDashboard, History, Settings, ShoppingBag, Plus, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { ItemPhoto, ItemAnalysis } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'comparator' | 'dashboard' | 'history' | 'settings'>('analyzer');
  const [photos, setPhotos] = useState<ItemPhoto[]>([]);
  const [purchasePrice, setPurchasePrice] = useState<number>(15);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ItemAnalysis | null>(null);
  const [analyzedItems, setAnalyzedItems] = useState<ItemAnalysis[]>([]);
  const [priceStrategySlider, setPriceStrategySlider] = useState<number>(50);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vinted_analyzer_history');
    if (saved) {
      try {
        setAnalyzedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Erreur de chargement:', e);
      }
    }
  }, []);

  const saveAnalysisToHistory = (item: ItemAnalysis) => {
    const updated = [item, ...analyzedItems];
    setAnalyzedItems(updated);
    localStorage.setItem('vinted_analyzer_history', JSON.stringify(updated));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (photos.length + files.length > 10) {
      setErrorMessage("Limite atteinte : vous ne pouvez pas ajouter plus de 10 photos par article.");
      return;
    }
    setErrorMessage(null);

    const newPhotos: ItemPhoto[] = files.map((file, idx) => ({
      id: 'photo_' + Date.now() + '_' + idx,
      url: URL.createObjectURL(file),
      file,
      isMain: photos.length === 0 && idx === 0
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (filtered.length > 0 && !filtered.some(p => p.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainPhoto = (id: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isMain: p.id === id })));
  };

  const handleRunAnalysis = async () => {
    if (photos.length === 0) {
      setErrorMessage("Veuillez ajouter au moins une photo pour lancer l'analyse.");
      return;
    }
    if (!purchasePrice || purchasePrice <= 0) {
      setErrorMessage("Veuillez indiquer un prix d'achat valide.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    // Simulation de traitement par l'IA
    setTimeout(() => {
      const brands = ['Nike', 'Adidas', 'Carhartt', 'Ralph Lauren', 'Zara'];
      const categories = ['Sweat & Pulls', 'Vestes & Manteaux', 'T-shirts', 'Pantalons'];
      const selectedBrand = brands[Math.floor(Math.random() * brands.length)];
      const selectedCategory = categories[Math.floor(Math.random() * categories.length)];

      const estimatedMin = Math.round(purchasePrice * 2.2);
      const estimatedMax = Math.round(purchasePrice * 3.2);
      const recommended = Math.round((estimatedMin + estimatedMax) / 2);
      const profitVal = recommended - purchasePrice;
      const roiVal = Math.round((profitVal / purchasePrice) * 100);

      const result: ItemAnalysis = {
        id: 'item_' + Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        photos: [...photos],
        brand: selectedBrand,
        model: 'Vintage Edition',
        category: selectedCategory,
        size: 'M',
        material: '100% Coton',
        condition: 'Très bon état',
        color: 'Noir',
        aiConfidence: 94,
        profit: {
          purchasePrice,
          estimatedPriceMin: estimatedMin,
          estimatedPriceMax: estimatedMax,
          recommendedPrice: recommended,
          quickSalePrice: Math.round(estimatedMin * 0.85),
          maxReasonablePrice: Math.round(estimatedMax * 1.15),
          profit: profitVal,
          margin: Math.round((profitVal / recommended) * 100),
          roi: roiVal,
          status: roiVal > 150 ? 'TRÈS RENTABLE' : 'RENTABLE'
        },
        market: {
          available: true,
          avgPrice: recommended - 2,
          minPrice: estimatedMin - 5,
          maxPrice: estimatedMax + 10,
          comparableItems: 128,
          observedSales: 42,
          demand: 'Élevée',
          competition: 'Moyenne'
        },
        score: {
          total: Math.min(99, Math.round(75 + (roiVal / 10))),
          explanation: `Article ${selectedBrand} à forte demande. Potentiel de vente rapide avec une marge confortable.`
        },
        listing: {
          title: `${selectedCategory.slice(0, -1)} ${selectedBrand} - Taille M - Excellent État`,
          description: `Superbe ${selectedCategory.toLowerCase()} ${selectedBrand}.\n- Couleur : Noir\n- Taille : M\n- État : Très bon état\n\nEnvoi soigné et rapide sous 24h !`,
          hashtags: [`#${selectedBrand.toLowerCase()}`, '#vinted', '#mode', '#streetwear']
        }
      };

      setCurrentAnalysis(result);
      saveAnalysisToHistory(result);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleCopyListing = () => {
    if (!currentAnalysis) return;
    const textToCopy = `${currentAnalysis.listing.title}\n\n${currentAnalysis.listing.description}\n\n${currentAnalysis.listing.hashtags.join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { setCurrentAnalysis(null); setActiveTab('analyzer'); }}>
            <div className="p-2 bg-emerald-500 rounded-xl text-slate-950 shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg text-white">Vinted Profit AI</span>
          </div>

          <nav className="flex space-x-1">
            {[
              { id: 'analyzer', label: 'Analyser', icon: Camera },
              { id: 'comparator', label: 'Comparateur', icon: Layers },
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'history', label: 'Historique', icon: History },
              { id: 'settings', label: 'Abonnement', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* CONTENU */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-300">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)}>✕</button>
          </div>
        )}

        {/* 1. ANALYSER */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            {!currentAnalysis ? (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-extrabold text-white">Analyse ton vêtement par IA</h1>
                  <p className="text-slate-400">Importe jusqu'à 10 photos pour une estimation précise.</p>
                </div>

                <div className="border-2 border-dashed border-slate-800 bg-slate-900/50 rounded-2xl p-8 text-center">
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} multiple accept="image/*" className="hidden" />
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 border border-slate-700">
                      <Camera className="w-8 h-8" />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg flex items-center space-x-2 mx-auto"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Ajouter des photos</span>
                    </button>
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h4 className="font-semibold text-slate-200">Photos sélectionnées ({photos.length}/10)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {photos.map((p) => (
                        <div key={p.id} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                          <img src={p.url} className="w-full h-full object-cover" />
                          {p.isMain && (
                            <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Principale
                            </span>
                          )}
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            {!p.isMain && (
                              <button onClick={() => setMainPhoto(p.id)} className="p-1.5 bg-slate-800 text-amber-400 rounded-lg">★</button>
                            )}
                            <button onClick={() => removePhoto(p.id)} className="p-1.5 bg-rose-500/80 text-white rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <label className="block font-semibold text-slate-200">Prix d'achat de l'article (€)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || photos.length === 0}
                  className="w-full py-4 bg-emerald-500 text-slate-950 font-extrabold text-lg rounded-2xl transition-all shadow-xl hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Analyse de {photos.length} photo(s) en cours...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>✨ Analyser mon article</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTATS */
              <div className="space-y-6">
                <button onClick={() => setCurrentAnalysis(null)} className="flex items-center space-x-2 text-slate-400 hover:text-white text-sm font-semibold">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Analyser un autre article</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Fiche Technique */}
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3 text-sm">
                    <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-3">🔎 Article identifié</h3>
                    <div className="flex justify-between py-1 border-b border-slate-800/50"><span className="text-slate-400">Marque :</span><span className="font-semibold">{currentAnalysis.brand}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50"><span className="text-slate-400">Catégorie :</span><span className="font-semibold">{currentAnalysis.category}</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50"><span className="text-slate-400">Taille :</span><span className="font-semibold">{currentAnalysis.size}</span></div>
                    <div className="flex justify-between py-1"><span className="text-slate-400">État :</span><span className="font-semibold">{currentAnalysis.condition}</span></div>
                  </div>

                  {/* Estimation financière */}
                  <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl text-white">💰 Rentabilité & Prix</h3>
                      <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                        🟢 {currentAnalysis.profit.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">Prix d'achat</span>
                        <span className="text-xl font-bold text-white">{currentAnalysis.profit.purchasePrice} €</span>
                      </div>
                      <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                        <span className="text-xs text-emerald-400 block font-semibold">Prix conseillé</span>
                        <span className="text-2xl font-extrabold text-emerald-400">{currentAnalysis.profit.recommendedPrice} €</span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">Profit potentiel</span>
                        <span className="text-xl font-bold text-emerald-400">+{currentAnalysis.profit.profit} €</span>
                      </div>
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block">ROI</span>
                        <span className="text-xl font-bold text-teal-400">{currentAnalysis.profit.roi} %</span>
                      </div>
                    </div>

                    {/* Generateur d'annonce */}
                    <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-sm">✨ Annonce Vinted</h4>
                        <button onClick={handleCopyListing} className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1">
                          {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copySuccess ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold">{currentAnalysis.listing.title}</p>
                      <p className="text-xs text-slate-400 whitespace-pre-line">{currentAnalysis.listing.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. COMPARATEUR */}
        {activeTab === 'comparator' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">🏆 Comparateur multi-articles</h1>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Article</th>
                    <th className="p-4">Marque</th>
                    <th className="p-4 text-right">Prix Achat</th>
                    <th className="p-4 text-right">Prix Conseillé</th>
                    <th className="p-4 text-right">Profit</th>
                    <th className="p-4 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {analyzedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="p-4 font-semibold text-white">{item.category}</td>
                      <td className="p-4">{item.brand}</td>
                      <td className="p-4 text-right">{item.profit.purchasePrice} €</td>
                      <td className="p-4 text-right font-bold text-white">{item.profit.recommendedPrice} €</td>
                      <td className="p-4 text-right font-bold text-emerald-400">+{item.profit.profit} €</td>
                      <td className="p-4 text-right font-bold text-teal-400">{item.profit.roi} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">📊 Tableaux de bord</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Articles Analysés</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{analyzedItems.length}</span>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 block">Profit Potentiel</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
                  {analyzedItems.reduce((acc, i) => acc + i.profit.profit, 0)} €
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. HISTORIQUE */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">📜 Historique des analyses</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyzedItems.map((item) => (
                <div key={item.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white">{item.brand} - {item.category}</h4>
                  <p className="text-xs text-emerald-400 font-bold">Profit : +{item.profit.profit} € (ROI {item.profit.roi}%)</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. ABONNEMENTS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-extrabold text-white">Tarifs & Offres</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-xl">Gratuit</h3>
                <p className="text-3xl font-black">0 €</p>
                <p className="text-xs text-slate-400">5 analyses par mois</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500 space-y-4">
                <h3 className="font-bold text-xl text-emerald-400">Pro</h3>
                <p className="text-3xl font-black text-white">19,99 € <span className="text-xs font-normal">/mois</span></p>
                <p className="text-xs text-slate-400">Analyses illimitées & comparateur</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
