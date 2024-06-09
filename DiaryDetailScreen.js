import React from 'react';
import { View, Text, Button, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';

// 이미지 경로를 수정합니다.
const emotionImages = {
  'fear': require('../assets/fear.png'),
  'sadness': require('../assets/sadness.png'),
  'disgust': require('../assets/disgust.png'),
  'joy': require('../assets/joy.png'),
  'anger': require('../assets/angry.png'),
};

export default function DiaryDetailScreen({ route, navigation }) {
  const { diary } = route.params;
  const [emotion, setEmotion] = React.useState('');
  const [aiMessage, setAiMessage] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const analyzeEmotion = async (text) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: text }],
        },
        {
          headers: {
            'Authorization': `Bearer YOUR_API_KEY`,
            'Content-Type': 'application/json',
          },
        }
      );
      const aiResponse = response.data.choices[0].message.content;
      const emotionResponse = aiResponse.match(/감정: (.*)/);
      setEmotion(emotionResponse ? emotionResponse[1] : '알 수 없음');
      setAiMessage(aiResponse);
    } catch (error) {
      console.error(error);
      setAiMessage('AI 응답에 실패했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    analyzeEmotion(diary.text);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const emotionImage = emotionImages[emotion] || null;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>{diary.text}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>감정: {emotion}</Text>
        {emotionImage && <Image source={emotionImage} style={{ width: 30, height: 30, marginLeft: 10 }} />}
      </View>
      <Text style={{ fontSize: 16, marginVertical: 20 }}>한마디 메시지: {aiMessage}</Text>
    </View>
  );
}
