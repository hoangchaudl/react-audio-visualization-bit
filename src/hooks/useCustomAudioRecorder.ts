
// src/hooks/useCustomAudioRecorder.ts

import { useState, useRef } from 'react';

export const useCustomAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          noiseSuppression: false,
          echoCancellation: false,
          sampleSize: 24,
          sampleRate: 48000,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        // This line is now changed to 'audio/wav'
        const newAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(newAudioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

    } catch (err) {
      console.error("ERROR during recording setup:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, audioBlob, startRecording, stopRecording };
};
