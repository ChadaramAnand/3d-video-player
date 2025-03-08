// import { Stack } from 'expo-router';
import { createStackNavigator } from '@react-navigation/stack';
import AlbumVideos from './components/albumVideos';
import index from './index';
import localVideo from './components/local-video';
import VideoScene from './components/VideoScene';
import { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';


type RootStackParamList = {
    Folders: undefined; 
    AlbumVideos: {
        albumId: string;
        albumTitle: string;
    };
    VideoScene: {
        videoId: string;
        videoUrl: string;
        videoTitle: string;
    };
};

const Stack = createStackNavigator<RootStackParamList>();


export default function Layout() {
    return (
        <Stack.Navigator>
            {/* <Stack.Screen name="Home" component={index} /> */}
            <Stack.Screen name="Folders" component={localVideo} />
            <Stack.Screen name="AlbumVideos" component={AlbumVideos} 
                options={({ route }: { route: RouteProp<RootStackParamList, 'AlbumVideos'>}) => ({
                title: route.params?.albumTitle ?? 'Album Videos',
            })} />
            <Stack.Screen name="VideoScene" component={VideoScene} />
        </Stack.Navigator>
    );
}
