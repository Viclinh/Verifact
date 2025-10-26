document.addEventListener('DOMContentLoaded', async () => {
  const statusDiv = document.getElementById('status');
  const analyzeBtn = document.getElementById('analyzeBtn');
  
  // Check AI API availability
  try {
    const [summarizerAvailable, promptAvailable] = await Promise.all([
      checkAPI('summarizer'),
      checkAPI('languageModel')
    ]);
    
    if (summarizerAvailable && promptAvailable) {
      statusDiv.innerHTML = '✅ AI APIs ready';
      statusDiv.style.background = '#d4edda';
      statusDiv.style.color = '#155724';
      analyzeBtn.disabled = false;
    } else {
      statusDiv.innerHTML = '⚠️ Some AI APIs unavailable';
      statusDiv.style.background = '#fff3cd';
      statusDiv.style.color = '#856404';
      analyzeBtn.disabled = false; // Still allow basic functionality
    }
  } catch (error) {
    statusDiv.innerHTML = '❌ AI APIs not available';
    statusDiv.style.background = '#f8d7da';
    statusDiv.style.color = '#721c24';
  }
  
  analyzeBtn.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'analyzeNews'});
      window.close();
    });
  });
});

async function checkAPI(apiName) {
  try {
    if (apiName === 'summarizer') {
      return await ai.summarizer.availability() !== 'no';
    } else if (apiName === 'languageModel') {
      return await LanguageModel.availability({ language: 'en' }) !== 'no';
    }
    return false;
  } catch (error) {
    return false;
  }
}