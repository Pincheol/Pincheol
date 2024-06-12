import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';

export default function DiaryScreen({ navigation }) {
  const [diary, setDiary] = useState('');
  const [diaryList, setDiaryList] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [isOptionsModalVisible, setOptionsModalVisible] = useState(false);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [selectedDiaryId, setSelectedDiaryId] = useState(null);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const addDiary = async () => {
    let updatedDiaryList;
    if (isEditMode) {
      updatedDiaryList = diaryList.map(diaryItem =>
        diaryItem.id === selectedDiaryId ? { ...diaryItem, text: diary, date: currentDate.toISOString() } : diaryItem
      );
    } else {
      const newDiary = {
        id: Date.now().toString(),
        text: diary,
        date: currentDate.toISOString(),
        locked: false,
      };
      updatedDiaryList = [...diaryList, newDiary];
    }

    updatedDiaryList.sort((a, b) => new Date(b.date) - new Date(a.date));

    setDiaryList(updatedDiaryList);
    setDiary('');
    await AsyncStorage.setItem('diaries', JSON.stringify(updatedDiaryList));
    setModalVisible(false);
    setEditMode(false);
    setSelectedDiaryId(null);
    setCurrentDate(new Date(currentDate));
  };

  const loadDiaries = async () => {
    const diaries = await AsyncStorage.getItem('diaries');
    if (diaries) {
      const parsedDiaries = JSON.parse(diaries);
      parsedDiaries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDiaryList(parsedDiaries);
      setSearchResults(parsedDiaries);
    }
  };

  const filterDiariesByMonth = (diaries, date) => {
    return diaries.filter(diary => new Date(diary.date).getMonth() === date.getMonth() && new Date(diary.date).getFullYear() === date.getFullYear());
  };

  useEffect(() => {
    loadDiaries();
  }, []);

  useEffect(() => {
    if (searchQuery === '') {
      setSearchResults(diaryList);
    } else {
      const results = diaryList.filter(diary =>
        diary.text.includes(searchQuery)
      );
      setSearchResults(results);
    }
  }, [searchQuery, diaryList]);

  const displayedDiaries = filterDiariesByMonth(searchQuery === '' ? diaryList : searchResults, currentDate);

  const editDiary = (diary) => {
    setDiary(diary.text);
    setSelectedDiaryId(diary.id);
    setEditMode(true);
    setModalVisible(true);
    setOptionsModalVisible(false);
  };

  const toggleLockDiary = (id) => {
    const updatedDiaryList = diaryList.map(diaryItem =>
      diaryItem.id === id ? { ...diaryItem, locked: !diaryItem.locked } : diaryItem
    );
    updatedDiaryList.sort((a, b) => new Date(b.date) - new Date(a.date));
    setDiaryList(updatedDiaryList);
    AsyncStorage.setItem('diaries', JSON.stringify(updatedDiaryList));
    setOptionsModalVisible(false);
  };

  const deleteDiary = (id) => {
    const updatedDiaryList = diaryList.filter(diaryItem => diaryItem.id !== id);
    updatedDiaryList.sort((a, b) => new Date(b.date) - new Date(a.date));
    setDiaryList(updatedDiaryList);
    AsyncStorage.setItem('diaries', JSON.stringify(updatedDiaryList));
    setOptionsModalVisible(false);
  };

  const handleLongPress = (diary) => {
    setSelectedDiary(diary);
    setOptionsModalVisible(true);
  };

  const handlePress = (diary) => {
    navigation.navigate('DiaryDetail', { diary });
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateChange = (day) => {
    setCurrentDate(new Date(day.dateString));
    setCalendarVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>몽글몽글</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!isSearchVisible)}>
          <Ionicons name="search-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="검색어를 입력하세요..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      )}

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)}>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <FlatList
          data={displayedDiaries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
              style={styles.diaryItem}
            >
              <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.diaryText}>{item.locked ? "잠긴 내용입니다." : item.text}</Text>
            </TouchableOpacity>
          )}
        />
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? "일기 수정" : "새 일기 추가"}</Text>
              <Button title={currentDate.toLocaleDateString()} onPress={() => setCalendarVisible(true)} />
            </View>
            <TextInput
              placeholder="오늘의 일기를 작성하세요..."
              value={diary}
              onChangeText={setDiary}
              style={styles.input}
              multiline={true}
            />
            <View style={styles.buttonRow}>
              <Button title="취소" onPress={() => setModalVisible(false)} color="red" />
              <Button title={isEditMode ? "수정 완료" : "일기 추가"} onPress={addDiary} />
            </View>
          </View>
        </View>
      </Modal>

      {isCalendarVisible && (
        <Modal
          visible={isCalendarVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCalendarVisible(false)}
        >
          <View style={styles.pickerContainer}>
            <Calendar
              onDayPress={handleDateChange}
              markedDates={{
                [currentDate.toISOString().split('T')[0]]: { selected: true, marked: true }
              }}
            />
            <Button title="닫기" onPress={() => setCalendarVisible(false)} />
          </View>
        </Modal>
      )}

      <Modal
        visible={isOptionsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOptionsModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>일기 옵션</Text>
                <Button title="수정" onPress={() => editDiary(selectedDiary)} />
                <Button title={selectedDiary && selectedDiary.locked ? "잠금 해제" : "잠금"} onPress={() => toggleLockDiary(selectedDiary.id)} />
                <Button title="삭제" onPress={() => deleteDiary(selectedDiary.id)} color="red" />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    padding: 10,
    marginRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  diaryItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  diaryText: {
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'tomato',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 20,
    height: 150,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
