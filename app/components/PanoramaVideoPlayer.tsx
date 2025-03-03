import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PanoramaVideoPlayer() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>360 Panorama Video Player (Coming Soon)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222',
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
});
