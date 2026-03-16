import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTinyDevice = width < 320;
  const isLandscape = width > height;

  const handleLogin = () => {
    router.push('../login');
  };

  const handleSignUp = () => {
    router.push('../register');
  };

  const logoHeight = isTinyDevice ? 120 : isSmallDevice ? 140 : 167;
  const titleSize = isTinyDevice ? 28 : isSmallDevice ? 32 : 38;
  const subtitleSize = isTinyDevice ? 14 : isSmallDevice ? 16 : 18;
  const buttonHeight = isTinyDevice ? 44 : 48;
  const buttonMargin = isTinyDevice ? 4 : 6;

  const buttonDirection = isTinyDevice ? 'column' : 'row';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.card, isSmallDevice && styles.cardSmall]}>
          <Image
            source={require('../assets/images/logo_azautos2.png')}
            style={[styles.logo, { height: logoHeight }]}
            resizeMode="stretch"
          />
          <Text style={[styles.storeName, { fontSize: titleSize }]}>
            AZ Autos
          </Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
            Sua revenda de confiança
          </Text>

          <View
            style={[
              styles.buttonContainer,
              { flexDirection: buttonDirection },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                {
                  height: buttonHeight,
                  marginHorizontal: buttonDirection === 'row' ? buttonMargin : 0,
                  marginBottom: buttonDirection === 'column' ? 10 : 0,
                  width: buttonDirection === 'column' ? '100%' : undefined,
                },
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                {
                  height: buttonHeight,
                  marginHorizontal: buttonDirection === 'row' ? buttonMargin : 0,
                  marginBottom: buttonDirection === 'column' ? 0 : 0,
                  width: buttonDirection === 'column' ? '100%' : undefined,
                },
              ]}
              onPress={handleSignUp}
            >
              <Text style={styles.buttonText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardSmall: {
    padding: 24,
  },
  logo: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
  },
  storeName: {
    fontWeight: '700',
    color: '#d32f2f',
    marginBottom: 8,
  },
  subtitle: {
    color: '#4b4b4b',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#d32f2f',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});