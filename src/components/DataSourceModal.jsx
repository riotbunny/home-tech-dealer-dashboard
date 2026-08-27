import React, { useState } from 'react';
import { X, Link2, Check, AlertTriangle, FileSpreadsheet, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react';
import { DEFAULT_SHEET_CSV_URL } from '../config';
import { normalizeSheetUrl } from '../services/sheetService';

/**
 * Data Source Configuration Modal
 */
export default function DataSourceModal({ isOpen, onClose, currentUrl, onUpdateUrl, onResetDefault, isLive, fetchError }) {
  const [inputUrl, setInputUrl] = useState(currentUrl || DEFAULT_SHEET_CSV_URL);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const rawVal = e.target.value;
    // Auto-normalize if user pastes a standard Google Sheets browser link
    const normalized = normalizeSheetUrl(rawVal);
    setInputUrl(normalized);
    setTestResult(null);
  };

  const handleSave = () => {
    const finalUrl = normalizeSheetUrl(inputUrl);
    onUpdateUrl(finalUrl);
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const targetUrl = normalizeSheetUrl(inputUrl);
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
            message: 'Endpoint returned HTML login page. Ensure "File > Share > Publish to web" is enabled, or "Anyone with the link can view".'
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
          message: 'HTTP Error 404: Sheet not found. Please verify the Sheet ID in the URL and ensure the sheet is published to the web.'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
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
              <h2 className="text-base font-bold text-white">Google Sheet Data Source</h2>
              <p className="text-xs text-slate-400">Live CSV Feed & Deployment Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Status Alert */}
          <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            isLive 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}>
            {isLive ? (
              <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{isLive ? 'Live Feed Connected' : 'Sample / Fallback Mode Active'}</p>
              <p className="mt-0.5 opacity-90">
                {isLive 
                  ? 'Data is being parsed live from the configured Google Sheet.'
                  : (fetchError || 'Using fallback leads dataset while waiting for valid public Google Sheet feed.')}
              </p>
            </div>
          </div>

          {/* URL Input Form */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Google Sheet CSV Export URL (Sheet 1 / gid=0):
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={inputUrl}
                onChange={handleInputChange}
                placeholder="Paste Google Sheet URL or CSV export link..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Default env variable: <code className="text-emerald-400">VITE_SHEET_CSV_URL</code>
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
                setInputUrl(DEFAULT_SHEET_CSV_URL);
                onResetDefault();
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

          {/* How to publish guide */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs text-slate-300">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <span>Google Sheet Public Sharing Setup:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>Open your Google Sheet and click <strong>File &gt; Share &gt; Publish to web</strong>.</li>
              <li>Under <em>Link</em>, select <strong>Sheet1</strong> and choose <strong>Comma-separated values (.csv)</strong>.</li>
              <li>Click <strong>Publish</strong> and copy the generated link.</li>
              <li>Alternatively ensure Sheet sharing is set to <em>"Anyone with the link can view"</em>.</li>
            </ol>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-850">
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
            Apply URL & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
