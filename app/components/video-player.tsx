import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import VideoScene from './VideoScene';

export default function VideoPlayerScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>3D Video Player Screen</Text>
            <VideoScene />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
});
