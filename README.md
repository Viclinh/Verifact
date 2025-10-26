# VeriFact - AI-Powered News Verification Extension

VeriFact is a comprehensive Chrome extension that uses advanced AI technology to help users identify misinformation, analyze news credibility, and make informed decisions about the content they consume online.

# How to Install VeriFact

## Prerequisites

### 1. Enable Chrome AI APIs
Before installing VeriFact, you need to enable Chrome's experimental AI features:

1. Open Chrome and go to `chrome://flags/`
2. Search for and enable these flags:
   - **"Prompt API for Gemini Nano"** → Set to **Enabled**
   - **"Gemini Nano"** → Set to **Enabled**
   - **"Summarizer API for Gemini Nano"** → Set to **Enabled**
   - **"Writer API for Gemini Nano"** → Set to **Enabled**
   - **"Rewriter API for Gemini Nano"** → Set to **Enabled**
   - **"Translator API for Gemini Nano"** → Set to **Enabled**
   - **"Proofreader API for Gemini Nano"** → Set to **Enabled**
3. **Restart Chrome** when prompted

### 2. Chrome Version Requirements
- **Chrome 127+** (Canary, Dev, or Beta channel recommended)
- **Desktop only** (Windows, macOS, Linux)

## Installation Steps

### Method 1: Load as Unpacked Extension (Developer Mode)

1. **Download VeriFact**
   - Clone or download the VeriFact repository
   - Extract to a folder on your computer

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle **"Developer mode"** in the top-right corner

4. **Load the Extension**
   - Click **"Load unpacked"**
   - Select the `news-detector` folder from VeriFact
   - VeriFact should appear in your extensions list

5. **Pin the Extension**
   - Click the icon in Chrome's toolbar
   - Find VeriFact and click the pin icon
   - VeriFact icon will now appear in your toolbar

## First-Time Setup

### 1. AI Model Download
- The first time you use VeriFact, Chrome will download the Gemini Nano model
- This is a **one-time download** (several GB)
- Download starts automatically after user interaction (clicking analyze)
- **Be patient** - initial download may take several minutes

### 2. Verify Installation
1. Click the VeriFact extension icon
2. You should see "✅ AI APIs ready" status
3. If you see warnings, ensure all Chrome flags are enabled

## How to Use VeriFact

### Quick Start
1. **Visit any news website**
2. **Look for the floating "✅ VeriFact" button** (appears automatically on news sites)
3. **Click the button** to analyze the current article
4. **Browse the analysis** using the three tabs (Overview, Content, Source)

### Alternative Methods
- **Extension Icon**: Click VeriFact icon → "Analyze Current Page"
- **Right-Click Menu**: Select text → "Verify with VeriFact"
- **Keyboard Shortcut**: Use extension popup for quick access

# Why Choose VeriFact?

In an era of information overload and misinformation, VeriFact empowers users to:
- Make informed decisions about news consumption
- Develop critical thinking skills for media literacy
- Save time by quickly identifying unreliable sources
- Contribute to a more informed digital society

# What VeriFact Does

VeriFact transforms how you consume news by providing instant, AI-powered analysis of any article or news content. With just one click, you get a complete breakdown of credibility, bias, and factual accuracy - helping you navigate today's complex information landscape with confidence.

# Key Features

## **Comprehensive Analysis**
- **Credibility Scoring** - AI evaluates source reliability and content quality
- **Political Bias Detection** - Identifies left/center/right political leanings
- **Fact vs Opinion Separation** - Distinguishes factual claims from subjective opinions
- **Sentiment Analysis** - Detects emotional manipulation and clickbait tactics

## **Source Verification**
- **Publisher Rating** - Rates news outlets from A+ to Unknown
- **Author Credibility Check** - Verifies journalist credentials and track record
- **Date Verification** - Flags outdated stories presented as current news
- **Trusted Source Database** - Cross-references with reliable news organizations

## **Content Enhancement**
- **Key Points Extraction** - Summarizes main claims in bullet points
- **Translation Support** - Auto-translates foreign language articles
- **Related Articles** - Suggests search terms for cross-referencing
- **Red Flag Detection** - Identifies suspicious content patterns

# How It Works

VeriFact leverages Chrome's built-in Gemini Nano AI model to perform on-device analysis, ensuring:
- **Privacy** - All analysis happens locally on your device
- **Speed** - Instant results without server delays
- **Reliability** - Works offline once the AI model is downloaded
- **Security** - No data sent to external servers

# Use Cases

## **For News Readers**
- Verify breaking news before sharing
- Understand political bias in articles
- Identify clickbait and sensationalized content
- Cross-reference claims with trusted sources

## **For Students & Researchers**
- Evaluate source credibility for academic work
- Separate facts from opinions in research materials
- Check publication dates and author credentials
- Find related coverage from multiple perspectives

## **For Social Media Users**
- Fact-check viral news stories
- Avoid spreading misinformation
- Understand bias in shared content
- Make informed sharing decisions

# User Interface

VeriFact features a clean, tabbed interface with three main sections:

1. **Overview Tab** - Publisher rating, credibility score, and bias analysis
2. **Content Tab** - Sentiment analysis, fact/opinion separation, and key points
3. **Source Tab** - Author credibility, date verification, and related articles

# Technical Features

- **Multi-API Integration** - Uses Prompt, Summarizer, and Translator APIs
- **Smart Content Detection** - Automatically identifies news websites
- **Contextual Analysis** - Right-click any text for instant verification
- **Floating Action Button** - Quick access on news sites
- **Responsive Design** - Works seamlessly across all websites

# Privacy & Security

- **100% Local Processing** - All AI analysis happens on your device
- **No Data Collection** - VeriFact doesn't store or transmit your browsing data
- **Open Source** - Transparent code for community review
- **Chrome Standards** - Built using official Chrome extension APIs


VeriFact isn't just a fact-checker - it's your personal AI assistant for navigating the modern information landscape with confidence and clarity.