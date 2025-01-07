import React, { useState, useEffect } from 'react';
import "../404.css";

const IndexPage: React.FC = () => {
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    const fetchOnlineURLs = async () => {
      try {
        const response = await fetch('/api/ping');
        if (response.ok) {
          const data = await response.json();
          setOnline(data.other);
        } else {
          console.error('Failed to fetch online URLs');
        }
      } catch (error) {
        console.error('Error fetching online URLs:', error);
      }
    };

    fetchOnlineURLs();
  }, []);

  return (
      <div className="containerr">
        <div className="hh1">
          <h1>401</h1>
        </div>
        <div className="eyes">
          <div className="eye">
            <div className="eye__pupil eye__pupil--left"></div>
          </div>
          <div className="eye">
            <div className="eye__pupil eye__pupil--right"></div>
          </div>
        </div>
        <br></br>
        <br></br>
        <br></br>
        <div className="hh1">
          <h2>Looks like you not Authorized to view <br></br>this page.</h2>
        </div>
        <h2>Online URLs:</h2>
      <ul>
        {online.length > 0 ? (
          online.map((url, index) => (
            <li key={index}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            </li>
          ))
        ) : (
          <li>No online URLs available.</li>
        )}
      </ul>
      </div>
  );
};

export default IndexPage;
