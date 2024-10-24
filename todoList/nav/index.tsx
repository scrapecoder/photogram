import {createStackNavigator} from '@react-navigation/stack';
import Home from '../src/screen/home';
import AddTask from '../src/screen/addTask';
import Login from '../src/screen/auth/login';
import Verification from '../src/screen/auth/verification';
import TaskDetail from '../src/screen/detail';

const Stack = createStackNavigator();

export function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="AddTask" component={AddTask} />
      <Stack.Screen name="TaskDetail" component={TaskDetail} />
    </Stack.Navigator>
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
