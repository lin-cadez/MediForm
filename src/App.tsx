import "./App.css";
import Checklist from "./checklist/checklist";
import Selector from "./selector/selector";
import About from "./about/about";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { register } from "register-service-worker";

function App() {
  register('/service-worker.js', {
    ready() {
      console.log('App is being served from cache by a service worker.');
    },
    registered() {
      console.log('Service worker has been registered.');
    },
    cached() {
      console.log('Content has been cached for offline use.');
    },
    updatefound() {
      console.log('New content is downloading.');
    },
    updated() {
      console.log('New content is available; please refresh.');
    },
    offline() {
      console.log('No internet connection found. App is running in offline mode.');
    },
    error(error) {
      console.error('Error during service worker registration:', error);
    }
  });

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/checklist/*" element={<Checklist />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Selector />} />
          <Route path="*" element={<Selector />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
