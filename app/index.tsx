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
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTinyDevice = width < 320;
  const isLandscape = width > height;

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  const logoHeight = isTinyDevice ? 120 : isSmallDevice ? 140 : 160;
  const titleSize = isTinyDevice ? 28 : isSmallDevice ? 32 : 36;
  const subtitleSize = isTinyDevice ? 14 : isSmallDevice ? 15 : 16;
  const buttonHeight = isTinyDevice ? 50 : 54;
  const buttonMargin = isTinyDevice ? 4 : 6;

  const buttonDirection = isTinyDevice ? 'column' : 'row';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.card, isSmallDevice && styles.cardSmall]}>
          {/* Logo */}
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

          <View style={styles.divider} />

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
                  marginBottom: buttonDirection === 'column' ? 12 : 0,
                  width: buttonDirection === 'column' ? '100%' : undefined,
                },
              ]}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Feather name="log-in" size={20} color="#fff" style={styles.buttonIcon} />
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
              activeOpacity={0.9}
            >
              <Feather name="user-plus" size={20} color="#fff" style={styles.buttonIcon} />
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 39,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
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
    fontWeight: '800',
    color: '#d32f2f',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#6b6b6b',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '500',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#d32f2f',
    borderRadius: 2,
    marginBottom: 32,
    opacity: 0.5,
  },
  buttonContainer: {
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#d32f2f',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
});