import { useEffect, useState } from 'react';
import { listTrades } from '../api/trades';
import { getAIInsight } from '../api/ai';
import type { Trade } from '../types/trade';
import TradeFilters from '../components/TradeFilters';
import type { FilterState } from '../components/TradeFilters';

const PRESET_QUESTIONS = [
  'How does this strategy perform across different market regimes?',
  'Which entry signature (Bull180/Bear180/Torpedo/Power Bar) has the best win rate?',
  'How do IB single break vs double break sessions compare in performance?',
  'What patterns do you see in my losing trades?',
  'Is my setup grading (A/B/C) correlated with actual outcomes?',
];

function AIInsights() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [question, setQuestion] = useState('');
  const [includeImage, setIncludeImage] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTrades({ isLive: false, ...filters }).then(setTrades).catch(() => setTrades([]));
  }, [filters]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(trades.map((t) => t.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const handleAnalyze = async () => {
    if (selectedIds.size === 0) {
      setError('Select at least one trade to analyze.');
      return;
    }
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const result = await getAIInsight(Array.from(selectedIds), question || undefined, includeImage);
      setInsight(result.insight);
      setModelUsed(result.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-insights-page">
      <h2>AI Insights</h2>
      <p className="page-subtitle">
        Claude analyzes your selected trades against the LBS strategy rules. Select trades below, optionally ask a specific question.
      </p>

      <TradeFilters filters={filters} onChange={setFilters} />

      <div className="ai-selection-bar">
        <span>{selectedIds.size} of {trades.length} trades selected</span>
        <button onClick={selectAll}>Select All</button>
        <button onClick={clearSelection}>Clear</button>
      </div>

      <div className="ai-trade-list">
        {trades.map((t) => (
          <label key={t.id} className="ai-trade-checkbox">
            <input
              type="checkbox"
              checked={selectedIds.has(t.id)}
              onChange={() => toggleSelect(t.id)}
            />
            <span>
              #{t.id} {t.instrument} {t.side} {t.sessionWindow ?? ''} {t.signature ?? ''} PnL={t.realizedPnl?.toFixed(2) ?? '-'}
            </span>
          </label>
        ))}
      </div>

      <div className="ai-question-box">
        <label>Question (optional)</label>
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask something specific, or leave blank for a general performance review..."
        />

        <div className="preset-questions">
          {PRESET_QUESTIONS.map((q) => (
            <button key={q} type="button" className="preset-btn" onClick={() => setQuestion(q)}>
              {q}
            </button>
          ))}
        </div>

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={includeImage}
            onChange={(e) => setIncludeImage(e.target.checked)}
          />
          Include chart screenshot from first selected trade that has one
        </label>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze with Claude'}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {insight && (
        <div className="ai-insight-result">
          <div className="ai-insight-header">
            <h3>Insight</h3>
            <span className="ai-model-tag">{modelUsed}</span>
          </div>
          <div className="ai-insight-text">{insight}</div>
        </div>
      )}
    </div>
  );
}

export default AIInsights;
