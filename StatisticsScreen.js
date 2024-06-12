import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Dimensions, Linking, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

export default function StatisticsScreen() {
  const [emotionStats, setEmotionStats] = useState({
    fear: 0,
    anger: 0,
    joy: 0,
    sadness: 0,
    disgust: 0,
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  const calculateEmotionStats = async (date) => {
    const diaries = await AsyncStorage.getItem('diaries');
    if (diaries) {
      const diaryList = JSON.parse(diaries);
      let stats = { fear: 0, anger: 0, joy: 0, sadness: 0, disgust: 0 };
      for (const diary of diaryList) {
        const diaryDate = new Date(diary.date);
        if (diaryDate.getMonth() === date.getMonth() && diaryDate.getFullYear() === date.getFullYear()) {
          if (diary.emotion) {
            stats[diary.emotion]++;
          }
        }
      }
      setEmotionStats(stats);
    }
  };

  useFocusEffect(
    useCallback(() => {
      calculateEmotionStats(currentDate);
    }, [currentDate])
  );

  const getColor = (emotion) => {
    switch (emotion) {
      case 'fear':
        return '#f39c12';
      case 'anger':
        return '#e74c3c';
      case 'joy':
        return '#f1c40f';
      case 'sadness':
        return '#3498db';
      case 'disgust':
        return '#2ecc71';
      default:
        return '#95a5a6';
    }
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const chartData = Object.entries(emotionStats).map(([key, value]) => ({
    name: key,
    population: value,
    color: getColor(key),
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>감정 통계</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)}>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, marginVertical: 20 }} />
      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=37.297219,127.038568&travelmode=driving')}>
            <iframe
              width="100%"
              height="600"
              style={{ border: 0 }}
              src="https://www.google.com/maps/embed/v1/place?key=AIzaSyANBq5BHJ6Q9lB-VqBFK70b7ZaTabSe09Q&q=용인시기흥구경기구갈동111인문대학교 인문사회관"
              allowFullScreen
            ></iframe>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Location:</Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>용인시 기흥구 경기 구갈동 111 인문대학교 인문사회관 (230호, 231호)</Text>

          <TouchableOpacity onPress={() => Linking.openURL('mailto:knucc@kangnam.ac.kr')}>
             E-mail:<Text style={{ color: 'blue', fontSize: 18, marginBottom: 10 }}>knucc@kangnam.ac.kr</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL('tel:031-899-7205')}>
             Phone:<Text style={{ color: 'blue', fontSize: 18, marginBottom: 10 }}>031-899-7205</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openURL('https://counsel.kangnam.ac.kr')}>
            Site:<Text style={{ color: 'blue', fontSize: 18, marginBottom: 10 }}>https://counsel.kangnam.ac.kr</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
