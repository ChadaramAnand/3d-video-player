import { Stack } from 'expo-router';

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="video" options={{ title: "3D Video Player" }} />
            <Stack.Screen name="/components/albumVideos" options={{ title: "Album Videos" }} />
        </Stack>
    );
}
