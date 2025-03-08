import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


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

type AlbumVideosRouteProp = RouteProp<RootStackParamList, 'AlbumVideos'>;
type VideoSceneNavigationProp = StackNavigationProp<RootStackParamList, 'VideoScene'>;

type Asset = MediaLibrary.Asset;

export default function AlbumVideos() {
    const route = useRoute<AlbumVideosRouteProp>();
    const navigation = useNavigation<VideoSceneNavigationProp>();
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

    const formatDuration = (duration: number) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);
    
        if (hours > 0) {
            // Format as h:mm:ss
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            // Format as mm:ss
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    };

    const renderVideo = ({ item }: { item: Asset }) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() =>
                navigation.navigate('VideoScene', {
                    videoId: item.id,
                    videoUrl: item.uri,
                    videoTitle: item.filename,
                })
            }
        >
            <View style={styles.videoItem}>
                <View style={styles.thumbnailContainer}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                <View style={styles.durationContainer}>
                    <Text style={styles.durationText}>
                        {formatDuration(item.duration)}
                    </Text>
                </View>
            </View>
            <Text numberOfLines={1} style={styles.videoName}>
                {item.filename}
            </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderVideo}
                numColumns={1}
                key="singleColumnList"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    // videoItem: { width: '30%', margin: '1.5%', alignItems: 'center', flexDirection: 'row' },
    videoItem: {
        width: '100%',    // Take full width to show filename properly
        marginVertical: 2,
        alignItems: 'center',
        flexDirection: 'row',    // Keep thumbnail and text in row
        paddingHorizontal: 10,   // Add some padding
    },
    thumbnail: {
        width: 100,
        height: 80,
        borderRadius: 8,
    },
    videoName: {
        fontSize: 16,
        flexShrink: 1,       // Allow it to shrink if needed
        marginLeft: 10,      // Space between thumbnail and text
    },
    videoTitle: {flex: 1},
    thumbnailContainer: {
        position: 'relative', // Allows absolute positioning of duration
    },
    durationContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    durationText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    }
});
