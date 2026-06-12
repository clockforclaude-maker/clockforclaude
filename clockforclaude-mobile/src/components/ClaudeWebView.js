// ClaudeWebView.js - WebView wrapper for claude.ai with ClockForClaude injections

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildFullContextString } from '../services/contextService';

const ClaudeWebView = forwardRef(({ settings, onInjectSuccess }, ref) => {
  const webViewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    injectText: (text) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          action: "inject_text",
          text: text
        }));
      }
    }
  }));

  const editorSelector = settings.remoteSelector || 'div[contenteditable="true"], div.ProseMirror, div[role="textbox"]';

  // Injected JavaScript that runs inside the WebView context
  const injectedJS = `
    (function() {
      let currentUrl = window.location.href;
      let hasAutoInjectedThisChat = false;

      function isNewChatUrl() {
        const path = window.location.pathname;
        return path === '/' || path === '/new' || path.startsWith('/new-');
      }

      function handleUrlChange() {
        const newUrl = window.location.href;
        if (newUrl !== currentUrl) {
          currentUrl = newUrl;
          if (isNewChatUrl()) {
            hasAutoInjectedThisChat = false;
            window.ReactNativeWebView.postMessage(JSON.stringify({ action: "log", message: "New chat URL detected." }));
          }
        }
      }
      setInterval(handleUrlChange, 500);

      // Perform context text injection into Claude's contenteditable
      function performInjection(editor, contextText) {
        editor.focus();
        const content = editor.innerText || editor.textContent || "";
        if (content.includes('[Horodatage système]')) {
          return;
        }

        // Place cursor at the start
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        // Safely trigger React input handlers
        document.execCommand('insertText', false, contextText + '\\n\\n');
      }

      // Handle message events sent from Native App React Native code
      window.addEventListener('message', function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.action === "inject_context") {
            const editor = document.querySelector(\`${editorSelector}\`);
            if (editor) {
              performInjection(editor, data.context);
              if (data.source === 'focus') {
                hasAutoInjectedThisChat = true;
              }
              
              // Trigger button success effect
              const btn = document.querySelector('.c4c-btn-inject');
              if (btn) {
                btn.style.background = 'rgba(16, 185, 129, 0.3)';
                btn.style.borderColor = '#10b981';
                const span = btn.querySelector('span');
                if (span) span.textContent = 'Injecté !';
                
                setTimeout(() => {
                  btn.style.background = 'rgba(26, 28, 46, 0.85)';
                  btn.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  if (span) span.textContent = '🕒 Clock';
                }, 1500);
              }
            }
          } else if (data.action === "inject_text") {
            const editor = document.querySelector(\`${editorSelector}\`);
            if (editor) {
              editor.focus();
              document.execCommand('insertText', false, data.text);
            }
          }
        } catch(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ action: "error", message: e.message }));
        }
      });

      // Inject floating UI button
      function setupInjections() {
        const editor = document.querySelector(\`${editorSelector}\`);
        if (!editor) return;

        const container = editor.parentElement;
        if (!container) return;

        // Position helper
        const computedStyle = window.getComputedStyle(container);
        if (computedStyle.position === 'static') {
          container.style.position = 'relative';
        }

        if (container.querySelector('.c4c-badge-container')) return;

        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'c4c-badge-container';
        badgeContainer.style.cssText = 'position: absolute; top: 8px; right: 8px; z-index: 100; display: flex; align-items: center; gap: 6px; font-family: sans-serif;';

        const btnInject = document.createElement('button');
        btnInject.className = 'c4c-btn-inject';
        btnInject.style.cssText = 'background: rgba(26, 28, 46, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.12); color: #a5b4fc; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); transition: all 0.2s;';
        btnInject.innerHTML = '<span>🕒 Clock</span>';

        btnInject.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.ReactNativeWebView.postMessage(JSON.stringify({ action: "request_context", source: "click" }));
        });

        badgeContainer.appendChild(btnInject);
        container.appendChild(badgeContainer);

        // Setup auto-inject focus trigger
        editor.addEventListener('focus', function() {
          if (${settings.autoInjectMode === 'first' ? '!hasAutoInjectedThisChat && isNewChatUrl()' : settings.autoInjectMode === 'all'}) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              action: "request_context",
              source: "focus"
            }));
          }
        });
      }

      setInterval(setupInjections, 1000);
    })();
    true;
  `;

  // Handle messages received from WebView
  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.action === "request_context") {
        console.log(`Mobile: Received context request from WebView (${data.source})`);
        
        // Build the system context string natively
        const contextStr = await buildFullContextString(settings);
        
        if (contextStr) {
          // Send it back to the webview
          const messageObj = {
            action: "inject_context",
            context: contextStr,
            source: data.source
          };
          webViewRef.current.postMessage(JSON.stringify(messageObj));
          
          if (onInjectSuccess) {
            onInjectSuccess(data.source);
          }
        }
      } else if (data.action === "log") {
        console.log("WebView Log:", data.message);
      } else if (data.action === "error") {
        console.error("WebView Error:", data.message);
      }
    } catch (err) {
      console.error("Failed to parse WebView message:", err);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://claude.ai/' }}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        style={styles.webview}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" // Spoof mobile safari for clean UI
      />
    </View>
  );
});

export default ClaudeWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0b10',
  },
  webview: {
    flex: 1,
  },
});
