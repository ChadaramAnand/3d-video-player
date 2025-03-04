import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  AlbumEntry: undefined;
  AlbumVideos: {
    albumId: string;
    albumTitle: string;
  };
};

type AlbumVideosRouteProp = RouteProp<RootStackParamList, 'AlbumVideos'>;

type Asset = MediaLibrary.Asset;

export default function AlbumVideos() {
    const route = useRoute<AlbumVideosRouteProp>();
    const { albumId, albumTitle } = route.params;
    const [videos, setVideos] = useState<Asset[]>([]);

    useEffect(() => {
        fetchAlbumVideos();
    }, []);

    async function fetchAlbumVideos() {
        let allAssets: Asset[] = [];
        let after: string | undefined = undefined;
        let hasNextPage = true;

        while (hasNextPage) {
            const result = await MediaLibrary.getAssetsAsync({
                album: albumId,
                mediaType: ['video'],
                first: 100, // Get 100 assets at a time
                after: after,
            });
            allAssets = allAssets.concat(result.assets);
            after = result.endCursor;
            hasNextPage = result.hasNextPage;
        }

        setVideos(allAssets);
    }

    const renderVideo = ({ item }: { item: Asset }) => (
        <View style={styles.videoItem}>
            <Image source={{ uri: item.uri }} style={styles.thumbnail} />
            <Text numberOfLines={1} style={styles.videoName}>{item.filename}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{albumTitle}</Text>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideo}
                numColumns={3}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    videoItem: { width: '30%', margin: '1.5%', alignItems: 'center' },
    thumbnail: { width: 100, height: 100, borderRadius: 8 },
    videoName: { fontSize: 12, textAlign: 'center', marginTop: 5 },
});
