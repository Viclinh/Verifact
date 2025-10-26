class NewsCredibilityChecker {
  constructor() {
    this.trustedSources = [
      'reuters.com', 'apnews.com', 'bbc.com', 'npr.org',
      'snopes.com', 'politifact.com', 'factcheck.org'
    ];
    this.init();
  }

  init() {
    this.addFloatingButton();
    this.listenForMessages();
  }

  addFloatingButton() {
    if (this.isNewsWebsite()) {
      const button = document.createElement('div');
      button.id = 'news-checker-btn';
      button.innerHTML = '✅ VeriFact';
      button.onclick = () => this.analyzeCurrentPage();
      document.body.appendChild(button);
    }
  }

  isNewsWebsite() {
    const newsKeywords = ['news', 'article', 'story', 'breaking', 'report'];
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    return newsKeywords.some(keyword => url.includes(keyword) || title.includes(keyword));
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "analyzeNews") {
        this.analyzeNews(message.selectedText);
      }
    });
  }

  async analyzeNews(selectedText = null) {
    const content = selectedText || this.extractArticleContent();
    if (!content) return;

    this.showLoadingIndicator();
    
    try {
      const analysis = await this.performAIAnalysis(content);
      this.displayResults(analysis);
    } catch (error) {
      this.showError(error.message);
    }
  }

  async analyzeCurrentPage() {
    const content = this.extractArticleContent();
    if (!content) {
      this.showError("No article content found on this page");
      return;
    }
    await this.analyzeNews();
  }

  extractArticleContent() {
    const selectors = [
      'article', '[role="article"]', '.article-content', '.post-content',
      '.entry-content', '.story-body', 'main p'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.innerText.slice(0, 2000); // Limit content length
      }
    }
    
    // Fallback: get all paragraphs
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .map(p => p.innerText)
      .join(' ');
    return paragraphs.slice(0, 2000);
  }

  async performAIAnalysis(content) {
    const [credibilityScore, biasAnalysis, factOpinionSeparation, sentimentAnalysis, keyPoints, translation] = await Promise.all([
      this.getCredibilityScore(content),
      this.analyzeBias(content),
      this.separateFactsOpinions(content),
      this.analyzeSentiment(content),
      this.extractKeyPoints(content),
      this.translateIfNeeded(content)
    ]);
    
    const sourceCheck = this.checkSource();
    const dateVerification = this.verifyDate();
    const authorCredibility = this.checkAuthorCredibility();
    const publisherRating = this.ratePublisher();
    const relatedArticles = await this.findRelatedArticles(content);
    
    return {
      credibilityScore,
      biasAnalysis,
      factOpinionSeparation,
      sentimentAnalysis,
      keyPoints,
      translation,
      sourceCheck,
      dateVerification,
      authorCredibility,
      publisherRating,
      relatedArticles,
      redFlags: this.detectRedFlags(content)
    };
  }

  async getSummary(content) {
    try {
      if (typeof ai === 'undefined' || await ai.summarizer.availability() === 'no') {
        throw new Error('Summarizer API not available');
      }
      
      const summarizer = await ai.summarizer.create();
      return await summarizer.summarize(content);
    } catch (error) {
      return "Summary unavailable: " + error.message;
    }
  }

  async getCredibilityScore(content) {
    try {
      if (await LanguageModel.availability({ language: 'en' }) === 'no') {
        throw new Error('Language Model API not available');
      }

      const session = await LanguageModel.create({
        initialPrompts: [{
          role: 'system',
          content: 'You are a fact-checking expert. Provide clear, bullet-pointed analysis of news credibility.'
        }],
        language: 'en'
      });

      const prompt = `Analyze this news content for credibility. Format your response as follows:

CREDIBILITY RATING: [HIGH/MEDIUM/LOW]

KEY FINDINGS:
• [Main credibility indicator 1]
• [Main credibility indicator 2]
• [Main credibility indicator 3]

SOURCE ANALYSIS:
• [Source reliability assessment]
• [Publication type and reputation]

CONTENT QUALITY:
• [Factual evidence assessment]
• [Language and bias indicators]
• [Verification status]

RECOMMendation: [Brief recommendation]

Content: ${content}`;

      const response = await session.prompt(prompt);
      session.destroy();
      
      return this.formatAnalysisResponse(response);
    } catch (error) {
      return "Credibility analysis unavailable: " + error.message;
    }
  }

  checkSource() {
    const domain = window.location.hostname.toLowerCase();
    const isTrusted = this.trustedSources.some(source => domain.includes(source));
    
    return {
      domain,
      isTrusted,
      status: isTrusted ? 'Trusted Source' : 'Unknown Source - Verify Independently'
    };
  }

  detectRedFlags(content) {
    const flags = [];
    const text = content.toLowerCase();
    
    // Check for emotional language
    const emotionalWords = ['shocking', 'unbelievable', 'outrageous', 'scandal', 'exposed'];
    if (emotionalWords.some(word => text.includes(word))) {
      flags.push('Contains emotional language');
    }
    
    // Check for all caps
    if (content.match(/[A-Z]{10,}/)) {
      flags.push('Excessive use of capital letters');
    }
    
    // Check for lack of sources
    if (!text.includes('source') && !text.includes('according to')) {
      flags.push('No sources cited');
    }
    
    return flags;
  }

  showLoadingIndicator() {
    this.removeExistingResults();
    const loader = document.createElement('div');
    loader.id = 'news-checker-loader';
    loader.innerHTML = '✅ VeriFact analyzing...';
    document.body.appendChild(loader);
  }

  displayResults(analysis) {
    this.removeExistingResults();
    
    const resultsPanel = document.createElement('div');
    resultsPanel.id = 'news-checker-results';
    resultsPanel.innerHTML = `
      <div class="results-header">
        <h3>✅ VeriFact Analysis</h3>
        <button onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      
      <div class="analysis-tabs">
        <button class="tab-btn active" onclick="this.showTab('overview')">Overview</button>
        <button class="tab-btn" onclick="this.showTab('content')">Content</button>
        <button class="tab-btn" onclick="this.showTab('source')">Source</button>
      </div>
      
      <div class="tab-content" id="overview-tab">
        <div class="publisher-rating">
          <strong>🏢 Publisher Rating:</strong>
          <div class="rating-badge ${analysis.publisherRating.rating.toLowerCase()}">${analysis.publisherRating.rating}</div>
          <span>${analysis.publisherRating.type} | ${analysis.publisherRating.bias} Bias</span>
        </div>
        
        <div class="credibility-score">
          <strong>🤖 AI Credibility Analysis:</strong>
          <div class="score-content">${this.formatAnalysisResponse(analysis.credibilityScore)}</div>
        </div>
        
        <div class="bias-analysis">
          <strong>📈 Political Bias Analysis:</strong>
          <div class="analysis-content">${this.formatAnalysisResponse(analysis.biasAnalysis)}</div>
        </div>
      </div>
      
      <div class="tab-content hidden" id="content-tab">
        <div class="sentiment-analysis">
          <strong>📈 Sentiment Analysis:</strong>
          <div class="analysis-content">${this.formatAnalysisResponse(analysis.sentimentAnalysis)}</div>
        </div>
        
        <div class="fact-opinion">
          <strong>🎯 Fact vs Opinion:</strong>
          <div class="analysis-content">${this.formatAnalysisResponse(analysis.factOpinionSeparation)}</div>
        </div>
        
        <div class="key-points">
          <strong>📝 Key Points:</strong>
          <div class="analysis-content">${this.formatAnalysisResponse(analysis.keyPoints)}</div>
        </div>
        
        ${analysis.translation ? `
          <div class="translation">
            <strong>🌍 Translation:</strong>
            <div class="analysis-content">${analysis.translation}</div>
          </div>
        ` : ''}
      </div>
      
      <div class="tab-content hidden" id="source-tab">
        <div class="source-info">
          <strong>Domain:</strong> ${analysis.sourceCheck.domain}
          <span class="${analysis.sourceCheck.isTrusted ? 'trusted' : 'unknown'}">
            ${analysis.sourceCheck.status}
          </span>
        </div>
        
        <div class="date-verification">
          <strong>📅 Date Verification:</strong>
          <span class="${analysis.dateVerification.isOutdated ? 'outdated' : 'recent'}">
            ${analysis.dateVerification.status}
          </span>
          ${analysis.dateVerification.date ? `<br>Published: ${analysis.dateVerification.date}` : ''}
        </div>
        
        <div class="author-credibility">
          <strong>👤 Author Credibility:</strong>
          <div class="credibility-badge ${analysis.authorCredibility.status.toLowerCase()}">
            ${analysis.authorCredibility.status}
          </div>
          <div>Author: ${analysis.authorCredibility.author}</div>
        </div>
        
        <div class="related-articles">
          <strong>🔗 Find Related Coverage:</strong>
          <div class="analysis-content">${this.formatAnalysisResponse(analysis.relatedArticles)}</div>
        </div>
      </div>
      
      ${analysis.redFlags.length > 0 ? `
        <div class="red-flags">
          <strong>⚠️ Red Flags:</strong>
          <ul>${analysis.redFlags.map(flag => `<li>${flag}</li>`).join('')}</ul>
        </div>
      ` : ''}
    `;
    
    document.body.appendChild(resultsPanel);
    this.initializeTabs();
  }

  showError(message) {
    this.removeExistingResults();
    const error = document.createElement('div');
    error.id = 'news-checker-error';
    error.innerHTML = `❌ Error: ${message}`;
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 5000);
  }

  async analyzeBias(content) {
    try {
      const session = await LanguageModel.create({ language: 'en' });
      const prompt = `Analyze the political bias of this content. Rate as LEFT, CENTER-LEFT, CENTER, CENTER-RIGHT, or RIGHT and explain why:\n\n${content.slice(0, 1000)}`;
      const response = await session.prompt(prompt);
      session.destroy();
      return response;
    } catch (error) {
      return "Bias analysis unavailable";
    }
  }

  async separateFactsOpinions(content) {
    try {
      const session = await LanguageModel.create({ language: 'en' });
      const prompt = `Separate facts from opinions in this content. List FACTS and OPINIONS separately:\n\n${content.slice(0, 1000)}`;
      const response = await session.prompt(prompt);
      session.destroy();
      return response;
    } catch (error) {
      return "Fact/Opinion analysis unavailable";
    }
  }

  async analyzeSentiment(content) {
    try {
      const headline = document.querySelector('h1, .headline, .title')?.innerText || document.title;
      const session = await LanguageModel.create({ language: 'en' });
      const prompt = `Analyze the emotional manipulation in this headline and content. Rate sentiment and identify manipulation tactics:\n\nHeadline: ${headline}\nContent: ${content.slice(0, 500)}`;
      const response = await session.prompt(prompt);
      session.destroy();
      return response;
    } catch (error) {
      return "Sentiment analysis unavailable";
    }
  }

  async extractKeyPoints(content) {
    try {
      const session = await LanguageModel.create({ language: 'en' });
      const prompt = `Extract the main claims and key points from this article as bullet points:\n\n${content.slice(0, 1500)}`;
      const response = await session.prompt(prompt);
      session.destroy();
      return response;
    } catch (error) {
      return "Key points extraction unavailable";
    }
  }

  async translateIfNeeded(content) {
    try {
      if (typeof ai !== 'undefined' && await ai.translator.availability() !== 'no') {
        const language = this.detectLanguage(content);
        if (language !== 'en') {
          const translator = await ai.translator.create({
            sourceLanguage: language,
            targetLanguage: 'en'
          });
          return await translator.translate(content.slice(0, 1000));
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  detectLanguage(content) {
    const commonWords = {
      'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no'],
      'fr': ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir'],
      'de': ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich']
    };
    
    const words = content.toLowerCase().split(/\s+/).slice(0, 50);
    let maxMatches = 0;
    let detectedLang = 'en';
    
    for (const [lang, commonWordsList] of Object.entries(commonWords)) {
      const matches = words.filter(word => commonWordsList.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLang = lang;
      }
    }
    
    return detectedLang;
  }

  verifyDate() {
    const dateElements = document.querySelectorAll('time, .date, .published, [datetime]');
    let articleDate = null;
    
    for (const element of dateElements) {
      const dateText = element.getAttribute('datetime') || element.innerText;
      const date = new Date(dateText);
      if (!isNaN(date.getTime())) {
        articleDate = date;
        break;
      }
    }
    
    if (articleDate) {
      const daysDiff = (new Date() - articleDate) / (1000 * 60 * 60 * 24);
      return {
        date: articleDate.toLocaleDateString(),
        daysOld: Math.floor(daysDiff),
        isOutdated: daysDiff > 30,
        status: daysDiff > 30 ? 'Potentially Outdated' : 'Recent'
      };
    }
    
    return { status: 'Date not found' };
  }

  checkAuthorCredibility() {
    const authorElements = document.querySelectorAll('.author, .byline, [rel="author"]');
    const author = authorElements[0]?.innerText?.trim() || 'Unknown';
    
    // Basic credibility indicators
    const hasAuthor = author !== 'Unknown';
    const hasContact = document.querySelector('[href^="mailto:"]') !== null;
    const hasBio = document.querySelector('.author-bio, .bio') !== null;
    
    let credibilityScore = 0;
    if (hasAuthor) credibilityScore += 3;
    if (hasContact) credibilityScore += 2;
    if (hasBio) credibilityScore += 2;
    
    return {
      author,
      score: credibilityScore,
      status: credibilityScore >= 5 ? 'High' : credibilityScore >= 3 ? 'Medium' : 'Low',
      indicators: { hasAuthor, hasContact, hasBio }
    };
  }

  ratePublisher() {
    const domain = window.location.hostname.toLowerCase();
    
    const publisherRatings = {
      'reuters.com': { rating: 'A+', type: 'Wire Service', bias: 'Center' },
      'apnews.com': { rating: 'A+', type: 'Wire Service', bias: 'Center' },
      'bbc.com': { rating: 'A', type: 'Public Broadcaster', bias: 'Center-Left' },
      'npr.org': { rating: 'A', type: 'Public Radio', bias: 'Center-Left' },
      'cnn.com': { rating: 'B', type: 'Cable News', bias: 'Left' },
      'foxnews.com': { rating: 'B', type: 'Cable News', bias: 'Right' },
      'nytimes.com': { rating: 'A-', type: 'Newspaper', bias: 'Center-Left' },
      'wsj.com': { rating: 'A-', type: 'Newspaper', bias: 'Center-Right' }
    };
    
    const rating = publisherRatings[domain] || { rating: 'Unknown', type: 'Unknown', bias: 'Unknown' };
    
    return {
      domain,
      ...rating,
      isTrusted: this.trustedSources.some(source => domain.includes(source))
    };
  }

  async findRelatedArticles(content) {
    try {
      const session = await LanguageModel.create({ language: 'en' });
      const prompt = `Based on this article content, suggest 3-5 search terms to find related coverage from other news sources:\n\n${content.slice(0, 500)}`;
      const response = await session.prompt(prompt);
      session.destroy();
      return response;
    } catch (error) {
      return "Related articles search unavailable";
    }
  }

  formatAnalysisResponse(response) {
    // First, handle section headers and subsection headers
    let formatted = response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^## (.*?)$/gm, '<div class="section-header">$1</div>')
      .replace(/^([A-Z\s]+):$/gm, '<div class="subsection-header">$1:</div>');
    
    // Split bullet points that appear mid-line and create proper breaks
    formatted = formatted.replace(/\*\s+([^*]+?)(?=\*|$)/g, '<div class="analysis-point">$1</div>');
    
    // Handle remaining formatting
    formatted = formatted
      .replace(/\n\n+/g, '<div class="section-break"></div>')
      .replace(/\n(?=\s*[A-Z\s]+:)/g, '<div class="section-break"></div>')
      .replace(/\n/g, '<br>');
    
    return formatted;
  }

  initializeTabs() {
    window.showTab = (tabName) => {
      // Hide all tabs
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      
      // Show selected tab
      document.getElementById(`${tabName}-tab`).classList.remove('hidden');
      event.target.classList.add('active');
    };
  }

  removeExistingResults() {
    ['#news-checker-results', '#news-checker-loader', '#news-checker-error']
      .forEach(selector => {
        const element = document.querySelector(selector);
        if (element) element.remove();
      });
  }
}

// Initialize the news checker
new NewsCredibilityChecker();