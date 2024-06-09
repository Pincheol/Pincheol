import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import axios from 'axios';

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const OPENAI_API_KEY = 'YOUR_API_KEY';

  const sendMessage = async () => {
    const newMessage = { id: Date.now().toString(), text: message, isUser: true };
    setChatHistory(prevHistory => [...prevHistory, newMessage]);

    try {
      const response = await makeApiRequest(message);
      const aiResponse = { 
        id: Date.now().toString(), 
        text: response.data.choices[0].message.content, 
        isUser: false 
      };
      setChatHistory(prevHistory => [...prevHistory, aiResponse]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { id: Date.now().toString(), text: 'AI 응답에 실패했습니다. 나중에 다시 시도해주세요.', isUser: false };
      setChatHistory(prevHistory => [...prevHistory, errorMessage]);
    }
  };

  const makeApiRequest = async (message, retries = 3) => {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', 
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 429 && retries > 0) {
        console.log(`Rate limit exceeded. Retrying in 1 second... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        return makeApiRequest(message, retries - 1);
      } else {
        throw error;
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
      <TextInput
        placeholder="메시지를 입력하세요..."
        value={message}
        onChangeText={setMessage}
        style={styles.input}
      />
      <Button title="전송" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
});
