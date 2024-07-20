import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/Pages/MainPage';
import RoomPage from './components/Pages/RoomPage';
import JoinPage from './components/Pages/JoinPage';
import AuthPage from './components/Pages/AuthPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/main" element = {<MainPage/>} />
        <Route path = "/join" element = {<JoinPage/>}/>
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
