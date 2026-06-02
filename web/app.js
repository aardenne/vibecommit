// VibeCommit Web Demo - Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const diffInput = document.getElementById('diff-input');
  const vibeSelect = document.getElementById('vibe-select');
  const langSelect = document.getElementById('lang-select');
  const output = document.getElementById('output');
  const apiUrlInput = document.getElementById('api-url');
  const apiKeyInput = document.getElementById('api-key');
  const modelNameInput = document.getElementById('model-name');

  // Load saved config from localStorage
  const savedApiUrl = localStorage.getItem('vibecommit_api_url');
  const savedApiKey = localStorage.getItem('vibecommit_api_key');
  const savedModel = localStorage.getItem('vibecommit_model');
  
  if (savedApiUrl) apiUrlInput.value = savedApiUrl;
  if (savedApiKey) apiKeyInput.value = savedApiKey;
  if (savedModel) modelNameInput.value = savedModel;

  // Generate commit message
  generateBtn.addEventListener('click', async () => {
    const diff = diffInput.value.trim();
    const vibe = vibeSelect.value;
    const lang = langSelect.value;
    const baseUrl = apiUrlInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelNameInput.value.trim();

    if (!diff) {
      output.innerHTML = '<p class="placeholder">Please paste a git diff first!</p>';
      return;
    }

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Generating...';
    output.innerHTML = '<p class="loading">🔥 Analyzing diff and generating commit message...</p>';

    try {
      // Save config
      localStorage.setItem('vibecommit_api_url', baseUrl);
      localStorage.setItem('vibecommit_api_key', apiKey);
      localStorage.setItem('vibecommit_model', model);

      // Build the request
      const requestBody = {
        diff: diff,
        vibe: vibe,
        lang: lang,
        config: {
          baseUrl: baseUrl,
          apiKey: apiKey,
          model: model
        }
      };

      // Call the API (or use direct fetch if no backend)
      let response;
      try {
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
      } catch (fetchError) {
        // If backend is not available, show manual instructions
        throw new Error('Backend not available. Configure your OpenAI-compatible API in the environment variables.\n\nSee README.md for setup instructions.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Format the output
      output.innerHTML = formatCommitMessage(data.message);
      copyBtn.style.display = 'block';
      
    } catch (error) {
      output.innerHTML = `<p style="color: #fc8181;">❌ ${error.message}</p>`;
      console.error('Generation error:', error);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '🚀 Generate Commit Message';
    }
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    const text = output.innerText;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = '✅ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy to Clipboard';
      }, 2000);
    }).catch(() => {
      copyBtn.textContent = '❌ Failed';
    });
  });

  // Format commit message with proper styling
  function formatCommitMessage(message) {
    return `<pre style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</pre>`;
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
