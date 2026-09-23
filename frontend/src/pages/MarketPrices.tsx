import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMarketPrices } from '../services/marketService';
import type { MarketPriceResponse, MarketPriceItem } from '../types/market';
import {
  TrendingUp,
  Search,
  MapPin,
  RefreshCw,
  AlertCircle,
  Calendar,
  Building2,
  Tag,
  Info,
  ShieldCheck,
  ArrowUpDown,
  Filter
} from 'lucide-react';

const COMMON_CROPS = [
  'Wheat',
  'Rice',
  'Groundnut',
  'Cotton',
  'Maize',
  'Mustard',
  'Soybean',
  'Potato',
  'Tomato',
  'Onion',
  'Chickpea',
  'Sugarcane'
];

export default function MarketPrices() {
  const { user } = useAuth();

  // Filter state
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [hasInitializedCrop, setHasInitializedCrop] = useState<boolean>(false);

  // Data & loading state
  const [data, setData] = useState<MarketPriceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting state for results table
  const [sortField, setSortField] = useState<'price' | 'market' | 'date'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const loadPrices = async (cropFilter?: string, locationFilter?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMarketPrices(cropFilter, locationFilter);
      setData(res);
      if (!res.success && res.status === 'error') {
        setError(res.message || 'Market data is temporarily unavailable.');
      }
    } catch (err: any) {
      console.error('Market price load error:', err);
      if (err?.response?.status === 401) {
        setError('Your session has expired or requires authentication. Please log in again.');
      } else {
        setError('Market data is temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize crop filter with user's primary crop if available
  useEffect(() => {
    if (!hasInitializedCrop) {
      const initialCrop = user?.primary_crop?.trim() || '';
      setSelectedCrop(initialCrop);
      setHasInitializedCrop(true);
      loadPrices(initialCrop, '');
    }
  }, [user, hasInitializedCrop]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    loadPrices(selectedCrop, selectedLocation);
  };

  const handleReset = () => {
    const defaultCrop = user?.primary_crop?.trim() || '';
    setSelectedCrop(defaultCrop);
    setSelectedLocation('');
    loadPrices(defaultCrop, '');
  };

  const sortedResults = useMemo(() => {
    if (!data?.results || data.results.length === 0) return [];
    const list = [...data.results];
    return list.sort((a, b) => {
      if (sortField === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sortField === 'market') {
        return sortOrder === 'asc'
          ? a.market.localeCompare(b.market)
          : b.market.localeCompare(a.market);
      }
      if (sortField === 'date') {
        const dateA = a.date || '';
        const dateB = b.date || '';
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      }
      return 0;
    });
  }, [data, sortField, sortOrder]);

  const toggleSort = (field: 'price' | 'market' | 'date') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Market Prices
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Explore available agricultural market prices for your crops.
              </p>
            </div>
          </div>
        </div>

        {/* Source metadata & Refresh Button */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadPrices(selectedCrop, selectedLocation)}
            disabled={loading}
            id="refresh-market-btn"
            title="Refresh market prices"
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs hover:border-slate-300 transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Data Source & Timestamp Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Data source: <span className="font-semibold text-slate-800">{data?.source || 'Government Mandi Network (data.gov.in / Agmarknet)'}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {data?.last_updated
              ? `Last updated: ${data.last_updated}`
              : 'Source update time unavailable.'}
          </span>
        </div>
      </div>

      {/* 3. Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Price Filters</h3>
          </div>
          {user?.primary_crop && (
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Primary Crop: {user.primary_crop}
            </span>
          )}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5">
          {/* Crop Input / Selector */}
          <div className="lg:col-span-5 space-y-1">
            <label htmlFor="crop-input" className="block text-xs font-semibold text-slate-700">
              Crop / Commodity
            </label>
            <div className="relative">
              <input
                id="crop-input"
                type="text"
                list="common-crops-list"
                placeholder={user?.primary_crop ? `e.g. ${user.primary_crop}` : 'Select a crop to view market prices.'}
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <datalist id="common-crops-list">
                {COMMON_CROPS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            {!user?.primary_crop && !selectedCrop && (
              <p className="text-[11px] text-amber-600 mt-1">
                Select a crop to view market prices.
              </p>
            )}
          </div>

          {/* Location / Mandi Input */}
          <div className="lg:col-span-4 space-y-1">
            <label htmlFor="location-input" className="block text-xs font-semibold text-slate-700">
              Mandi / State / District <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="location-input"
                type="text"
                placeholder="e.g. Gujarat, Rajkot, or Punjab"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-3 flex items-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              id="search-prices-btn"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-60 h-[38px]"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Search Prices
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset filters to default"
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-colors h-[38px]"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Quick Crop Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <span className="font-medium mr-1 text-[11px] text-slate-400">Popular:</span>
          {COMMON_CROPS.slice(0, 7).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setSelectedCrop(c);
                loadPrices(c, selectedLocation);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedCrop.toLowerCase() === c.toLowerCase()
                  ? 'bg-emerald-100 text-emerald-800 font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SKELETON LOADING STATE */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-5 h-24" />
            ))}
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-64" />
        </div>
      )}

      {/* 5. ERROR STATE */}
      {!loading && error && (
        <div className="bg-white border border-rose-200 rounded-xl p-6 sm:p-8 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Market data is temporarily unavailable.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {error || 'Unable to connect to the external agricultural market data provider.'}
          </p>
          <button
            type="button"
            onClick={() => loadPrices(selectedCrop, selectedLocation)}
            className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 6. UNCONFIGURED STATE BANNER */}
      {!loading && !error && data && !data.configured && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Market data source is not configured yet.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-lg mx-auto leading-relaxed">
              To view real-time Agmarknet mandi rates across Indian APMCs without mock or fake prices, configure your free Open Government Data (data.gov.in) API key in the backend.
            </p>
          </div>

          <div className="bg-white border border-amber-200 rounded-lg p-4 text-left text-xs text-slate-700 space-y-2 max-w-lg mx-auto font-mono">
            <p className="font-semibold text-slate-900 font-sans">Configuration Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 font-sans">
              <li>Register free account at <span className="font-semibold text-primary-700">data.gov.in</span></li>
              <li>Obtain your API Key under My Account</li>
              <li>Add key to backend environment file:</li>
            </ol>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded text-[11px] overflow-x-auto">
              DATA_GOV_IN_API_KEY=your_registered_api_key_here
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Kisan Mitra AI strictly adheres to verified agricultural data. Fake or randomized commodity rates are never displayed.
          </p>
        </div>
      )}

      {/* 7. NO DATA STATE */}
      {!loading && !error && data && data.configured && data.results.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No market data found for the selected crop/location.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {selectedCrop
              ? `No current mandi arrivals recorded for "${selectedCrop}"${selectedLocation ? ` in "${selectedLocation}"` : ''}.`
              : 'Please enter or select a crop commodity to search latest available prices.'}
          </p>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCrop('Wheat');
                loadPrices('Wheat', selectedLocation);
              }}
              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              Try another crop
            </button>
            {selectedLocation && (
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation('');
                  loadPrices(selectedCrop, '');
                }}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
              >
                Try another location
              </button>
            )}
          </div>
        </div>
      )}

      {/* 8. PRICE SUMMARY METRICS (Calculated strictly from returned real data) */}
      {!loading && !error && data && data.summary && data.results.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Price Summary ({data.selected_crop || 'Selected Crop'})
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Based on {data.summary.total_records} reporting mandi records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Lowest Price */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Lowest Available Price
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  &#8377;{data.summary.lowest_price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ Quintal</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                Minimum reported arrival rate
              </span>
            </div>

            {/* Average Price */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Average Available Price
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-primary-700">
                  &#8377;{data.summary.average_price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ Quintal</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-1">
                Weighted modal rate average
              </span>
            </div>

            {/* Highest Price */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Highest Available Price
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  &#8377;{data.summary.highest_price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ Quintal</span>
              </div>
              <span className="text-[11px] text-blue-700 font-medium block mt-1">
                Peak reported arrival rate
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-1 italic">
            Calculated strictly from returned real APMC data. Does not forecast future trends or provide buy/sell recommendations.
          </p>
        </div>
      )}

      {/* 9. REAL PRICE RESULTS (Desktop Table + Mobile Cards) */}
      {!loading && !error && data && data.results.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Latest Available Market Data
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {sortedResults.length} mandi arrivals
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span>Sort by:</span>
              <button
                type="button"
                onClick={() => toggleSort('price')}
                className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center ${
                  sortField === 'price' ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-100'
                }`}
              >
                Price <ArrowUpDown className="w-3 h-3 ml-1" />
              </button>
              <button
                type="button"
                onClick={() => toggleSort('market')}
                className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center ${
                  sortField === 'market' ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-100'
                }`}
              >
                Mandi <ArrowUpDown className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th scope="col" className="px-5 py-3">Crop / Variety</th>
                  <th scope="col" className="px-5 py-3">Market / Mandi</th>
                  <th scope="col" className="px-5 py-3">District</th>
                  <th scope="col" className="px-5 py-3">State</th>
                  <th scope="col" className="px-5 py-3 text-right">Modal Price</th>
                  <th scope="col" className="px-5 py-3 text-right">Min - Max Range</th>
                  <th scope="col" className="px-5 py-3 text-right">Arrival Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedResults.map((item: MarketPriceItem, idx: number) => (
                  <tr key={`${item.market}-${item.crop}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>{item.crop}</div>
                      {item.variety && item.variety !== 'General' && (
                        <div className="text-[11px] font-normal text-slate-400">{item.variety}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.market}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{item.district || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{item.state || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                      &#8377;{item.price.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">/ Qtl</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500">
                      {item.min_price && item.max_price
                        ? `₹${item.min_price.toLocaleString('en-IN')} - ₹${item.max_price.toLocaleString('en-IN')}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-[11px]">
                      {item.date || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack */}
          <div className="md:hidden divide-y divide-slate-100">
            {sortedResults.map((item: MarketPriceItem, idx: number) => (
              <div key={`m-${item.market}-${item.crop}-${idx}`} className="p-4 space-y-2 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.crop}</h4>
                    {item.variety && item.variety !== 'General' && (
                      <span className="text-[11px] text-slate-500">{item.variety}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-primary-700">
                      &#8377;{item.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">per Quintal</span>
                  </div>
                </div>

                <div className="flex items-center text-xs text-slate-600 space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{item.market}</span>
                  {(item.district || item.state) && (
                    <span className="text-slate-400">
                      ({[item.district, item.state].filter(Boolean).join(', ')})
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                  <span>
                    Range:{' '}
                    {item.min_price && item.max_price
                      ? `₹${item.min_price} - ₹${item.max_price}`
                      : 'N/A'}
                  </span>
                  <span>{item.date || 'Recent arrival'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
