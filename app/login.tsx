import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Feather } from '@expo/vector-icons';
import { database } from '../services/connectionFirebase';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';
import { Toast } from '../components/toast'; //  Toast

const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string) => {
  return password.length >= 6;
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para o Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  // Efeito para esconder o ícone de mostrar senha do navegador (apenas web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const styleId = 'hide-browser-password-reveal-login';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      input[type="password"]::-webkit-credentials-auto-fill-button,
      input[type="password"]::-webkit-credentials-auto-fill-button:focus,
      input[type="password"]::-webkit-textfield-decoration-container,
      input[type="password"]::-webkit-reveal-button {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      input[type="password"]::-moz-reveal {
        display: none !important;
      }
      input[type="password"]::-ms-reveal {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const checkEmailExists = async (emailToCheck: string): Promise<boolean> => {
    if (!emailToCheck || !isValidEmail(emailToCheck)) return false;
    
    try {
      const usersRef = ref(database, 'users');
      const emailQuery = query(usersRef, orderByChild('email'), equalTo(emailToCheck));
      const snapshot = await get(emailQuery);
      return snapshot.exists();
    } catch (error) {
      console.error('Erro ao verificar e-mail:', error);
      return false;
    }
  };

  const handleFieldChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
      if (errors.email === 'E-mail não cadastrado no sistema') {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } else {
      setPassword(value);
      if (value === '') {
        setShowPassword(false);
      }
    }

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = async (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'email' ? email : password;
    await validateField(field, value);
  };

  const validateField = async (field: 'email' | 'password', value: string): Promise<string> => {
    let errorMessage = '';

    if (field === 'email') {
      if (!value.trim()) {
        errorMessage = 'E-mail é obrigatório';
      } else if (!isValidEmail(value)) {
        errorMessage = 'E-mail inválido (exemplo@gmail.com)';
      } else {
        // Verifica se o e-mail existe no sistema
        setCheckingEmail(true);
        const emailExists = await checkEmailExists(value);
        setCheckingEmail(false);
        
        if (!emailExists) {
          errorMessage = 'E-mail não cadastrado no sistema';
        }
      }
    } else if (field === 'password') {
      if (!value) {
        errorMessage = 'Senha é obrigatória';
      } else if (!isValidPassword(value)) {
        errorMessage = 'Senha deve ter pelo menos 6 caracteres';
      }
    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage;
  };

  const validateForm = async (): Promise<boolean> => {
    setTouched({ email: true, password: true });
    const emailError = await validateField('email', email);
    const passwordError = await validateField('password', password);
    return !emailError && !passwordError;
  };

  const handleLogin = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      showToast('Por favor, corrija os erros no formulário.', 'error');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      showToast(`Login realizado com sucesso!`, 'success');
      
      // Redireciona após 1.5 segundos
      setTimeout(() => {
        router.replace('/(tabs)/products');
      }, 1500);
      
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'E-mail ou senha incorretos.';
      
      if (error.message.includes('user-not-found')) {
        errorMessage = 'Usuário não encontrado. Verifique seu e-mail.';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Senha incorreta. Tente novamente.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'E-mail inválido.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Toast Component */}
            <Toast
              visible={toastVisible}
              message={toastMessage}
              type={toastType}
              onHide={() => setToastVisible(false)}
            />

            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>AZ</Text>
              </View>
              <Text style={styles.logoSubtext}>Autos</Text>
            </View>

            <View style={[styles.card, isSmallDevice && styles.cardSmall]}>
              <Text style={styles.title}>Acesse sua conta</Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email ? styles.inputError : null,
                    ]}
                    placeholder="E-mail (exemplo@gmail.com)"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={text => handleFieldChange('email', text)}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading && !checkingEmail}
                  />
                  {checkingEmail && touched.email && email.length > 0 && (
                    <View style={styles.checkingIndicator}>
                      <ActivityIndicator size="small" color="#d32f2f" />
                    </View>
                  )}
                </View>
                {touched.email && errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      touched.password && errors.password ? styles.inputError : null,
                    ]}
                    placeholder="Senha"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={text => handleFieldChange('password', text)}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  {password.length > 0 && (
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={22}
                        color="#999"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {touched.password && errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.button, (loading || checkingEmail) && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading || checkingEmail}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <Link href="/register" asChild>
                <TouchableOpacity style={styles.linkButton} disabled={loading} activeOpacity={0.7}>
                  <Text style={styles.linkText}>Não tem uma conta? <Text style={styles.linkHighlight}>Cadastre-se</Text></Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoSubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardSmall: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 28,
    letterSpacing: 0.5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 18,
  },
  inputWrapper: {
    width: '100%',
    position: 'relative',
  },
  passwordWrapper: {
    width: '100%',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  passwordInput: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1.5,
    backgroundColor: '#fff5f5',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },
  checkingIndicator: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkButton: {
    marginTop: 24,
    paddingVertical: 8,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#d32f2f',
    fontWeight: '600',
  },
});