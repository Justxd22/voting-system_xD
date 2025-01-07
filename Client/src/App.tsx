import { useState } from "react";
import Card from "./components/VoteCard";
import AdvertCard from "./components/AdvertCard";
import { voteOptions } from "./data/VoteeData";
import "./assets/styles/Card.css";
import "./assets/styles/Navbar.css";
import "./assets/styles/background-styles.css";
import "./assets/styles/Footer.css";

function App() {
  const [currentPage, setCurrentPage] = useState<"vote" | "results">("vote");
  const [results] = useState(
    voteOptions.map((option) => ({
      option: option.name,
      count: Math.floor(Math.random() * 100), // Placeholder data
    }))
  );

  const ResultsContent = () => {
    const sortedResults = [...results].sort((a, b) => b.count - a.count);
    const maxVotes = Math.max(...sortedResults.map((r) => r.count), 1);

    return (
      <div className="results-section">
        <div className="results-grid">
          {sortedResults.map((result) => (
            <div key={result.option} className="result-card">
              <div className="result-header">
                <span>{result.option}</span>
                <span>{result.count}</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar"
                  style={{
                    width: `${(result.count / maxVotes) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
          <p className="total-votes">
            Total votes:{" "}
            {sortedResults.reduce((sum, result) => sum + result.count, 0)}
          </p>
        </div>
      </div>
    );
  };

  const VoteContent = () => (
    <div className="card-grid">
      {voteOptions.map((option, index) => (
        <Card
          key={index}
          imageSrc={`https://raw.githubusercontent.com/Madiocre/vote-images/main/${option.imageSrc}`}
          name={option.name}
          description={option.description}
          youtubeLink={option.youtubeLink}
          facebookLink={option.facebookLink}
          onClick={() =>
            alert("Voting functionality will be implemented soon!")
          }
        />
      ))}
    </div>
  );

  return (
    <div className="container">
      <div className="background-container">
        {[...Array(20)].map((_, index) => (
          <div
            key={index}
            className={`background-line background-line-${index + 1}`}
          />
        ))}
      </div>

      <nav className="navbar">
        <button
          className={`nav-link ${currentPage === "vote" ? "active" : ""}`}
          onClick={() => setCurrentPage("vote")}
        >
          Vote
        </button>
        <button
          className={`nav-link ${currentPage === "results" ? "active" : ""}`}
          onClick={() => setCurrentPage("results")}
        >
          Results
        </button>
      </nav>

      <div className="logo-container">
        <img
          className="logo"
          src="https://raw.githubusercontent.com/Madiocre/vote-images/main/thebest.png"
          alt="Logo"
          width={300}
          height={300}
        />
        <AdvertCard />
      </div>

      {currentPage === "vote" ? <VoteContent /> : <ResultsContent />}

      <footer>
        <div className="footer-bottom">
          <div className="footer-bottom-social-icons">
            <ul id="footer-social-links">
              <li>
                <a href="https://github.com/Madiocre" target="_blank">
                  GitHub
                </a>
              </li>{" "}
              |
              <li>
                <a
                  href="https://www.linkedin.com/in/ahmed-shalaby-31a03a235/"
                  target="_blank"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
            <div className="footer-bottom-site-credit">
              Powered By:{" "}
              <span id="site-credit">
                <a href="https://github.com/Madiocre" target="_blank">
                  Madiocre (Ahmed Shalaby)
                </a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
