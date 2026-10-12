import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Search, 
  Trash2, 
  RotateCcw, 
  Download, 
  Cpu, 
  Code2, 
  Calculator, 
  Play, 
  FileText,
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { HistoryItem, Language, WorkspaceTab } from '../../types';
import { translations } from '../../i18n/translations';
import { getHistory, deleteHistoryItem, clearAllHistory } from '../../services/history';

interface HistoryManagerProps {
  language: Language;
  onRestoreSession: (item: HistoryItem) => void;
}

export const HistoryManager: React.FC<HistoryManagerProps> = ({
  language,
  onRestoreSession
}) => {
  const t = translations[language];

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'circuit' | 'code' | 'calculation' | 'simulation'>('all');

  const refreshHistory = () => {
    setItems(getHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    refreshHistory();
  };

  const handleClearAll = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من مسح كافة الجلسات المحفوظة؟' : 'Are you sure you want to clear all history?')) {
      clearAllHistory();
      refreshHistory();
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_circuits_history_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'circuit': return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'code': return <Code2 className="w-4 h-4 text-indigo-400" />;
      case 'calculation': return <Calculator className="w-4 h-4 text-emerald-400" />;
      case 'simulation': return <Play className="w-4 h-4 text-cyan-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <HistoryIcon className="w-7 h-7 text-blue-400" />
            <span>{t.historyTitle}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.historySub}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export History (.json)</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearHistory}</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchHistory}
            className="w-full ps-9 pe-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all' as const, label: t.filterAll },
            { id: 'circuit' as const, label: t.filterCircuits },
            { id: 'code' as const, label: t.filterCode },
            { id: 'calculation' as const, label: 'Calculations' },
            { id: 'simulation' as const, label: t.filterSim },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* History Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
          <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {t.noHistory}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 max-w-2xl font-sans">
                    {item.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onRestoreSession(item)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.openSession}</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title={t.deleteItem}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
