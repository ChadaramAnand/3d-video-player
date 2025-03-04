import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    YourComponent: undefined;
    Local: undefined;
  };
  
  type YourComponentNavigationProp = StackNavigationProp<RootStackParamList, 'Local'>;

export default function HomeScreen() {
    const navigation = useNavigation<YourComponentNavigationProp>();

  const handlePress = () => {
    navigation.navigate('Local');
  };

    return (
        <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Open 3D Video Player</Text>
      </TouchableOpacity>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    button: {
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
  });
  
