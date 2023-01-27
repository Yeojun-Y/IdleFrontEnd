import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useState} from 'react';
import SignTextInput from '../components/signTextInput';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import {RootStackParamList} from '../../App';
import axios, {AxiosError} from 'axios';
import Config from 'react-native-config';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import SignBtn from '../components/signBtn';
import {sendEmail, sentEmail, signIn, signUp} from '../components/auth';
import {getAuth, sendEmailVerification} from 'firebase/auth';
import {firebase} from '@react-native-firebase/auth';
type ScreenProps = NativeStackScreenProps<RootStackParamList, 'FinishSignUp'>;
const {width: WIDTH} = Dimensions.get('window');

function EmailSignUp({navigation}: ScreenProps) {
  const [name, setName] = useState('');
  const [isCheckMan, setIsCheckMan] = useState<String>('0');
  const [sex, setSex] = useState<String>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkPass, setCheckPass] = useState('');

  const onChangeName = (payload: React.SetStateAction<string>) =>
    setName(payload);
  const onSubmitName = () => {
    alert(name);
    console.log(name);
  };
  const onCheckMan = () => {
    setIsCheckMan('1');
    setSex('man');
  };
  const onCheckWoman = () => {
    setIsCheckMan('2');

    setSex('woman');
  };
  const onChangeEmail = (payload: React.SetStateAction<string>) =>
    setEmail(payload);
  const onSubmitEmail = async () => {
    // console.log(name, sex, email);
    try {
      // const actionCodeSettings = {
      //   handleCodeInApp: true,
      //   url: 'https://idlefrontend.page.link/n3UL',
      //   android: {
      //     packageName: 'com.idlefrontend',
      //     installApp: true,
      //     minimumVersion: '12',
      //   },
      //   // dynamicLinkDomain: 'https://idlefrontend.page.link/n3UL',
      // };
      const {user} = await signUp({email, password});
      // const {user} = await sendEmail({email, actionCodeSettings});
      await user.sendEmailVerification();
      console.log(email);
      console.log(user);
      return true;
    } catch (error) {
      console.log(error);
      switch (error.code) {
        case 'auth/email-already-in-use': {
          return console.log('이미 사용중인 이메일입니다.');
        }
        case 'auth/invalid-email': {
          return console.log('이메일을 입력해주세요');
        }
        case 'auth/weak-password': {
          return console.log(
            '안전하지 않은 짧은 비밀번호입니다.\n다른 비밀번호를 사용해 주세요.',
          );
        }
        case 'auth/operation-not-allowed': {
          return console.log('operation-not-allowed \n관리자에게 문의하세요 ');
        }
      }
      console.log('error1 = ', error.code);
    }
  };
  const onSubmitEmail1 = () => {
    const user = firebase.auth().currentUser;
    // console.log(setUsers);
    console.log(user);
    console.log(user?.emailVerified);
    console.log('새로고침');
  };
  const onSubmitEmail2 = async () => {
    const user = firebase.auth().currentUser;
    try {
      await user?.sendEmailVerification();
      console.log('인증 메일 재 전송 완료');
    } catch (error) {
      console.log(error);
    }
  };
  const onChangePass = (payload: React.SetStateAction<string>) => {
    setPassword(payload);
  };
  const onCheckPass = (payload: React.SetStateAction<string>) => {
    setCheckPass(payload);
  };
  const toFinSignUp = useCallback(async () => {
    if (!password || !checkPass) {
      return Alert.alert('비밀번호를 확인해주세요');
    }
    if (
      !/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/.test(
        email,
      )
    ) {
      return Alert.alert('알림', '올바른 이메일 주소가 아닙니다.');
    }
    if (password !== checkPass) {
      Alert.alert('비밀번호가 다릅니다');
    }
    if (password === checkPass) {
      console.log(name, sex, email, password);
      console.log(Config.API_URL);
      try {
        const response = await axios
          .post(`${Config.API_URL}/api/book`, {
            name,
            sex,
            email,
            password,
          })
          .then(response1 => {
            console.log(response1);
          });
        navigation.navigate('FinishSignUp');
      } catch (error) {
        const errorResponse = (error as AxiosError<{message: string}>).response;
        console.error(errorResponse);
        if (errorResponse) {
          Alert.alert('알림', errorResponse.data.message);
        }
      } finally {
      }
    }
  }, [checkPass, name, sex, email, password, navigation]);
  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.conText}>이메일회원가입페이지</Text>
      </View>
      <View style={styles.container2}>
        <View style={styles.nameView1}>
          <Text style={styles.nameText}>이름</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="이름입력칸"
            onChangeText={onChangeName}
            onSubmitEditing={onSubmitName}
          />
          <Text style={styles.sexText}>성별</Text>
          <TouchableOpacity
            style={[
              styles.sexManBtn,
              {backgroundColor: isCheckMan === '1' ? 'lightskyblue' : 'white'},
            ]}
            onPress={onCheckMan}>
            <Text style={styles.sexManText}>남</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sexFemBtn,
              {backgroundColor: isCheckMan === '2' ? 'lightskyblue' : 'white'},
            ]}
            onPress={onCheckWoman}>
            <Text style={styles.sexFemText}>여</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emailViewContainer}>
          <View style={styles.emailView}>
            <Text style={styles.emailText}>이메일</Text>
            <SignTextInput
              placeholder="이메일 입력칸"
              onChangeText={onChangeEmail}
              onSubmitEditing={undefined}
              keyboardType="email-address"
              textContentType="emailAddress"
              secureTextEntry
              value={email}
            />
          </View>
        </View>
        <SignBtn text="이메일 확인" onPress={onSubmitEmail} />
        {/* <View style={styles.emailverify}>
          <TouchableOpacity style={styles.sexManBtn} onPress={onSubmitEmail1}>
            <Text style={styles.sexManText}>인증확인</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.emailInput}>
            <TextInput style={styles.emailInput}>이메일 재전송</TextInput>
          </TouchableOpacity>
        </View> */}
      </View>
      <View style={styles.container3}>
        <View style={styles.passView1}>
          <Text style={styles.passText}>비밀번호</Text>
          <SignTextInput
            placeholder="비밀번호 입력칸"
            onChangeText={onChangePass}
            onSubmitEditing={undefined}
            keyboardType={undefined}
            textContentType="password"
            secureTextEntry
            value={password}
          />
        </View>
        <View style={styles.passView2}>
          <Text style={styles.passChkText}>비밀번호 확인</Text>
          <SignTextInput
            placeholder="비밀번호확인 입력칸"
            onChangeText={onCheckPass}
            onSubmitEditing={undefined}
            keyboardType={undefined}
            textContentType="password"
            secureTextEntry
            value={undefined}
          />
        </View>
      </View>
      <View style={styles.signView}>
        <SignBtn activeOpacity={0.9} onPress={toFinSignUp} text="회원가입" />
      </View>
    </KeyboardAwareScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 0.7,
    borderBottomWidth: 1,
    borderBottomColor: '#778899',
    borderStyle: 'dashed',
    justifyemail: 'flex-end',
    paddingBottom: 10,
    marginBottom: 10,
    marginTop: 50,
  },
  container2: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 5,
    paddingBottom: 5,
  },
  container3: {
    flex: 0.8,
    paddingTop: 15,
    marginLeft: 20,
    marginRight: 20,
    borderTopColor: '#778899',
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  signView: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  //--//
  conText: {
    fontSize: 30,
    alignSelf: 'center',
  },
  //--//
  nameView1: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  nameText: {
    textAlignVertical: 'center',
    width: WIDTH * 0.2,
    textAlign: 'right',
  },
  nameInput: {
    backgroundColor: 'white',
    width: WIDTH * 0.26,
    marginLeft: 17,
    borderWidth: 1,
    borderRadius: 3,
  },
  sexText: {
    marginLeft: 20,
    textAlignVertical: 'center',
  },
  sexManBtn: {
    backgroundColor: 'white',
    width: WIDTH * 0.13,
    justifyemail: 'center',
    marginLeft: 10,
    borderColor: 'black',
    borderWidth: 1,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  sexManText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    height: 50.7,
    textAlignVertical: 'center',
  },
  sexFemBtn: {
    backgroundColor: 'white',
    width: WIDTH * 0.13,
    justifyemail: 'center',
    borderColor: 'black',
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  sexFemText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    height: 50.7,
    textAlignVertical: 'center',
  },
  emailViewContainer: {},
  //--//
  emailView: {
    flexDirection: 'row',
  },
  emailText: {
    width: WIDTH * 0.2,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  emailverify: {
    flexDirection: 'row',
  },
  emailInput: {
    backgroundColor: 'yellow',
    width: WIDTH * 0.6,
  },
  //--//
  passView1: {
    flexDirection: 'row',
  },
  passText: {
    width: WIDTH * 0.2,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  //--//
  passView2: {
    flexDirection: 'row',
    marginTop: 20,
  },
  passChkText: {
    width: WIDTH * 0.2,
    textAlign: 'right',
    textAlignVertical: 'center',
  },
  //--//
});
export default EmailSignUp;
