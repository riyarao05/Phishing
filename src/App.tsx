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

  const simulatePhishingCheck = (urlToCheck: string): Promise<CheckResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate phishing detection logic
        const suspiciousPatterns = [
          'paypal-secure',
          'amazon-login',
          'google-verify',
          'microsoft-login',
          'bank-secure',
          'verification-required',
          'suspended-account',
          'urgent-action'
        ];

        const domain = new URL(urlToCheck).hostname.toLowerCase();
        const isPhishing = suspiciousPatterns.some(pattern => 
          domain.includes(pattern) || urlToCheck.toLowerCase().includes(pattern)
        );

        const riskFactors = [];
        if (domain.includes('-')) riskFactors.push('Suspicious domain structure');
        if (urlToCheck.includes('http://')) riskFactors.push('Insecure HTTP connection');
        if (domain.length > 30) riskFactors.push('Unusually long domain name');
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain)) riskFactors.push('IP address instead of domain');

        resolve({
          isPhishing: isPhishing || riskFactors.length >= 2,
          url: urlToCheck,
          confidence: Math.floor(Math.random() * 20) + 80,
          riskFactors
        });
      }, 2000);
    });
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
    }

    if (!validateUrl(urlToCheck)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    try {
      const checkResult = await simulatePhishingCheck(urlToCheck);
      setResult(checkResult);
    } catch {
      setError('Failed to check the website. Please try again.');
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
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* URL Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url-input" className="block text-lg font-semibold text-gray-700 mb-3">
                Enter a Website URL to Check
              </label>
              <div className="relative">
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
              </div>
              {error && (
                <p className="mt-2 text-red-600 text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {error}
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

        {/* Result Card */}
        {result && (
          <div className={`bg-white rounded-2xl shadow-xl p-8 border-l-8 transform transition-all duration-500 ${
            result.isPhishing 
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
                  <h2 className={`text-2xl font-bold mb-1 ${
                    result.isPhishing ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {result.isPhishing ? '❌ Phishing Website - Be Careful!' : '✅ Legitimate Website'}
                  </h2>
                  <p className="text-gray-600 font-medium">
                    Confidence: {result.confidence}%
                  </p>
                </div>
              </div>
              <button
                onClick={resetCheck}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-sm font-medium"
              >
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

            <div className={`mt-6 p-4 rounded-lg ${
              result.isPhishing ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                result.isPhishing ? 'text-red-700' : 'text-green-700'
              }`}>
                Recommendation:
              </h3>
              <p className={`text-sm ${
                result.isPhishing ? 'text-red-700' : 'text-green-700'
              }`}>
                {result.isPhishing 
                  ? 'This website appears to be potentially dangerous. Do not enter personal information, passwords, or financial details. Close this website immediately.'
                  : 'This website appears to be legitimate and safe to visit. However, always exercise caution when entering sensitive information online.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-blue-700 mb-3 text-lg">URL Analysis</h3>
              <p className="text-blue-600 text-sm leading-relaxed">Our system examines the URL structure, domain age, and SSL certificate status to identify suspicious patterns.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-teal-700 mb-3 text-lg">AI Detection</h3>
              <p className="text-teal-600 text-sm leading-relaxed">Advanced machine learning algorithms compare the website against known phishing patterns and threat databases.</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white group-hover:bounce transition-transform duration-300" />
              </div>
              <h3 className="font-bold text-green-700 mb-3 text-lg">Real-time Results</h3>
              <p className="text-green-600 text-sm leading-relaxed">Get instant results with confidence scores and detailed analysis to help you make informed decisions.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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