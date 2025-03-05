import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, Button, Modal } from 'react-native';
import {Video, ResizeMode} from 'expo-av';

const { width, height } = Dimensions.get('window');

interface RegularVideoPlayerProps {
    videoUrl: string; // Ensure this is a string
  }

export default function VideoScene({videoUrl} : RegularVideoPlayerProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <View style={styles.container}>
            {/* Normal video view (half height) */}
            {!isFullScreen && (
                <View style={styles.videoContainer}>
                    <Video
                        source={require('../../assets/video/sample.mp4')}
                        // source={videoUrl}
                        style={styles.video}
                        resizeMode={ResizeMode.COVER}
                        useNativeControls
                        shouldPlay
                    />
                    <Button title="Maximize" onPress={toggleFullScreen} />
                </View>
            )}

            {/* Fullscreen modal view */}
            <Modal visible={isFullScreen} animationType="fade" transparent={true}>
                <View style={styles.fullScreenModal}>
                    <Video
                        source={require('../../assets/video/sample.mp4')}
                        style={styles.fullScreenVideo}
                        resizeMode={ResizeMode.COVER}
                        useNativeControls
                        shouldPlay
                    />
                    <View style={styles.fullScreenButton}>
                        <Button title="Minimize" onPress={toggleFullScreen} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    videoContainer: {
        width: width,
        height: height * 0.5, // Half screen height
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: width,
        height: height * 0.5,
    },
    fullScreenModal: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenVideo: {
        width: width,
        height: height,
    },
    fullScreenButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
});
