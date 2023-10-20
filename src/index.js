import React from 'react'
import {createRoot} from "react-dom/client"
import CustomTimeline from './CustomTimeline'
import 'react-calendar-timeline/lib/Timeline.css';
import './styles.css'

const App = () => (
  <div>
    <CustomTimeline />
  </div>
)

createRoot(
  document.getElementById("root")
).render(<App />)