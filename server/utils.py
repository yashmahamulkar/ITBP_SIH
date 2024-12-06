import cv2
from ultralytics import YOLO
import torch

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("yolov9e.pt").to(device)
classNames = ["person"]  # Only detect persons

def generate_frames():
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)  # Set width
    cap.set(4, 480)  # Set height

    while True:
        success, img = cap.read()  # Capture the current frame
        if not success:
            break

        # Process the frame (YOLO detection)
        img_resized = cv2.resize(img, (640, 640))
        img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        img_tensor = torch.tensor(img_rgb).permute(2, 0, 1).unsqueeze(0).float().to(device)

        # Run prediction
        results = model.predict(img_tensor, stream=True, conf=0.55)

        person_count = 0  # Initialize person count

        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = round(box.conf[0].item() * 100) / 100

                if confidence > 0.3:  # Confidence threshold
                    cls = int(box.cls[0])
                    if cls < len(classNames) and classNames[cls] == "person":  # Ensure index is within bounds
                        person_count += 1
                        cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 255), 3)
                        cv2.putText(img, classNames[cls], (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Display the person count on the frame
        counter_text = f"Persons: {person_count}"
        cv2.putText(img, counter_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

        # Encode the frame in JPEG format and yield it
        ret, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()
