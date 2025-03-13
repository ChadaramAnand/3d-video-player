import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, VideoReadyForDisplayEvent } from 'expo-av';
import * as Brightness from 'expo-brightness';
import { PanGestureHandler, State, GestureHandlerGestureEvent, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
    videoUrl: string;
    onBack?: () => void;
}

export default function VideoPlayer({ videoUrl, onBack }: VideoPlayerProps) {
    const videoRef = useRef<Video>(null);
    const [brightness, setBrightness] = useState(0.5);
    const [volume, setVolume] = useState(1);
    const [seekTime, setSeekTime] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [overlayType, setOverlayType] = useState<'brightness' | 'volume' | 'seek' | null>(null);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [videoPosition, setVideoPosition] = useState<number>(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isControlsVisible, setIsConrolsVisible] = useState(false);
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);  
    const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
    
    useEffect(() => {
        const fetchBrightness = async () => {
            const currentBrightness = await Brightness.getBrightnessAsync();
            setBrightness(currentBrightness);
        };
        fetchBrightness();
    }, []);

    useEffect(() => {
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
        }
        if (isControlsVisible) {
            controlsTimeout.current = setTimeout(() => {
                setIsConrolsVisible(false);
                controlsTimeout.current = null;
            }, 3000);
        }
        return () => {
            if (controlsTimeout.current) {
                clearTimeout(controlsTimeout.current);
            }
        };
    }, [isControlsVisible]);
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

    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            } else {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            }
            setIsFullscreen(!isFullscreen);
        } catch (error) {
            console.error('Error changing screen orientation:', error);
        }
    };

    const togglePlayPause = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const seekForward = async () => {
        if (videoRef.current) {
            const newPosition = Math.min(videoPosition + 10000, videoDuration);
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    const seekBackward = async () => {
        if (videoRef.current) {
            const newPosition = Math.max(videoPosition - 10000, 0);
            await videoRef.current.setPositionAsync(newPosition);
        }
    };

    const formatTime = (time: number): string => {
        const seconds = Math.floor(time / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleVideoTap = () => {
        if (!isControlsVisible) setIsConrolsVisible(true);
        else setIsConrolsVisible(false);
    }
    const onReadyForDisplay = (event: VideoReadyForDisplayEvent) => {
        if (!videoDimensions) {
          setVideoDimensions(event.naturalSize);
          const isLandscape = event.naturalSize.width > event.naturalSize.height;
    
          changeScreenOrientation(isLandscape);
        }
      };
      const changeScreenOrientation = async (isLandscape: boolean) => {
          if (isLandscape) {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
          } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
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
                <TouchableWithoutFeedback onPress={handleVideoTap}>
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{ uri: videoUrl }}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        isLooping
                        onReadyForDisplay={onReadyForDisplay}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    />
                </TouchableWithoutFeedback>
                {showOverlay && (
                    <Text style={styles.overlayText}>
                        {overlayType === 'brightness' && `Brightness: ${Math.round(brightness * 100)}%`}
                        {overlayType === 'volume' && `Volume: ${Math.round(volume * 100)}%`}
                        {overlayType === 'seek' && `${formatTime(seekTime)} / ${formatTime(videoDuration)}`}
                    </Text>
                )}
                {isControlsVisible && (
                    <View style={styles.centerControls}>
                        <TouchableOpacity onPress={seekBackward}>
                            <AntDesign name="banckward" size={40} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={togglePlayPause}>
                            <Feather name={isPlaying ? "pause" : "play"} size={50} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={seekForward}>
                            <AntDesign name="forward" size={40} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
                {isControlsVisible && (
                    <View style={styles.bottomControls}>
                        <Slider
                            value={videoPosition}
                            maximumValue={videoDuration}
                            onSlidingComplete={(value: number) => videoRef.current?.setPositionAsync(value)}
                            style={styles.seekBar}
                            minimumTrackTintColor="white"
                            thumbTintColor="white"
                        />
                        <TouchableOpacity onPress={toggleFullscreen}>
                            <MaterialIcons name={isFullscreen ? "fullscreen-exit" : "fullscreen"} size={30} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </PanGestureHandler>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
    video: { width: '100%', height: '100%' },
    overlayText: { position: 'absolute', top: 50, alignSelf: 'center', color: 'white', fontSize: 18 },
    centerControls: { flexDirection: 'row', position: 'absolute', alignSelf: 'center', justifyContent: 'space-around', width: '60%' },
    bottomControls: { position: 'absolute', bottom: 20, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    seekBar: { flex: 1, marginHorizontal: 10 },
});
