import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropper.css';

export default function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    onCropComplete(croppedAreaPixels);
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-container">
        <div className="cropper-header">
          <h3>Position Your Image</h3>
          <p>Drag to move, scroll to zoom</p>
        </div>
        
        <div className="cropper-wrapper">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={3/4}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        <div className="cropper-controls">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Apply</button>
        </div>
      </div>
    </div>
  );
}