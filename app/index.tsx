import { Link } from 'expo-router';
import { View, Button } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Link href="/video-player" asChild>
                <Button title="Open 3D Video Player" />
            </Link>
        </View>
    );
}
