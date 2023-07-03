import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

import './StreamingApp.css'; // Import CSS file for component styles

const StreamingApp = () => {
  const videoRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket.io client
    socketRef.current = io();

    // Request media access from the user
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        videoRef.current.srcObject = stream;

        const mediaStreamTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(mediaStreamTrack);

        setInterval(() => {
          imageCapture.grabFrame()
            .then((imageBitmap) => {
              const canvas = document.createElement('canvas');
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              const context = canvas.getContext('2d');
              context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
              const imageData = canvas.toDataURL('image/jpeg');

              // Send streaming data to the API endpoint
              fetch('http://localhost:3000/stream', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageData }),
              });
            })
            .catch((error) => {
              console.error('Error grabbing frame:', error);
            });
        }, 1000);
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });

    return () => {
      // Clean up socket.io connection
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Receive and display the video stream on the client-side
    socketRef.current.on('stream', (data) => {
      if (videoRef.current) {
        videoRef.current.src = data;
      }
    });
  }, []);

  return (
    <div className="streaming-app">
    <div>Hello</div>
      <video ref={videoRef} className="video" autoPlay></video>
    </div>
  );
};

export default StreamingApp;
