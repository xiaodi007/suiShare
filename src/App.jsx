// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Splash from './pages/splash';
import Home from './pages/home';
import Test from './pages/test';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Home />} />
        {/* <Route path="/app/*" element={<Home />} /> */}
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
};

export default App;
