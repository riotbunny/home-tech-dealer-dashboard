import React, { useState } from 'react';
import { X, Link2, Check, AlertTriangle, FileSpreadsheet, RefreshCw, Layers, History } from 'lucide-react';
import { DEFAULT_SHEET_CSV_URL, DEFAULT_SHEET_HISTORICAL_URL } from '../config';
import { normalizeSheetUrl } from '../services/sheetService';

/**
 * Data Source Configuration Modal for Sheet 1 and Sheet 3
 */
export default function DataSourceModal({ 
  isOpen, 
  onClose, 
  currentSheet1Url, 
  currentSheet3Url, 
  onUpdateSheet1Url, 
  onUpdateSheet3Url, 
  onResetDefaults, 
  isLiveSheet1, 
  isLiveSheet3, 
  sheet1Error, 
  sheet3Error 
}) {
  const [activeTab, setActiveTab] = useState('sheet1'); // 'sheet1' | 'sheet3'
  const [inputSheet1Url, setInputSheet1Url] = useState(currentSheet1Url || DEFAULT_SHEET_CSV_URL);
  const [inputSheet3Url, setInputSheet3Url] = useState(currentSheet3Url || DEFAULT_SHEET_HISTORICAL_URL);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const currentInputUrl = activeTab === 'sheet1' ? inputSheet1Url : inputSheet3Url;
  const setInputUrl = (val) => {
    if (activeTab === 'sheet1') setInputSheet1Url(val);
    else setInputSheet3Url(val);
  };

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    const normalized = normalizeSheetUrl(rawVal);
    setInputUrl(normalized);
    setTestResult(null);
  };

  const handleSave = () => {
    const finalSheet1 = normalizeSheetUrl(inputSheet1Url);
    const finalSheet3 = normalizeSheetUrl(inputSheet3Url);
    onUpdateSheet1Url(finalSheet1);
    onUpdateSheet3Url(finalSheet3);
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const targetUrl = normalizeSheetUrl(currentInputUrl);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(targetUrl, { 
        method: 'GET', 
        headers: { 'Accept': 'text/csv, text/plain, */*' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const txt = await res.text();
        if (txt.includes('<!DOCTYPE html>') || txt.includes('<html')) {
          setTestResult({
            success: false,
            message: 'Endpoint returned HTML login page. Ensure "File > Share > Publish to web" is enabled.'
          });
        } else {
          setTestResult({
            success: true,
            message: `Connection verified! Successfully received ${txt.length} bytes of CSV data.`
          });
        }
      } else if (res.status === 404) {
        setTestResult({
          success: false,
          message: `HTTP Error 404: ${activeTab === 'sheet1' ? 'Sheet 1' : 'Sheet 3'} not found. Verify Sheet ID & publish settings.`
        });
      } else {
        setTestResult({
          success: false,
          message: `HTTP Error ${res.status}: ${res.statusText}`
        });
      }
    } catch (err) {
      let msg = err.message || 'Unable to connect to URL';
      if (err.name === 'AbortError' || msg.includes('aborted')) {
        msg = 'Connection timed out. Check network or verify Google Sheet access permissions.';
      }
      setTestResult({
        success: false,
        message: msg
      });
    } finally {
      setTesting(false);
    }
  };

  const isCurrentLive = activeTab === 'sheet1' ? isLiveSheet1 : isLiveSheet3;
  const currentError = activeTab === 'sheet1' ? sheet1Error : sheet3Error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Google Sheet Feeds Configuration</h2>
              <p className="text-xs text-slate-400">Manage Sheet 1 (Live Leads) & Sheet 3 (Historical Log)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-1 flex border-b border-slate-800 gap-2">
          <button
            onClick={() => { setActiveTab('sheet1'); setTestResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'sheet1'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Sheet 1 (Live Leads)</span>
          </button>

          <button
            onClick={() => { setActiveTab('sheet3'); setTestResult(null); }}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'sheet3'
                ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Sheet 3 (Historical Log)</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Status Alert */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            isCurrentLive 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}>
            {isCurrentLive ? (
              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                {isCurrentLive ? 'Live Feed Connected' : 'Sample / Fallback Mode Active'}
              </p>
              <p className="mt-0.5 opacity-90">
                {isCurrentLive 
                  ? `Data is parsing live from the configured Google ${activeTab === 'sheet1' ? 'Sheet 1' : 'Sheet 3'}.`
                  : (currentError || 'Using fallback leads dataset while waiting for valid public feed.')}
              </p>
            </div>
          </div>

          {/* URL Input Form */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              {activeTab === 'sheet1' ? 'Sheet 1 CSV Export URL (Live Leads):' : 'Sheet 3 CSV Export URL (Historical Daily Log):'}
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={currentInputUrl}
                onChange={handleInputChange}
                placeholder="Paste Google Sheet URL or CSV export link..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Environment Variable: <code className="text-emerald-400">{activeTab === 'sheet1' ? 'VITE_SHEET_CSV_URL' : 'VITE_SHEET_HISTORICAL_URL'}</code>
            </p>
          </div>

          {/* Test Connection Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing Feed...' : 'Test Connection'}</span>
            </button>
            <button
              onClick={() => {
                if (activeTab === 'sheet1') setInputSheet1Url(DEFAULT_SHEET_CSV_URL);
                else setInputSheet3Url(DEFAULT_SHEET_HISTORICAL_URL);
                onResetDefaults();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset to Default URL
            </button>
          </div>

          {/* Connection Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xs ${
              testResult.success 
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* Publish Instructions */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-300">Google Sheet Sharing Guide:</h4>
            <p className="text-[11px] leading-relaxed">
              Open your sheet &rarr; Click <strong>File &gt; Share &gt; Publish to web</strong> &rarr; Select <strong>{activeTab === 'sheet1' ? 'Sheet1' : 'Sheet3'}</strong> &rarr; choose <strong>Comma-separated values (.csv)</strong> &rarr; click <strong>Publish</strong>.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-850">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            Save URLs & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
