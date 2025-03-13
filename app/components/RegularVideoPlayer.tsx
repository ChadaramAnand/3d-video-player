import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity
} from 'react-native';
import {
    Video,
    ResizeMode,
    AVPlaybackStatus
} from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Brightness from 'expo-brightness';
import {
    PanGestureHandler,
    GestureHandlerGestureEvent,
    State
} from 'react-native-gesture-handler';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RegularVideoPlayerProps {
    videoUrl: string;
    onBack?: () => void;
}

export default function VideoScreen({ videoUrl, onBack }: RegularVideoPlayerProps) {
    const videoRef = useRef<Video>(null);
    const [brightness, setBrightness] = useState(0.5);
    const [showOverlay, setShowOverlay] = useState(false);
    const [seekTime, setSeekTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [overlayType, setOverlayType] = useState<'brightness' | 'volume' | 'seek' | null>(null);
    const [volume, setVolume] = useState(1);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [videoPosition, setVideoPosition] = useState<number>(0);

    useEffect(() => {
        const fetchBrightness = async () => {
            const currentBrightness = await Brightness.getBrightnessAsync();
            setBrightness(currentBrightness);
        };
        fetchBrightness();
    }, []);

    useEffect(() => {
        const lockInitialOrientation = async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        };
        lockInitialOrientation();

        return () => {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
        };
    }, []);

    const handleGesture = async (event: PanGestureHandlerGestureEvent) => {
        const { translationX, translationY, absoluteX } = event.nativeEvent as {
            translationX: number;
            translationY: number;
            absoluteX: number;
        };

        setShowOverlay(true);

        if (Math.abs(translationX) > Math.abs(translationY)) {
          if (videoRef.current) {
              const status = await videoRef.current.getStatusAsync();
              if (status.isLoaded && 'durationMillis' in status && 'positionMillis' in status) {
                  const duration = status.durationMillis ?? 0;
                  const position = status.positionMillis ?? 0;

                  const seekAmount = (translationX / SCREEN_WIDTH) * duration;
                  const newPosition = Math.max(0, Math.min(position + seekAmount, duration));

                  setSeekTime(newPosition);
                  setIsSeeking(true);
                  setOverlayType('seek');
              }
          }
        } else if (absoluteX < SCREEN_WIDTH / 2) {
            const newBrightness = Math.max(0, Math.min(1, brightness - translationY / SCREEN_HEIGHT));
            setBrightness(newBrightness);
            await Brightness.setBrightnessAsync(newBrightness);
            setOverlayType('brightness');
        } else {
            const newVolume = Math.max(0, Math.min(1, volume - translationY / SCREEN_HEIGHT));
            setVolume(newVolume);
            if (videoRef.current) {
                await videoRef.current.setVolumeAsync(newVolume);
            }
            setOverlayType('volume');
        }
    };

    const handleGestureEnd = async () => {
        if (isSeeking && videoRef.current) {
            await videoRef.current.setPositionAsync(seekTime);
            setIsSeeking(false);
        }
        setShowOverlay(false);
        setOverlayType(null);
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        if ('durationMillis' in status && 'positionMillis' in status) {
            setVideoDuration(status.durationMillis ?? 0);
            setVideoPosition(status.positionMillis ?? 0);
        }
    };

    const formatTime = (time: number): string => {
      const seconds = Math.floor(time / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

    const changeScreenOrientation = async (isLandscape: boolean) => {
        if (isLandscape) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        }
    };

    const onReadyForDisplay = (event: any) => {
        if (event.naturalSize) {
            const isLandscape = event.naturalSize.width > event.naturalSize.height;
            changeScreenOrientation(isLandscape);
        }
    };

    const handleFullScreenUpdate = (event: any) => {
        if (event.fullscreenUpdate > 2 && onBack) {
            // onBack();
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
            <View style={styles.contentContainer}>
                <Video
                    ref={videoRef}
                    style={styles.video}
                    source={{ uri: videoUrl }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping
                    shouldPlay
                    onReadyForDisplay={onReadyForDisplay}
                    onFullscreenUpdate={handleFullScreenUpdate}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                />

                {showOverlay && overlayType && (
                    <View style={styles.overlay}>
                            <Text style={styles.overlayText}>
                                                    {overlayType === 'brightness' && `Brightness: ${Math.round(brightness * 100)}%`}
                                                    {overlayType === 'volume' && `Volume: ${Math.round(volume * 100)}%`}
                                                    {overlayType === 'seek' && `${formatTime(seekTime)} / ${formatTime(videoDuration)}`}
                            </Text>
                    </View>
                )}
            </View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    video: {
        alignSelf: 'center',
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: '10%',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 10,
    },
    overlayText: {
        color: 'white',
        fontSize: 18,
    },
});
