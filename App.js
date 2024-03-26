import { useState, useEffect } from "react";

import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert
} from "react-native";

import { Fontisto } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from "./colors";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem("status", "travel");
  };
  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem("status", "work");
  };
  const loadWorking = async () => {
    const status = await AsyncStorage.getItem("status");
    const isWorking = status === "work" ? true : false;
    setWorking(isWorking);
  }
  const onChangeText = (payload) => {
    setText(payload);
  };
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch(err) {
      console.log(err);
    }
  }
  const loadToDos = async () => {
    try {
      const str = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(str));
    } catch(err) {
      console.log(err);
    }
  }
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: {text, work: working, done: false}
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async (key) => {
    Alert.alert(
      "Delete To Do",
      "Are you sure you want to delete this to do?",
      [
        {
          text: "I'm sure",
          style: "destructive",
          onPress: () => {
            const newToDos = {...toDos};
            delete newToDos[key];
            setToDos(newToDos);
            saveToDos(newToDos);
          }
        },
        {text: "cancel"}
      ]
    );
  }
  const toggleCheckbox = (key) => {
    const newToDos = {...toDos};
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    saveToDos();
  }

  useEffect(() => {
    loadToDos();
    loadWorking();
    // (async () => {
    //   AsyncStorage.clear();
    // })()
  }, []);
  useEffect(() => {
    console.log(toDos);
  }, [toDos])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.grey,
            }}>
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}>
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          placeholder={
            working ? "What do you have to do?" : "Where do you want to go?"
          }
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          returnKeyType="done"
          value={text}
          style={styles.input}
        />
        <ScrollView>
          {toDos ? Object.keys(toDos).map((key) => 
            toDos[key].work === working ? (
              <View key={key} style={styles.toDo}>
                <Text style={{
                  ...styles.toDoText,
                  textDecorationLine: toDos[key].done ? "line-through" : "none"
                }}>
                  {toDos[key].text}
                </Text>
                <View style={styles.toDoIcons}>
                  <TouchableOpacity onPress={() => {toggleCheckbox(key)}} style={{marginRight: 5}}>
                    <Fontisto
                      name={toDos[key].done ? "checkbox-active" : "checkbox-passive"}
                      size={18}
                      color={toDos[key].done ? "white" : theme.grey}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {deleteToDo(key)}}>
                    <Fontisto name="trash" size={18} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    marginVertical: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    fontSize: 18,
  },
  toDo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 15
  },
  toDoIcons: {
    flexDirection: "row"
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500"
  }
});
