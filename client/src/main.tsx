import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from '@/routes/index.tsx'
import theme from '@/config/theme'

import '@/styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  </StrictMode>,
)
