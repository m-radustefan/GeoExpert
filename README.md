# GeoExpert Pro 🌍

**GeoExpert Pro** is a high-fidelity, interactive geography challenge built with the Google Maps JavaScript API. It tasks players with identifying their location on Earth based solely on Street View imagery.

This project evolved from a basic prototype into a professional-grade application featuring multiple game modes, a secure configuration architecture, and a modern "glassmorphism" UI.

---

## ✨ Key Features

* **Dynamic Game Modes:** Choose between **5 Rounds**, **10 Rounds**, or **Endless Mode** via the interactive Start Screen or the in-game settings menu.
* **Hard Mode:** A specialized toggle for "pro" players that disables Street View movement, zooming, and scrolling, forcing a guess based on the initial panorama only.
* **Intelligent Scoring:** Uses the Google Maps Geometry library to calculate geodesic distance. Scores are determined via an exponential decay algorithm:
  $$Score = 5000 \cdot e^{-\frac{distance}{2000000}}$$
* **Responsive Minimap:** A custom-built, hover-expanding map container for precise pin-dropping.
* **Modern UI:** A clean, glassmorphic HUD designed for high readability and focus.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Variables & Flexbox), JavaScript (ES6+)
* **APIs:** Google Maps Platform
    * *Street View Service* (Panorama rendering)
    * *Maps JavaScript API* (Interactive guessing map)
    * *Geometry Library* (Spherical distance calculations)
* **Data:** JSON-driven coordinate pool (`likeacw.json`).

---

## 🔒 Security & Configuration

To prevent API key exposure and unauthorized usage, this project uses a decoupled configuration system:

1.  **Environment Protection:** The actual `config.js` is excluded from version control via `.gitignore`.
2.  **Configuration Template:** A `config.example.js` is provided to show the required object structure without revealing credentials.



---

## 🚀 Getting Started

### Prerequisites
* A Google Cloud Project with the **Maps JavaScript API** enabled.
* An API Key (Restricted to your deployment domain or `localhost`).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/m-radustefan/GeoExpert.git/
    cd geoexpert-pro
    ```

2.  **Configure your API Key:**
    * Locate `config.example.js` in the root directory.
    * Rename (or copy) it to `config.js`.
    * Paste your Google Maps API Key into the configuration object:
    ```javascript
    const CONFIG = {
        GOOGLE_MAPS_API_KEY: "YOUR_ACTUAL_API_KEY"
    };
    ```

3.  **Launch:**
    Open `index.html` in your browser. For the best experience (and to avoid CORS issues with JSON fetching), use a local server like **PHPStorm's built-in server** or the **Live Server** extension in VS Code.

---


## 📄 License

This project is open-source and available under the MIT License.