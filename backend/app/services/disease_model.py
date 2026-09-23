"""
Plant Disease Detection Model Service
Provides decoupled model loading, availability tracking, image preprocessing,
and forward-pass inference.
Supports TensorFlow/Keras (.keras, .h5) and PyTorch models without hardcoding logic in API routes.
"""

import os
import json
from typing import Optional, Dict, Any, Union
from PIL import Image
from app.core.config import settings


class PlantDiseaseModelEngine:
    """
    Decoupled inference engine for agricultural plant disease detection.
    Responsible for:
    - Model discovery and safe loading
    - Image normalization and preprocessing
    - Forward-pass inference
    - Confidence threshold evaluation
    - Label and verified advisory lookup
    """

    def __init__(self):
        self.model_path = settings.PLANT_DISEASE_MODEL_PATH
        self.labels_path = settings.PLANT_DISEASE_LABELS_PATH
        self.confidence_threshold = settings.PLANT_DISEASE_CONFIDENCE_THRESHOLD
        self.input_size = settings.PLANT_DISEASE_INPUT_SIZE

        self._model = None
        self._model_type = "None"
        self._labels: Dict[str, Any] = {}
        self._load_labels()
        self.load_model()

    def _load_labels(self):
        """Loads disease labels and verified agronomic metadata catalog."""
        # Check relative paths
        paths_to_check = [
            self.labels_path,
            os.path.join(os.path.dirname(__file__), "..", "config", "disease_labels.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "app", "config", "disease_labels.json"),
            "backend/app/config/disease_labels.json",
            "app/config/disease_labels.json"
        ]

        for p in paths_to_check:
            abs_p = os.path.abspath(p)
            if os.path.isfile(abs_p):
                try:
                    with open(abs_p, "r", encoding="utf-8") as f:
                        self._labels = json.load(f)
                    return
                except Exception as e:
                    print(f"[DiseaseModelEngine] Error reading labels from {abs_p}: {e}")

        # Fallback minimal labels structure
        self._labels = {
            "0": {
                "plant": "General Crop",
                "disease": "Healthy Plant Tissue",
                "severity": "None",
                "symptoms": "No visible signs of pathogen infection.",
                "prevention": "Maintain standard agronomic care.",
                "general_management": "Routine field scouting.",
                "treatment_guidance": "No treatment required."
            }
        }

    def load_model(self):
        """
        Safely attempts loading the model binary from configured path.
        Does not crash the application if weights or ML libraries are absent.
        """
        self._model = None
        self._model_type = "None"

        # Resolve model path against possible roots
        paths_to_check = [
            self.model_path,
            os.path.join("backend", self.model_path),
            os.path.join(os.path.dirname(__file__), "..", "..", self.model_path),
            os.path.abspath(self.model_path)
        ]

        resolved_path = None
        for p in paths_to_check:
            if os.path.isfile(p):
                resolved_path = os.path.abspath(p)
                break

        if not resolved_path:
            # Model file does not exist on disk
            return

        # Attempt Keras / TensorFlow loading
        if resolved_path.endswith((".keras", ".h5")):
            try:
                import tensorflow as tf
                self._model = tf.keras.models.load_model(resolved_path, compile=False)
                self._model_type = "TensorFlow/Keras"
                print(f"[DiseaseModelEngine] Successfully loaded Keras model from {resolved_path}")
                return
            except ImportError:
                print("[DiseaseModelEngine] TensorFlow is not installed in the environment.")
            except Exception as e:
                print(f"[DiseaseModelEngine] Error loading Keras model: {e}")

        # Attempt PyTorch loading
        if resolved_path.endswith((".pt", ".pth")):
            try:
                import torch
                self._model = torch.load(resolved_path, map_location="cpu")
                if hasattr(self._model, "eval"):
                    self._model.eval()
                self._model_type = "PyTorch"
                print(f"[DiseaseModelEngine] Successfully loaded PyTorch model from {resolved_path}")
                return
            except ImportError:
                print("[DiseaseModelEngine] PyTorch is not installed in the environment.")
            except Exception as e:
                print(f"[DiseaseModelEngine] Error loading PyTorch model: {e}")

    def is_available(self) -> bool:
        """Returns True if a valid ML model binary is loaded and ready for inference."""
        return self._model is not None

    def get_model_info(self) -> Dict[str, Any]:
        """Provides metadata for display on the frontend model info card."""
        return {
            "model_available": self.is_available(),
            "model_type": self._model_type if self.is_available() else "TensorFlow/Keras Vision Network",
            "model_path": self.model_path,
            "confidence_threshold": self.confidence_threshold,
            "input_resolution": f"{self.input_size}x{self.input_size} RGB",
            "supported_formats": ["JPG", "JPEG", "PNG"],
            "max_file_size_mb": 5.0
        }

    def preprocess(self, image: Union[Image.Image, bytes]):
        """
        Preprocesses PIL image or raw bytes to normalized tensor matching model dimensions.
        Converts to RGB, resizes, and scales pixels to [0.0, 1.0].
        """
        if isinstance(image, (bytes, bytearray)):
            import io
            image = Image.open(io.BytesIO(image))

        if image.mode != "RGB":
            img = image.convert("RGB")
        else:
            img = image.copy()

        img = img.resize((self.input_size, self.input_size), Image.Resampling.BILINEAR)

        # Convert to numpy array if numpy is available
        try:
            import numpy as np
            arr = np.array(img, dtype=np.float32) / 255.0
            tensor = np.expand_dims(arr, axis=0)  # Shape: (1, input_size, input_size, 3)
            return tensor
        except ImportError:
            # Fallback if numpy is not installed
            return img

    def predict(self, image: Image.Image) -> Optional[Dict[str, Any]]:
        """
        Executes model inference on preprocessed image.
        Returns None if model is unavailable.
        Evaluates confidence against confidence_threshold and pulls verified advisory.
        """
        if not self.is_available():
            return None

        # Process input
        tensor = self.preprocess(image)

        # Run model forward pass
        try:
            if self._model_type == "TensorFlow/Keras":
                import numpy as np
                preds = self._model.predict(tensor)
                # preds is typically array of probabilities (1, num_classes)
                probs = preds[0]
                class_idx = int(np.argmax(probs))
                confidence = float(probs[class_idx])
            elif self._model_type == "PyTorch":
                import torch
                import numpy as np
                with torch.no_grad():
                    # If tensor is numpy, convert to torch
                    if not isinstance(tensor, torch.Tensor):
                        t_tensor = torch.from_numpy(tensor).permute(0, 3, 1, 2)
                    else:
                        t_tensor = tensor
                    out = self._model(t_tensor)
                    probs = torch.softmax(out, dim=1)[0].numpy()
                    class_idx = int(np.argmax(probs))
                    confidence = float(probs[class_idx])
            elif callable(self._model):
                # Mock or callable model hook for testing
                res = self._model(tensor)
                class_idx = res.get("class_idx", 0)
                confidence = float(res.get("confidence", 0.90))
            else:
                return None
        except Exception as e:
            print(f"[DiseaseModelEngine] Inference execution error: {e}")
            return None

        # Lookup verified label & advisory
        label_data = self._labels.get(str(class_idx), {
            "plant": "Agricultural Crop",
            "disease": f"Class {class_idx}",
            "severity": "Moderate",
            "symptoms": "Leaf spots or discolored tissue observed.",
            "prevention": "Inspect surrounding crop stand and ensure proper field sanitation.",
            "general_management": "Scout neighboring plants for symptom progression.",
            "treatment_guidance": "Detailed treatment guidance is not available yet. Please consult a local agricultural expert."
        })

        is_low_confidence = confidence < self.confidence_threshold
        status = "low_confidence" if is_low_confidence else "success"

        recommendation = (
            "Confidence is below the detection threshold. We recommend taking a clearer, well-lit photo of the leaf or having it inspected by a local agronomist."
            if is_low_confidence
            else f"Identified {label_data.get('disease')}. Review the agronomic management steps below."
        )

        return {
            "status": status,
            "plant": label_data.get("plant", "Crop"),
            "disease": label_data.get("disease", "Unknown"),
            "confidence": round(confidence, 4),
            "recommendation": recommendation,
            "advisory": {
                "symptoms": label_data.get("symptoms"),
                "prevention": label_data.get("prevention"),
                "general_management": label_data.get("general_management"),
                "treatment_guidance": label_data.get("treatment_guidance"),
                "severity": label_data.get("severity", "Moderate")
            }
        }


# Singleton engine instance
disease_model_engine = PlantDiseaseModelEngine()
