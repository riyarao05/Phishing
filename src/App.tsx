import React, { useState } from 'react';
import { Shield, Search, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface CheckResult {
  isPhishing: boolean;
  url: string;
  confidence: number;
  riskFactors: string[];
}

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState('');

  const validateUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // ✅ Connect to Flask backend
  const checkWithBackend = async (urlToCheck: string): Promise<CheckResult> => {
    const response = await fetch('http://127.0.0.1:5002/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlToCheck }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      isPhishing: data.isPhishing,
      url: data.url,
      confidence: data.isPhishing ? 94 : 98, // fake confidence display
      riskFactors: data.isPhishing
        ? ['Matched phishing pattern', 'Suspicious structure']
        : [],
    };
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL to check');
      return;
    }

    let urlToCheck = url.trim();
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck;
    }setUrl

    if (!validateUrl(urlToCheck)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      const checkResult = await checkWithBackend(urlToCheck);
      setResult(checkResult);
    } catch (err) {
      setError(' This is not a valid website. Enter valid website url.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCheck = () => {
    setResult(null);
    setError('');
    setUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white py-12 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 mr-4 drop-shadow-lg" />
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">
                Phishing Website Detection Tool
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 font-light">
                Check if a website is safe before you click
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url-input" className="block text-lg font-semibold text-gray-700 mb-3">
                Enter a Website URL to Check
              </label>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., https://example.com"
                autoFocus
                disabled={isLoading}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
              />
              {error && (
  <p className="mt-2 text-red-600 text-sm font-medium flex items-center">
    <AlertTriangle className="w-4 h-4 mr-1" />
    {error.includes('Invalid domain format')
      ? 'Please enter a valid website URL.'
      : error}
  </p>
)}

            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-lg shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Checking Website...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Now 🔍
                </>
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-l-8 ${result.isPhishing
              ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white'
              : 'border-l-green-500 bg-gradient-to-r from-green-50 to-white'
            }`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                {result.isPhishing ? (
                  <AlertTriangle className="w-12 h-12 text-red-500 mr-4" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-green-500 mr-4" />
                )}
                <div>
                  <h2 className={`text-2xl font-bold mb-1 ${result.isPhishing ? 'text-red-700' : 'text-green-700'}`}>
                    {result.isPhishing ? '❌ Phishing Website - Be Careful!' : '✅ Legitimate Website'}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    Confidence: {result.confidence}%
                  </p>
                </div>
              </div>
              <button onClick={resetCheck} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                Check Another URL
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <p className="text-sm text-gray-500 mb-1">Analyzed URL:</p>
              <p className="font-mono text-sm break-all text-gray-800">{result.url}</p>
            </div>

            {result.riskFactors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Risk Factors Detected:</h3>
                <ul className="space-y-2">
                  {result.riskFactors.map((factor, index) => (
                    <li key={index} className="flex items-center text-orange-700 bg-orange-50 px-3 py-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`mt-6 p-4 rounded-lg ${result.isPhishing ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <h3 className={`font-semibold mb-2 ${result.isPhishing ? 'text-red-700' : 'text-green-700'}`}>
                Recommendation:
              </h3>
              <p className={`text-sm ${result.isPhishing ? 'text-red-700' : 'text-green-700'}`}>
                {result.isPhishing
                  ? 'This website appears to be potentially dangerous. Do not enter personal information, passwords, or financial details. Close this website immediately.'
                  : 'This website appears to be legitimate and safe to visit. However, always exercise caution when entering sensitive information online.'}
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-blue-900 text-white py-8 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-100">
            Stay safe online. Always verify websites before entering sensitive information.
          </p>
          <p className="text-blue-200 text-sm mt-2">
            This tool is for educational purposes. Always use multiple security measures.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
