import React, { useState, useEffect } from 'react';
import { Button, Text, SafeAreaView, ScrollView, StyleSheet, Image, View, Platform, Alert, TouchableOpacity, Pressable } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';

type Album = MediaLibrary.Album;
type Asset = MediaLibrary.Asset;
type DocumentPickerResult = {
  assets?: Array<{
    uri: string;
    mimeType: string | null;
    name: string;
    size: number | null;
  }>;
  canceled: boolean;
};
type VideoAlbum = {
  album: Album;
  videoCount: number;
};

export default function VideoBrowser() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videoAlbums, setVideoAlbums] = useState<VideoAlbum[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [pickedVideos, setPickedVideos] = useState<{ uri: string }[]>([]);

  // Fetch albums when the component mounts
  useEffect(() => {
    getAlbums();
  }, []);

  async function getAlbums() {
    if (permissionResponse?.status !== 'granted') {
      const response = await requestPermission();
      if (response?.status !== 'granted') {
        Alert.alert('Permission Required', 'App needs access to media library to show video albums.');
        return;
      }
    }

    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    const videoAlbum: VideoAlbum[] = [];

    // Loop through albums and check video count
    for (const album of fetchedAlbums) {
      const videoAssets = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: ['video'],
        first: 1, 
      });

      if (videoAssets.totalCount > 0) {
        videoAlbum.push({
          album,
          videoCount: videoAssets.totalCount,
        });
      }
    }
    console.log(videoAlbum, 'videoAlbum');
    console.log(fetchedAlbums, 'fetchedAlbums');
    
    setAlbums(fetchedAlbums);
    setVideoAlbums(videoAlbum)
  }

  async function pickVideo() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
    });

    if (result.canceled) {
      console.log('User cancelled video picking');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const selectedVideo = result.assets[0];  // Access the first selected video
      setPickedVideos((prev) => [...prev, { uri: selectedVideo.uri }]);
    } else {
      console.warn('No assets returned');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={getAlbums} title="Refresh Albums" />
      <Button onPress={pickVideo} title="Pick Video from Files" />
      <ScrollView>
        <Text style={styles.sectionTitle}>Video Albums</Text>
        {videoAlbums.map((album, i) => (
          <AlbumEntry key={i} album={album.album} videoCount={album.videoCount} />
        ))}

        <Text style={styles.sectionTitle}>Picked Videos (Document Picker)</Text>
        <View style={styles.videoList}>
          {pickedVideos.map((video, index) => (
            <View key={index} style={styles.pickedVideoContainer}>
              <Text style={styles.videoText}>Picked Video {index + 1}</Text>
              <Text style={styles.videoUri}>{video.uri}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type AlbumEntryProps = {
  album: Album;
  videoCount: number;
};

function AlbumEntry({ album, videoCount }: AlbumEntryProps) {
  const router = useRouter();
  function getAlbumVideos() {
    // navigation.navigate('AlbumVideos', {albumId: album.id, albumTitle: album.title});
    console.log(album, 'album');
    
    router.push({
        pathname: '/components/albumVideos',
        params: { albumId: album.id, albumTitle: album.title },
    })
  }

  return (
    <View key={album.id} style={styles.albumContainer}>
      <Pressable onPress={getAlbumVideos} style={styles.albumRow}>
        <View style={styles.folderIcon}>
          <Text style={styles.folderIconText}>📁</Text>
        </View>
        <View style={styles.albumDetails}>
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.albumSubtitle}>
            {videoCount} {videoCount === 1 ? 'video' : 'videos'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  albumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  folderIconText: {
    fontSize: 24,
  },
  albumDetails: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  albumSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  albumContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 4,
  },
  albumAssetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 50,
    height: 50,
    marginRight: 4,
  },
  videoList: {
    paddingHorizontal: 10,
  },
  pickedVideoContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  videoText: {
    fontWeight: 'bold',
  },
  videoUri: {
    fontSize: 12,
    color: 'gray',
  },
});
