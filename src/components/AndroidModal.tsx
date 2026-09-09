import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, ExternalLink, Code2, Globe, Shield } from 'lucide-react';

interface AndroidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidModal: React.FC<AndroidModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const manifestSnippet = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.eventx.app">

    <!-- Permissions for WebView & Camera for QR check-in -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="EventX"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.EventX"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const mainActivitySnippet = `package com.eventx.app;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar progressBar;
    // Replace with your production domain or local container IP
    private static final String APP_URL = "https://eventx.app"; 

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true); // Enables localStorage for JWT auth
        webSettings.setDatabaseEnabled(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                progressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                // Handle offline or connectivity error
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
            }
        });

        webView.loadUrl(APP_URL);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_BACK) {
            if (webView.canGoBack()) {
                webView.goBack();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }
}`;

  const layoutSnippet = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:indeterminate="false"
        android:max="100"
        android:progressTint="#06b6d4" />

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:layout_below="@id/progressBar" />

</RelativeLayout>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                Android Studio WebView Integration Guide
              </h2>
              <p className="text-xs text-slate-400">
                Package EventX as a native mobile APK with responsive layout & local token storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Quick steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-white text-sm">Step 1</div>
              <p className="text-slate-400 mt-1">
                Create a new <strong>"Empty Views Activity"</strong> project in Android Studio (Kotlin or Java).
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-white text-sm">Step 2</div>
              <p className="text-slate-400 mt-1">
                Enable <code>DomStorageEnabled(true)</code> so JWT authentication persists in WebView localStorage.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="font-bold text-white text-sm">Step 3</div>
              <p className="text-slate-400 mt-1">
                Configure <code>INTERNET</code> permission and handle hardware back-button navigation.
              </p>
            </div>
          </div>

          {/* 1. AndroidManifest.xml */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                1. app/src/main/AndroidManifest.xml
              </span>
              <button
                onClick={() => copyCode('manifest', manifestSnippet)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
              >
                {copiedSection === 'manifest' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedSection === 'manifest' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {manifestSnippet}
            </pre>
          </div>

          {/* 2. MainActivity.java */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                2. app/src/main/java/.../MainActivity.java
              </span>
              <button
                onClick={() => copyCode('main', mainActivitySnippet)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
              >
                {copiedSection === 'main' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedSection === 'main' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {mainActivitySnippet}
            </pre>
          </div>

          {/* 3. activity_main.xml */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                3. app/src/main/res/layout/activity_main.xml
              </span>
              <button
                onClick={() => copyCode('layout', layoutSnippet)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800"
              >
                {copiedSection === 'layout' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedSection === 'layout' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {layoutSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
