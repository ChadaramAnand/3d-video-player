// import { Stack } from 'expo-router';
import { createStackNavigator } from '@react-navigation/stack';
import AlbumVideos from './components/albumVideos';
import index from './index';
import localVideo from './components/local-video';

const Stack = createStackNavigator();

export default function Layout() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={index} />
            <Stack.Screen name="Local" component={localVideo} />
            <Stack.Screen name="AlbumVideos" component={AlbumVideos} />
        </Stack.Navigator>
    );
}
