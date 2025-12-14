import client from './client';

export async function getUserInfo(){
  const res = await client.get('/setting');
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '유저 정보를 불러오지 못했습니다.');
  }

  return data;
}

export async function getAppInfo() {
  const res = await client.get('/setting/appinfo');
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '앱 정보를 불러오지 못했습니다.');
  }

  return data;
}

export async function getQuestionList() {
  const res = await client.get('/setting/question');
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '문의 목록을 불러오지 못했습니다.');
  }

  return data.list || [];    

}

export async function updateBaseNotificationSetting(body) {
  const res = await client.put('/setting', body);
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '기본 알림 설정 변경에 실패했습니다.');
  }

  return data;
}

export async function getPastNotificationSetting() {
  const res = await client.get('/setting/notification/past');
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '과거 알림 설정을 불러오지 못했습니다.');
  }

  return data;
}

export async function updatePastNotificationSetting(body) {
  const res = await client.put('/setting/notification/past', body);
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '과거 알림 설정 변경에 실패했습니다.');
  }

  return data;
}

export async function getWriteNotificationSetting() {
  const res = await client.get('/setting/notification/post');
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '작성 알림 설정을 불러오지 못했습니다.');
  }

  return data;
}

export async function updateWriteNotificationSetting(body) {
  const res = await client.put('/setting/notification/post', body);
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '작성 알림 설정 변경에 실패했습니다.');
  }

  return data;
}

export async function getTtsSetting() {
  const res = await client.get('/setting/tts');
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || 'TTS 설정을 불러오지 못했습니다.');
  }

  return data;
}

export async function updateTtsSetting(body) {
  const res = await client.put('/setting/tts', body);
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || 'TTS 설정 변경에 실패했습니다.');
  }

  return data;
}

export async function postInquiry({ title, content }) {
  const res = await client.post('/setting/inquiry', { title, content });
  const { data, isSuccess, message } = res.data;

  if (!isSuccess) {
    throw new Error(message || '문의 전송에 실패했습니다.');
  }
  
  return data;
}