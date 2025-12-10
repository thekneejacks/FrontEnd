import {PermissionsAndroid, Platform} from 'react-native';
import 'react-native-get-random-values';
import 'node-libs-react-native/globals';
import {Buffer} from 'buffer';
import {
  AudioConfig,
  AudioInputStream,
  SpeechConfig,
  SpeechRecognizer,
} from 'microsoft-cognitiveservices-speech-sdk';
import {LogBox} from 'react-native';
import LiveAudioStream from 'react-native-live-audio-stream';
import {key, region, language} from './DiaryAzure';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message

// 녹음 기능

//Settings for the audio stream
//tuned to documentation at https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-use-audio-input-streams
//Do not change these values unless you're an expert
const channels = 1;
const bitsPerChannel = 16;
const sampleRate = 16000;

let initializedCorrectly = false;
let recognizer;

//prompt for permissions if not granted
const checkPermissions = async () => {
  try {
    const OsVer = Platform.constants['Release'];
    if (OsVer >= 13) {
      const grants = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (grants === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permissions granted');
      } else {
        console.log('All required permissions not granted');
        return;
      }
    } else {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('Permissions granted');
      } else {
        console.log('All required permissions not granted');
        return;
      }
    }
  } catch (err) {
    console.warn(err);
    return;
  }
};

//sets up speechrecognizer and audio stream
export const initializeAudio = async callback => {
  await checkPermissions();
  if (!initializedCorrectly) {
    //creates a push stream system which allows new data to be pushed to the recognizer

    const pushStream = AudioInputStream.createPushStream();
    const options = {
      sampleRate,
      channels,
      bitsPerChannel,
      audioSource: 6,
    };

    LiveAudioStream.init(options);
    //everytime data is recieved from the mic, push it to the pushStream
    LiveAudioStream.on('data', data => {
      const pcmData = Buffer.from(data, 'base64');
      pushStream.write(pcmData);
    });

    LiveAudioStream.start();

    try {
      const speechConfig = SpeechConfig.fromSubscription(key, region);
      speechConfig.speechRecognitionLanguage = language;
      const audioConfig = AudioConfig.fromStreamInput(pushStream); //the recognizer uses the stream to get audio data
      recognizer = new SpeechRecognizer(speechConfig, audioConfig);

      recognizer.sessionStarted = (s, e) => {
        console.log('sessionStarted');
        console.log(e.sessionId);
      };

      recognizer.sessionStopped = (s, e) => {
        console.log('sessionStopped');
      };

      recognizer.recognizing = (s, e) => {
        //The recognizer will return partial results. This is not called when recognition is stopped and sentences are formed but when recognizer picks up scraps of words on-the-fly.
        //console.log(`RECOGNIZING: Text=${e.result.text}`);
        console.log(e.result.text);
        console.log(e.sessionId);
      };
      recognizer.recognized = (s, e) => {
        //The final result of the recognition with punctuation
        console.log(`RECOGNIZED: Text=${e.result.text}`);
        console.log(e.result);
        callback(e.result.text);
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('startContinuousRecognitionAsync');
        },
        err => {
          console.log(err);
        },
      );

      initializedCorrectly = true;
    } catch (err) {
      console.warn(err);
    }
  }
};

//stops the audio stream and recognizer
export const stopAudio = async () => {
  LiveAudioStream.stop();
  if (!!recognizer) {
    recognizer.stopContinuousRecognitionAsync();
    initializedCorrectly = false;
  }
};
