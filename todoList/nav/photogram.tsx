import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from '../src/screen/auth/login';
import Verification from '../src/screen/auth/verification';
import AddPhoto from '../src/screen/photogram/addPost';
import Home from '../src/screen/photogram/home';
import CircleList from '../src/screen/setting';
import AddCircle from '../src/screen/addCircle';
import CircleRequest from '../src/screen/circleRequest';
import ChatScreen from '../src/screen/chat';
import ChatDetail from '../src/screen/chatDetail';
import SettingScreen from '../src/screen/settingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
export function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Homescreen" component={Home} />
      <Stack.Screen name="AddPhoto" component={AddPhoto} />
    </Stack.Navigator>
  );
}

export function CircleStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyCircle"
        component={CircleList}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="AddCircle" component={AddCircle} />
      <Stack.Screen name="CircleRequest" component={CircleRequest} />
    </Stack.Navigator>
  );
}

export function ChatStack() {
  return (
    <Stack.Navigator initialRouteName="ChatScreen">
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetail} />
    </Stack.Navigator>
  );
}

export function SettingStack() {
  return (
    <Stack.Navigator initialRouteName="SettingScreen">
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
    </Stack.Navigator>
  );
}
export function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={MyStack} />
      <Tab.Screen name="MyCircleScreen" component={CircleStack} />
      <Tab.Screen name="ChatStack" component={ChatStack} />
      <Tab.Screen name="SettingStack" component={SettingStack} />
    </Tab.Navigator>
  );
}

export function BeforeLogin() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Login} />
      <Stack.Screen name="Verify" component={Verification} />
    </Stack.Navigator>
  );
}
