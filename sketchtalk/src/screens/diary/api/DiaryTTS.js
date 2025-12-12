import {NativeModules} from 'react-native';
import {key, region} from './DiaryAzure';

const {TTSModule} = NativeModules;

export const synthesizeSpeech = async (text, voice) => {
  await TTSModule.textToSpeech(text, voice, key, region);
};
