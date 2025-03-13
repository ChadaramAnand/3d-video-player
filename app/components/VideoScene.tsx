import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import RegularVideoPlayer from './Regular';
import PanoramaVideoPlayer from './PanoramaVideoPlayer';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Future import (you'll add this when ready for 3D)
// import ThreeDSceneWithVideo from './ThreeDSceneWithVideo';


type RootStackParamList = {
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

type VideoSceneRouteProp = RouteProp<RootStackParamList, 'VideoScene'>;

export default function VideoScene() {
    const [mode, setMode] = useState<'regular' | '360' | '3d'>('regular');
    const route = useRoute<VideoSceneRouteProp>();
    const { videoId, videoUrl, videoTitle } = route.params;
    const navigation = useNavigation();
    const handleBack = () => {
        navigation.goBack();
      };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.header}>Choose Video Mode</Text>

            <View style={styles.buttonContainer}>
                <Button title="Regular Video" onPress={() => setMode('regular')} />
                <Button title="360 Video" onPress={() => setMode('360')} />
                <Button title="3D Scene" onPress={() => setMode('3d')} />
            </View>

            <View style={styles.playerContainer}>
                {mode === 'regular' && <RegularVideoPlayer videoUrl={videoUrl} />}
                {mode === '360' && <PanoramaVideoPlayer />}
                {mode === '3d' && (
                    <Text style={styles.placeholder}>3D Scene Video - (Coming Soon)</Text>
                    // Once ready, replace above with <ThreeDSceneWithVideo />
                )}
            </View> */}
            <RegularVideoPlayer videoUrl={videoUrl} onBack={handleBack}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    playerContainer: {
        flex: 1,
    },
    placeholder: {
        color: 'lightgray',
        textAlign: 'center',
        marginTop: 50,
    },
});
