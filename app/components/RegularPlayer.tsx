import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Brightness from 'expo-brightness';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RegularVideoPlayerProps {
    videoUrl: string;
    onBack?: () => void;
}

export default function VideoScreen({ videoUrl, onBack }: RegularVideoPlayerProps) {
    const player = useVideoPlayer(videoUrl, (p) => {
        p.loop = true;
        p.play();
    });

    const [brightness, setBrightness] = useState(0.5);
    const [volume, setVolume] = useState(0.5);
    const [seekTime, setSeekTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayType, setOverlayType] = useState<'brightness' | 'volume' | 'seek' | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Get initial brightness
    useEffect(() => {
        const getBrightness = async () => {
            const currentBrightness = await Brightness.getBrightnessAsync();
            setBrightness(currentBrightness);
        };
        getBrightness();
    }, []);
    // Handle gesture movement
    const handleGesture = async (event: any) => {
        const { translationX, translationY, absoluteX } = event.nativeEvent;

        setShowOverlay(true);

        if (Math.abs(translationX) > Math.abs(translationY)) {
            // Horizontal seek
            const seekAmount = (translationX / SCREEN_WIDTH) * (player.duration || 0);
            const newPosition = Math.max(0, Math.min(player.currentTime + seekAmount, player.duration));
            setSeekTime(newPosition);
            setIsSeeking(true);
            setOverlayType('seek');
        } else if (absoluteX < SCREEN_WIDTH / 2) {
            // Brightness control (Left side)
            const newBrightness = Math.max(0, Math.min(1, brightness - translationY / SCREEN_HEIGHT));
            setBrightness(newBrightness);
            await Brightness.setBrightnessAsync(newBrightness);
            setOverlayType('brightness');
        } else {
            // Volume control (Right side)
            const newVolume = Math.max(0, Math.min(1, volume - translationY / SCREEN_HEIGHT));
            setVolume(newVolume);
            player.volume = newVolume;
            setOverlayType('volume');
        }
    };

    const handleGestureEnd = () => {
        if (isSeeking) {
            player.seekBy(seekTime - player.currentTime);
            setIsSeeking(false);
        }
        setShowOverlay(false);
        setOverlayType(null);
    };

    const handleFullscreenEnter = async () => {
        try {
            const currentOrientation = await ScreenOrientation.getOrientationAsync();
            console.log(currentOrientation, 'currentOrientation');
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            await new Promise(resolve => setTimeout(resolve, 500));
            const Orientation = await ScreenOrientation.getOrientationAsync();
            console.log(Orientation, 'Orientation');
            setTimeout(() => {
                setIsFullscreen(false);
            }, 100);
            
            // if (currentOrientation !== ScreenOrientation.Orientation.LANDSCAPE_LEFT && Platform.OS === 'android') {
            //     await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            // } else if (currentOrientation !== ScreenOrientation.Orientation.LANDSCAPE_RIGHT && Platform.OS === 'ios') {
            //     await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
            // }
        } catch (error) {
            console.error('Failed to lock screen orientation:', error);
        }
    };

    const handleFullscreenExit = async () => {
        try {
            const currentOrientation = await ScreenOrientation.getOrientationAsync();
            console.log(currentOrientation, 'currentOrientationExit');
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            setTimeout(() => {
                setIsFullscreen(false);
            }, 100);
        // if (currentOrientation !== ScreenOrientation.Orientation.PORTRAIT_UP) {
            //     await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
            // }
        } catch (error) {
            console.error('Failed to unlock screen orientation:', error);
        }
    };

    const formatTime = (time: number): string => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        } else {
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    };

    return (
        <PanGestureHandler
            onGestureEvent={handleGesture}
            onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                    handleGestureEnd();
                }
            }}
        >
            <View style={styles.container}>
                <VideoView
                    style={styles.video}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                    onFullscreenEnter={handleFullscreenEnter}
                    onFullscreenExit={handleFullscreenExit}
                />
                {showOverlay && overlayType === 'brightness' && (
                    <Text style={styles.overlayText}>Brightness: {Math.round(brightness * 100)}%</Text>
                )}
                {showOverlay && overlayType === 'volume' && (
                    <Text style={[styles.overlayText, { bottom: 50 }]}>Volume: {Math.round(volume * 100)}%</Text>
                )}
                {showOverlay && overlayType === 'seek' && (
                    <Text style={styles.seekIndicator}>
                        {formatTime(seekTime)} / {formatTime(player.duration || 0)}
                    </Text>
                )}
            </View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    overlayText: {
        position: 'absolute',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
        top: 50,
    },
    seekIndicator: {
        position: 'absolute',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
        borderRadius: 5,
        fontSize: 18,
        top: 100,
    },
});