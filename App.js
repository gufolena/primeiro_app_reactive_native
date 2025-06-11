import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen'; // Já adaptado para agentes
import DetailsScreen from './screens/DetailsScreen'; // Já adaptado para agentes
import FavoritesScreen from './screens/FavoritesScreen'; // Já adaptado para agentes
import { Provider as PaperProvider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Favoritos') {
            iconName = 'favorite';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF4500', // Um tom de laranja/vermelho que remete ao Valorant
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* Nomes das abas permanecem os mesmos, mas o conteúdo é sobre agentes */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Details"
            component={DetailsScreen}
            // AQUI ESTÁ A MUDANÇA: O título da tela de detalhes
            options={{ title: 'Detalhes do Agente' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}