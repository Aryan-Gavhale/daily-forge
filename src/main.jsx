import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import './index.css'

/*
 * HashRouter rather than BrowserRouter: an installed PWA opened from the home
 * screen has no server to rewrite deep links, and file:// previews need it too.
 *
 * reducedMotion="user" makes framer-motion drop transform and layout animation
 * when the OS asks for it. The CSS media query in index.css only covers CSS
 * transitions, which is half the animation in this app.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <App />
      </HashRouter>
    </MotionConfig>
  </React.StrictMode>
)
