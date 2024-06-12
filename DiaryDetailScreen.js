import React from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 이미지 경로를 수정합니다.
const emotionImages = {
  'fear': require('../assets/fear.png'),
  'sadness': require('../assets/sadness.png'),
  'disgust': require('../assets/disgust.png'),
  'joy': require('../assets/joy.png'),
  'anger': require('../assets/angry.png'),
};

export default function DiaryDetailScreen({ route }) {
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
          messages: [
            { role: 'system', content: 'Analyze the emotion of the following diary entry and respond with the emotion in English (fear, anger, joy, sadness, disgust). Then provide a supportive message based on the diary entry in Korean.' },
            { role: 'user', content: text },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer sk-proj-87kwjocm0PsV7GSVlMGXT3BlbkFJiqGf9rqbV6PO7SToDnfA`,
            'Content-Type': 'application/json',
          },
        }
      );
      const aiResponse = response.data.choices[0].message.content;
      const emotionResponse = aiResponse.match(/(fear|anger|joy|sadness|disgust)/i);
      const emotionText = emotionResponse ? emotionResponse[0].toLowerCase() : '알 수 없음';
      setEmotion(emotionText);
      const messageText = aiResponse.replace(/.*?(fear|anger|joy|sadness|disgust):?\s*/i, '').replace(/Supportive message:\s*/, '');
      setAiMessage(messageText);
      saveDiaryEmotion(emotionText);
    } catch (error) {
      console.error(error);
      setAiMessage('AI 응답에 실패했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const saveDiaryEmotion = async (emotion) => {
    try {
      const diaries = await AsyncStorage.getItem('diaries');
      let diaryList = diaries ? JSON.parse(diaries) : [];
      diaryList = diaryList.map(d => d.id === diary.id ? { ...d, emotion } : d);
      await AsyncStorage.setItem('diaries', JSON.stringify(diaryList));
    } catch (error) {
      console.error('Error saving emotion to AsyncStorage', error);
    }
  };

  React.useEffect(() => {
    analyzeEmotion(diary.text);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const emotionImage = emotionImages[emotion] || null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 일기</Text>
      <View style={styles.bubble}>
        <Text style={styles.diaryText}>{diary.text}</Text>
      </View>
      <View style={styles.emotionContainer}>
        <Text style={styles.subtitle}>감정</Text>
        <View style={styles.bubble}>
          <Text style={styles.emotionText}>{emotion}</Text>
          {emotionImage && <Image source={emotionImage} style={styles.emotionImage} />}
        </View>
      </View>
      <Text style={styles.subtitle}>한마디 메시지</Text>
      <View style={styles.bubble}>
        <Text style={styles.messageText}>{aiMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bubble: {
    backgroundColor: '#e1e1e1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  diaryText: {
    fontSize: 18,
  },
  emotionContainer: {
    marginBottom: 20,
  },
  emotionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emotionImage: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  messageText: {
    fontSize: 16,
  },
});
