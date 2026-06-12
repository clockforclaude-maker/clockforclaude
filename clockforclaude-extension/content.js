// content.js - Client-side context injection for claude.ai

let currentUrl = window.location.href;
let hasAutoInjectedThisChat = false;

// Dynamic Selector Configuration
let activeSelectors = {
  editor: 'div[contenteditable="true"], div.ProseMirror, div[role="textbox"]'
};

async function loadRemoteSelectors() {
  try {
    const cached = await chrome.storage.local.get('remote_selectors');
    if (cached && cached.remote_selectors && cached.remote_selectors.editor) {
      activeSelectors = cached.remote_selectors;
    }
  } catch (e) {}

  try {
    const configUrl = "https://raw.githubusercontent.com/clockforclaude-maker/clockforclaude/main/selectors.json";
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(configUrl, { signal: id.signal });
    clearTimeout(id);
    const data = await response.json();
    if (data && data.editor) {
      activeSelectors = data;
      await chrome.storage.local.set({ remote_selectors: data });
    }
  } catch (err) {}
}

loadRemoteSelectors();

// Check settings from storage
async function getSettings() {
  const defaults = {
    enabled: true,
    autoInjectMode: 'first',
    includeWeather: true,
    includeOffPeak: true
  };
  const settings = await chrome.storage.local.get();
  const merged = { ...defaults, ...settings };
  if (merged.premium_status !== 'premium') {
    merged.autoInjectMode = 'manual';
  }
  return merged;
}

// Check if current URL represents a new chat
function isNewChatUrl() {
  const path = window.location.pathname;
  // Claude paths: "/" or "/new" or empty path is a new chat
  return path === '/' || path === '/new' || path.startsWith('/new-');
}

// Reset injection flag on URL change
function handleUrlChange() {
  const newUrl = window.location.href;
  if (newUrl !== currentUrl) {
    currentUrl = newUrl;
    if (isNewChatUrl()) {
      hasAutoInjectedThisChat = false;
      console.log("ClockForClaude: New chat detected, resetting auto-inject flag.");
    }
  }
}

// Monitor URL changes in SPA
setInterval(handleUrlChange, 500);

// Check and perform auto-injection if editor is focused and empty
async function checkPolledAutoInject(editor) {
  if (document.activeElement !== editor) return;

  const content = editor.innerText || editor.textContent || "";
  const cleanContent = content.replace(/^\[Horodatage\s*(?:système|:[^\]]+)\]/, "").trim();
  
  // If the editor is completely empty OR contains ONLY the timestamp
  const isEditorEmpty = content.trim() === "";
  const isOnlyTimestamp = cleanContent === "";
  
  if (!isEditorEmpty && !isOnlyTimestamp) return; // User has typed content, do not auto-inject/auto-update

  const settings = await getSettings();
  if (!settings.enabled) return;

  if (settings.autoInjectMode === 'all') {
    const response = await chrome.runtime.sendMessage({ action: "get_full_context" });
    if (response && response.context) {
      performInjection(editor, response.context, false);
    }
  } else if (settings.autoInjectMode === 'first') {
    const shouldInject = !hasAutoInjectedThisChat && isNewChatUrl();
    const shouldUpdate = hasAutoInjectedThisChat && isNewChatUrl() && isOnlyTimestamp;
    
    if (shouldInject || shouldUpdate) {
      const response = await chrome.runtime.sendMessage({ action: "get_full_context" });
      if (response && response.context) {
        performInjection(editor, response.context, false);
        if (shouldInject) {
          hasAutoInjectedThisChat = true;
        }
      }
    }
  }
}

function setupInjections() {
  // Find Claude's input editor using active dynamic selectors
  const editor = document.querySelector(activeSelectors.editor);

  if (!editor) return;

  // Add right padding so text doesn't flow under our floating buttons
  editor.style.setProperty('padding-right', '145px', 'important');

  // Check for auto-inject on empty focused inputs (handles SPA transitions where focus is retained)
  checkPolledAutoInject(editor);

  // Find the closest ancestor container that represents the visual input box
  // (typically a fieldset or form) to avoid clipping due to overflow:hidden on text wrappers
  const container = editor.closest('fieldset') || editor.closest('form') || editor.closest('.relative') || editor.parentElement;
  if (!container) return;

  // Ensure container has relative positioning so our absolute badge aligns correctly
  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === 'static') {
    container.style.position = 'relative';
  }

  // Check if our badge is already present
  const existingBadge = container.querySelector('.c4c-badge-container');
  if (existingBadge) {
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    existingBadge.classList.toggle('c4c-dark', isDark);
    updatePills(existingBadge, editor);
    return;
  }

  // Create badge element
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'c4c-badge-container';
  const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  badgeContainer.classList.toggle('c4c-dark', isDark);

  const btnInject = document.createElement('button');
  btnInject.className = 'c4c-btn-inject';
  const tooltipText = chrome.i18n.getMessage('tooltipInject') || 'Injecter le contexte temporel actuel';
  const clockText = chrome.i18n.getMessage('btnClock') || '🕒 Clock';
  btnInject.setAttribute('data-tooltip', tooltipText);
  btnInject.innerHTML = `
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    <span>${clockText}</span>
  `;

  // Visual auto-inject indicator if enabled
  getSettings().then(settings => {
    if (!settings.enabled) {
      badgeContainer.style.display = 'none';
      return;
    }
    
    if (settings.autoInjectMode === 'first' || settings.autoInjectMode === 'all') {
      const autoIndicator = document.createElement('span');
      autoIndicator.className = 'c4c-auto-indicator';
      autoIndicator.innerHTML = `⚡ AUTO`;
      const tooltipMsg = settings.autoInjectMode === 'first'
        ? (chrome.i18n.getMessage('autoIndicatorTooltipFirst') || 'Injection automatique active (Premier message)')
        : (chrome.i18n.getMessage('autoIndicatorTooltipAll') || 'Injection automatique active (Chaque message)');
      autoIndicator.title = tooltipMsg;
      badgeContainer.appendChild(autoIndicator);
    }
  });

  btnInject.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    btnInject.classList.add('c4c-success');
    btnInject.querySelector('span').textContent = chrome.i18n.getMessage('btnInjected') || 'Injecté !';
    
    try {
      const response = await chrome.runtime.sendMessage({ action: "get_full_context" });
      if (response && response.context) {
        performInjection(editor, response.context, true); // forceReplace = true
      }
    } catch (err) {
      console.error("ClockForClaude: Message error:", err);
    }

    setTimeout(() => {
      btnInject.classList.remove('c4c-success');
      btnInject.querySelector('span').textContent = chrome.i18n.getMessage('btnClock') || '🕒 Clock';
    }, 1500);
  });

  badgeContainer.appendChild(btnInject);
  container.appendChild(badgeContainer);
  updatePills(badgeContainer, editor);

  // Setup auto-inject on focus
  editor.addEventListener('focus', handleEditorFocus);
}

// Perform injection inside the contenteditable area safely updating React state
function performInjection(editor, contextText, forceReplace = false) {
  editor.focus();
  
  const content = editor.innerText || editor.textContent || "";
  const hasTimestamp = content.includes('[Horodatage système]') || content.includes('[Horodatage :');
  
  if (hasTimestamp) {
    const cleanContent = content.replace(/^\[Horodatage\s*(?:système|:[^\]]+)\]/, "").trim();
    const isOnlyTimestamp = cleanContent === "";
    
    if (forceReplace || isOnlyTimestamp) {
      if (replaceExistingTimestamp(editor, contextText)) {
        return;
      }
    }
    console.log("ClockForClaude: Context already injected, skipping.");
    return;
  }

  // Move cursor to start of text area
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(true); // collapse to start
  selection.removeAllRanges();
  selection.addRange(range);

  // Insert context block with linebreaks
  const textToInsert = contextText + "\n\n";
  document.execCommand('insertText', false, textToInsert);
  console.log("ClockForClaude: Context injected successfully.");
}

// Helper to replace the existing timestamp without affecting the rest of the text or selection
function replaceExistingTimestamp(editor, newTimestamp) {
  function getFirstTextNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }
    for (let child of node.childNodes) {
      const found = getFirstTextNode(child);
      if (found) return found;
    }
    return null;
  }

  const firstTextNode = getFirstTextNode(editor);
  if (!firstTextNode) return false;

  const text = firstTextNode.nodeValue;
  const match = text.match(/^\[Horodatage\s*(?:système|:[^\]]+)\]/);
  if (!match) return false;

  const oldTimestamp = match[0];
  if (oldTimestamp === newTimestamp) {
    return true; // Already up-to-date
  }

  const oldTimestampLength = oldTimestamp.length;
  
  // Create range for the old timestamp
  const range = document.createRange();
  range.setStart(firstTextNode, 0);
  range.setEnd(firstTextNode, oldTimestampLength);
  
  // Save current selection to restore it
  const selection = window.getSelection();
  const originalRanges = [];
  for (let i = 0; i < selection.rangeCount; i++) {
    originalRanges.push(selection.getRangeAt(i).cloneRange());
  }
  
  // Select the old timestamp
  selection.removeAllRanges();
  selection.addRange(range);
  
  // Replace via execCommand
  document.execCommand('insertText', false, newTimestamp);
  
  // Restore original selection
  selection.removeAllRanges();
  for (let origRange of originalRanges) {
    if (origRange.startContainer === firstTextNode) {
      let newStart = origRange.startOffset;
      if (origRange.startOffset >= oldTimestampLength) {
        newStart += (newTimestamp.length - oldTimestampLength);
      }
      let newEnd = origRange.endOffset;
      if (origRange.endOffset >= oldTimestampLength) {
        newEnd += (newTimestamp.length - oldTimestampLength);
      }
      try {
        origRange.setStart(firstTextNode, Math.max(0, newStart));
        origRange.setEnd(firstTextNode, Math.max(0, newEnd));
      } catch (e) {
        // Range adjustment error fallback
      }
    }
    selection.addRange(origRange);
  }
  return true;
}

// Handle auto-inject/update when user focuses the editor
async function handleEditorFocus(e) {
  const editor = e.target;
  checkPolledAutoInject(editor);
}

async function updatePills(badgeContainer, editor) {
  let pillsWrapper = badgeContainer.querySelector('.c4c-pills-wrapper');
  
  const settings = await getSettings();
  const isPremium = settings.premium_status === 'premium';
  
  if (!isPremium || !settings.enabled) {
    if (pillsWrapper) pillsWrapper.remove();
    editor.style.setProperty('padding-right', '145px', 'important');
    return;
  }

  if (!pillsWrapper) {
    pillsWrapper = document.createElement('div');
    pillsWrapper.className = 'c4c-pills-wrapper';
    pillsWrapper.style.display = 'flex';
    pillsWrapper.style.gap = '4px';
    pillsWrapper.style.alignItems = 'center';
    pillsWrapper.style.marginRight = '6px';
    badgeContainer.insertBefore(pillsWrapper, badgeContainer.querySelector('.c4c-btn-inject'));
  }

  const quickPrompts = settings.quick_prompts || [];
  const currentPromptTexts = Array.from(pillsWrapper.querySelectorAll('.c4c-pill')).map(p => p.textContent);
  const match = currentPromptTexts.length === quickPrompts.length && currentPromptTexts.every((val, i) => val === quickPrompts[i]);
  
  if (match) return;

  pillsWrapper.innerHTML = '';
  quickPrompts.forEach(promptText => {
    const pill = document.createElement('button');
    pill.className = 'c4c-pill';
    pill.textContent = promptText;
    pill.title = promptText;
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      injectTextAtCursor(editor, promptText);
    });
    pillsWrapper.appendChild(pill);
  });

  const estimatedWidth = 145 + (quickPrompts.length * 85);
  editor.style.setProperty('padding-right', `${estimatedWidth}px`, 'important');
}

function injectTextAtCursor(editor, text) {
  editor.focus();
  document.execCommand('insertText', false, text);
}

// Run polling to support SPA dynamic rendering
setInterval(setupInjections, 1000);
console.log("ClockForClaude: Content script loaded.");

