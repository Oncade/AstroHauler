Here's a step-by-step recipe to turn your React+Phaser project into a PWA that launches full-screen on mobile:

---

## 1. Add PWA meta tags & manifest

1. **Create** a `manifest.json` in your `public/` folder:

   ```jsonc
   {
     "name": "Astro Hauler",
     "short_name": "AstroHauler",
     "start_url": ".",
     "display": "standalone",
     "background_color": "#000000",
     "theme_color": "#000000",
     "orientation": "portrait",
     "icons": [
       {
         "src": "icons/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "icons/icon-512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

2. **Update** your existing `index.html` by adding the manifest link:

   ```html
   <!-- Add this line in the <head> section -->
   <link rel="manifest" href="/manifest.json" />
   
   <!-- Add this line for iOS icon support -->
   <link rel="apple-touch-icon" href="/icons/icon-192.png" />
   ```

   Note: Your index.html already has many of the required meta tags including:
   - viewport settings
   - apple-mobile-web-app-capable
   - mobile-web-app-capable

---

## 2. Provide your icons

1. **Create** an `icons` directory in your `public/` folder
2. **Generate** two PNG icons from your existing favicon:
   - 192×192 px icon for home screens
   - 512×512 px icon for splash screens
3. **Save** them as `icon-192.png` and `icon-512.png` in the `public/icons/` directory

---

## 3. Write a service-worker

**Create** `public/service-worker.js`:

```js
const CACHE_NAME = 'astro-hauler-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/style.css',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Include bundle files that will be generated at build time
  // These paths will depend on your Vite build output
  '/assets/index-*.js',
  '/assets/index-*.css',
  // Add game assets that should be available offline
  '/assets/sprites/...',
  '/assets/audio/...',
  // Add other game assets as needed
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(cached => cached || fetch(evt.request))
  );
});
```

---

## 4. Register the service-worker in your React app

**Update** your `src/main.tsx` file:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.error('SW failed:', err));
  });
}
```

---

## 5. (Optional) Add "Install" button to the game UI

If you'd like to add an "Install" button to your game UI, create a new React component:

```tsx
// src/components/InstallButton.tsx
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Update UI to show the install button
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  if (!isInstallable) return null;

  return (
    <button 
      onClick={handleInstallClick}
      style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        zIndex: 1000,
        padding: '8px 16px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Install App
    </button>
  );
}
```

Then add it to your App.tsx:

```tsx
import InstallButton from './components/InstallButton';

function App() {
  // Existing code...
  
  return (
    <>
      {/* Existing components */}
      <InstallButton />
    </>
  );
}
```

---

## 6. Build and test

1. **Build** your app:
   ```bash
   npm run build
   ```

2. **Test** locally:
   ```bash
   npx vite preview
   ```

3. **Check** for PWA compatibility:
   - Open Chrome DevTools
   - Go to Application > Manifest to verify manifest data
   - Go to Application > Service Workers to verify service worker registration
   - Run Lighthouse audit to check PWA score

4. **Deploy** to production:
   - Make sure you're serving over HTTPS
   - Test on mobile devices

---

## Implementation Checklist

- [x] Create manifest.json in public/
- [x] Create icons directory with 192px and 512px icons
- [x] Add manifest link to index.html
- [x] Add apple-touch-icon link to index.html
- [x] Create service-worker.js in public/
- [x] Register service worker in main.tsx
- [x] (Optional) Create InstallButton component
- [ ] Build and test locally
- [ ] Deploy to production

That's it! Your Astro Hauler game will now work as a full-featured PWA that can be installed on mobile devices and run offline.