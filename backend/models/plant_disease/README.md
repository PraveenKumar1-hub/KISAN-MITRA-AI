# Plant Disease Detection ML Model Directory

This directory is designated for trained Computer Vision (CNN) disease classification models for Kisan Mitra AI.

## Supported Model Formats
- TensorFlow / Keras: `model.keras` (recommended) or `model.h5`
- PyTorch: `model.pt` or `model.pth`

## Configuration
Configure the path and inference threshold in `backend/.env`:

```env
PLANT_DISEASE_MODEL_PATH=models/plant_disease/model.keras
PLANT_DISEASE_LABELS_PATH=app/config/disease_labels.json
PLANT_DISEASE_CONFIDENCE_THRESHOLD=0.65
PLANT_DISEASE_INPUT_SIZE=224
```

## Model Requirements
1. **Input Dimensions**: `(1, 224, 224, 3)` RGB normalized tensor `[0.0, 1.0]`.
2. **Output**: Softmax probability distribution corresponding to class indices in `backend/app/config/disease_labels.json`.
3. **Labels**: Ensure class order in `disease_labels.json` exactly matches the model training indices (`0, 1, 2, ...`).

## Truthful AI Policy
Plant disease detection requires a compatible trained model. The application does not generate predictions when the model is unavailable. If no model binary is placed here, the system transparently reports `model_unavailable` to protect farmer trust and agricultural integrity.
