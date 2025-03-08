import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Alert,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type Album = MediaLibrary.Album;
type VideoAlbum = {
  album: Album;
  videoCount: number;
};

type RootStackParamList = {
  AlbumVideos: { albumId: string; albumTitle: string };
};

type AlbumVideosNavigationProp = StackNavigationProp<RootStackParamList, 'AlbumVideos'>;

export default function VideoBrowser() {
  const [videoAlbums, setVideoAlbums] = useState<VideoAlbum[]>([]);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [pickedVideos, setPickedVideos] = useState<{ uri: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlbums(false); // Initial fetch - no toast
  }, []);

  async function fetchAlbums(showToast = false) {
    setLoading(true);
    await getAlbums(showToast);
    setLoading(false);
  }

  async function getAlbums(showToast = false) {
    if (permissionResponse?.status !== 'granted') {
      const response = await requestPermission();
      if (response?.status !== 'granted') {
        Alert.alert('Permission Required', 'App needs access to media library to show video albums.');
        return;
      }
    }

    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    const videoAlbumList: VideoAlbum[] = [];

    for (const album of fetchedAlbums) {
      const videoAssets = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: ['video'],
        first: 1,
      });
      if (videoAssets.totalCount > 0) {
        videoAlbumList.push({ album, videoCount: videoAssets.totalCount });
      }
    }

    setVideoAlbums(videoAlbumList);

    if (showToast) {
      Toast.show({
        type: 'success',
        text1: 'Albums Refreshed',
        text2: 'Video albums list has been refreshed.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }

  async function pickVideo() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
    if (result.canceled) return;

    if (result.assets && result.assets.length > 0) {
      setPickedVideos((prev) => [...prev, { uri: result.assets[0].uri }]);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await getAlbums(true); // Always show toast for pull-to-refresh
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <VideoAlbumsHeader onRefresh={() => fetchAlbums(true)} onPickVideo={pickVideo} />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
        ) : (
          videoAlbums.map((album, i) => (
            <AlbumEntry key={i} album={album.album} videoCount={album.videoCount} />
          ))
        )}

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
      <Toast />
    </SafeAreaView>
  );
}

// Header Component
function VideoAlbumsHeader({ onRefresh, onPickVideo }: { onRefresh: () => void; onPickVideo: () => void }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null)

  const showMenu = () => {
    menuButtonRef.current?.measure((_, __, width, height, pageX, pageY) => {
      setMenuPosition({
        x: pageX + width - 160,
        y: pageY + height,
      });
      setMenuVisible(true);
    });
  };

  return (
    <View style={styles.headerRow}>
      <Text style={styles.sectionTitle}>Video Albums</Text>
      <TouchableOpacity ref={menuButtonRef} onPress={showMenu} activeOpacity={0.6} style={styles.menuButton}>
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>

      <Modal transparent visible={menuVisible} animationType="none" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={[styles.menuContainer, { top: menuPosition.y, left: menuPosition.x }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onRefresh(); }}>
              <Text style={styles.menuText}>Refresh Albums</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); onPickVideo(); }}>
              <Text style={styles.menuText}>Pick Video from Files</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Album Entry Component
function AlbumEntry({ album, videoCount }: { album: Album; videoCount: number }) {
  const navigation = useNavigation<AlbumVideosNavigationProp>();

  const openAlbumVideos = () => {
    navigation.navigate('AlbumVideos', { albumId: album.id, albumTitle: album.title });
  };

  return (
    <TouchableOpacity onPress={openAlbumVideos} style={styles.albumContainer}>
      <View style={styles.albumRow}>
        <View style={styles.folderIcon}>
          <Text style={styles.folderIconText}>📁</Text>
        </View>
        <View>
          <Text style={styles.albumTitle}>{album.title}</Text>
          <Text style={styles.albumSubtitle}>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'android' ? 10 : 0 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginVertical: 5, marginTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  menuIcon: { fontSize: 22, fontWeight: 'bold' },
  menuButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',  
    borderRadius: 5,             
  },
  modalOverlay: { flex: 1 },
  menuContainer: { position: 'absolute', backgroundColor: 'white', padding: 10, borderRadius: 8, elevation: 10, width: 160 },
  menuItem: { paddingVertical: 10 },
  menuText: { fontSize: 16 },
  albumContainer: { paddingHorizontal: 20, marginBottom: 12 },
  albumRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  folderIcon: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8 },
  folderIconText: { fontSize: 24 },
  albumTitle: { fontSize: 16, fontWeight: 'bold' },
  albumSubtitle: { fontSize: 14, color: '#555' },
  videoList: { paddingHorizontal: 10 },
  pickedVideoContainer: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 8 },
  videoText: { fontWeight: 'bold' },
  videoUri: { fontSize: 12, color: 'gray' },
  loader: { marginVertical: 20 },
});
