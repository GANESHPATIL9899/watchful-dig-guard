import io
import cv2
import numpy as np
import tensorflow as tf
import keras_cv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KerasCV YOLOv8 Safety Model API")

# Enable CORS for connection with Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your custom KerasCV YOLOv8 model preset
print("Loading KerasCV YOLOv8 Model...")
try:
    production_model = keras_cv.models.YOLOV8Detector.from_preset(
        "yolo_v8_m_pascalvoc",
        bounding_box_format="xyxy"
    )
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model preset: {e}")

resize_layer = keras_cv.layers.Resizing(
    height=640, width=640, pad_to_aspect_ratio=True
)

@app.get("/health")
def health():
    return {"status": "healthy", "model": "yolo_v8_m_pascalvoc"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        # Read uploaded image bytes
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image_bgr is None:
            raise HTTPException(status_code=400, detail="Invalid image file.")
            
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        
        # Preprocess frame tensor
        image_tensor = tf.cast(image_rgb, tf.float32)
        resized_image = resize_layer(image_tensor)
        input_batch = tf.expand_dims(resized_image, axis=0)
         
        # Run inference
        predictions = production_model.predict(input_batch, verbose=0)
        
        predicted_boxes = predictions["boxes"][0].numpy()
        confidence_scores = predictions["confidence"][0].numpy()
        class_ids = predictions["classes"][0].numpy()
        
        detections = []
        for box, score, cls_id in zip(predicted_boxes, confidence_scores, class_ids):
            # Class ID 14 corresponds to 'person' in the Pascal VOC dataset
            if cls_id == 14 and score > 0.30:  
                xmin, ymin, xmax, ymax = box.tolist()
                
                # Convert xyxy coordinates to standard xywh for dashboard overlay rendering
                w = xmax - xmin
                h = ymax - ymin
                
                detections.append({
                    "bbox": [int(xmin), int(ymin), int(w), int(h)],
                    "class": "person",
                    "score": float(score)
                })
                
        return {"ok": True, "detections": detections}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
