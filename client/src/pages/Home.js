
import { Link } from 'react-router-dom';
import './Home.css'; // We'll create this too

function Home() {
  return (
    <div className="home-container">
      <div className="welcome-card">
        <h1>🌿 EcoTrack</h1>
        <p>Track your carbon footprint and help save the planet!</p>
        
        <div className="button-group">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
        
        <div className="features">
          <h3>Features:</h3>
          <ul>
            <li>🚗 Track transportation emissions</li>
            <li>⚡ Monitor energy usage</li>
            <li>📊 View your carbon statistics</li>
            <li>🎯 Set reduction goals</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
