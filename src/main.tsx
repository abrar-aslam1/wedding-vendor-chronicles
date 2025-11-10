import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PostHogProvider } from '../app/providers/PostHogProvider'

createRoot(document.getElementById("root")!).render(
  <PostHogProvider>
    <App />
  </PostHogProvider>
);
