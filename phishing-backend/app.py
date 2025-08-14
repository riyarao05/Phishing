from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from extractor import extract_features_from_url

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load trained model and feature order
model = joblib.load("phishing_model.pkl")
X_COLUMNS = pd.read_csv("Phishing_Websites_Data.csv").drop("Result", axis=1).columns.tolist()

# Optional: Home route for browser check
@app.route("/")
def home():
    return "✅ Phishing Detection API is running!"

# Predict route
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        features = extract_features_from_url(url)
    except ValueError as ve:
        # 🔹 This will catch "Invalid domain format" from extractor.py
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Feature extraction failed: {str(e)}"}), 500

    try:
        input_df = pd.DataFrame([features])[X_COLUMNS]
        prediction = model.predict(input_df)[0]

        return jsonify({
            "url": url,
            "prediction": int(prediction),
            "isPhishing": int(prediction) == 0  # 0 = phishing, 1 = legitimate
        })
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# Run the Flask server
if __name__ == "__main__":
    app.run(debug=True, port=5005)