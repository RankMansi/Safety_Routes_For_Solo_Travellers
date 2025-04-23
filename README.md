# Solo Travellers - Safe Route Planner

A web application that helps solo travellers plan safer routes by avoiding crime hotspots. The application uses machine learning (DBSCAN clustering) to identify high-crime areas and the OpenRouteService API to generate routes that avoid these areas.

## Features

- Crime hotspot identification using DBSCAN clustering
- Safe route planning that avoids identified crime clusters
- Multiple transportation modes (walking and bus)
- Comparison between safe and regular routes
- Visual representation of routes and crime hotspots on an interactive map

## Technology Stack

- **Backend**: Flask (Python)
- **Data Processing**: Pandas, NumPy, Scikit-learn
- **Routing**: OpenRouteService API
- **Visualization**: Frontend map display (likely Leaflet or similar)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/solo_travellers.git
   cd solo_travellers
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up the OpenRouteService API key:
   - Sign up at [OpenRouteService](https://openrouteservice.org/) to get an API key
   - Replace the placeholder API key in `app.py` with your own key

## Usage

1. Run the Flask application:
   ```
   python app.py
   ```

2. Open a web browser and navigate to `http://localhost:5000`

3. Enter your starting point and destination to get safe route recommendations

## Project Structure

- `app.py`: Main Flask application
- `modules/`: Core functionality modules
  - `data_loader.py`: Functions for loading crime data
  - `clustering.py`: DBSCAN clustering implementation
- `data/`: Crime datasets
- `model/`: Saved machine learning models
- `templates/`: HTML templates for the web interface
- `static/`: Static files (CSS, JavaScript, images)
- `crime_filter.py`: Utility for filtering crime data
- `train_dbscan.py`: Script for training the DBSCAN clustering model

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
