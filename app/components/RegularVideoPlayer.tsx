import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Video, ResizeMode, VideoReadyForDisplayEvent, VideoFullscreenUpdateEvent } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import { BackHandler } from 'react-native';

interface RegularVideoPlayerProps {
  videoUrl: string;
  onBack?: () => void;
}

export default function VideoScreen({ videoUrl, onBack }: RegularVideoPlayerProps) {
  const video = useRef<Video>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const lockInitialOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };

    lockInitialOrientation();

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, []);

  useEffect(() => {
    if (video.current) {
      video.current.presentFullscreenPlayer();
      video.current.playAsync();
    }
  }, [video.current]);

  const changeScreenOrientation = async (isLandscape: boolean) => {
    if (isLandscape) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  };

  const onReadyForDisplay = (event: VideoReadyForDisplayEvent) => {
    if (!videoDimensions) {
      setVideoDimensions(event.naturalSize);
      const isLandscape = event.naturalSize.width > event.naturalSize.height;

      changeScreenOrientation(isLandscape);
    }
  };
  const handleFullScreenUpdate = (event: VideoFullscreenUpdateEvent) => {
    if(event.fullscreenUpdate > 2 && onBack) {
        onBack();
    }
  }

  return (
    <View style={styles.contentContainer}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: videoUrl,
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onReadyForDisplay={onReadyForDisplay}
        onFullscreenUpdate={handleFullScreenUpdate}
      />
    </View>
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
});