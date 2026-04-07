import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../services/connectionFirebase';
import { ref, set, get, query, orderByChild, equalTo } from 'firebase/database';
import { Feather } from '@expo/vector-icons';
import { Toast } from '../components/toast';

// ✅ Validação de e-mail genérica (qualquer domínio)
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  return emailRegex.test(email);
};

const maskPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

const isValidPhone = (phone: string) => {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length >= 10 && numbers.length <= 11;
};

const getPasswordRequirements = (password: string) => {
  return {
    minLength: password.length >= 8,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[@$!%*?&]/.test(password),
  };
};

const isValidPassword = (password: string) => {
  const reqs = getPasswordRequirements(password);
  return reqs.minLength && reqs.hasLowercase && reqs.hasUppercase && reqs.hasNumber && reqs.hasSymbol;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingFields, setCheckingFields] = useState({
    email: false,
    phone: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  // Estado para o Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const passwordReqs = getPasswordRequirements(password);

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

  const checkPhoneExists = async (phoneToCheck: string): Promise<boolean> => {
    if (!phoneToCheck || !isValidPhone(phoneToCheck)) return false;
    
    try {
      const usersRef = ref(database, 'users');
      const phoneQuery = query(usersRef, orderByChild('phone'), equalTo(phoneToCheck));
      const snapshot = await get(phoneQuery);
      return snapshot.exists();
    } catch (error) {
      console.error('Erro ao verificar telefone:', error);
      return false;
    }
  };

  const validateField = useCallback(async (field: string, value: string): Promise<string> => {
    let errorMessage = '';

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          errorMessage = 'Nome é obrigatório';
        } else if (value.trim().length < 2) {
          errorMessage = 'Nome deve ter pelo menos 2 caracteres';
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          errorMessage = 'Sobrenome é obrigatório';
        } else if (value.trim().length < 2) {
          errorMessage = 'Sobrenome deve ter pelo menos 2 caracteres';
        }
        break;

      case 'email':
        if (!value.trim()) {
          errorMessage = 'E-mail é obrigatório';
        } else if (!isValidEmail(value)) {
          errorMessage = 'E-mail inválido (exemplo@dominio.com)';
        } else {
          setCheckingFields(prev => ({ ...prev, email: true }));
          const emailExists = await checkEmailExists(value);
          setCheckingFields(prev => ({ ...prev, email: false }));
          if (emailExists) {
            errorMessage = 'E-mail já cadastrado no sistema';
          }
        }
        break;

      case 'phone':
        if (!value.trim()) {
          errorMessage = 'Telefone é obrigatório';
        } else if (!isValidPhone(value)) {
          errorMessage = 'Telefone deve ter 10 ou 11 dígitos';
        } else {
          setCheckingFields(prev => ({ ...prev, phone: true }));
          const phoneExists = await checkPhoneExists(value);
          setCheckingFields(prev => ({ ...prev, phone: false }));
          if (phoneExists) {
            errorMessage = 'Telefone já cadastrado no sistema';
          }
        }
        break;

      case 'password':
        if (!value) {
          errorMessage = 'Senha é obrigatória';
        } else if (!isValidPassword(value)) {
          errorMessage = 'A senha não atende a todos os requisitos';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          errorMessage = 'Confirme sua senha';
        } else if (value !== password) {
          errorMessage = 'As senhas não coincidem';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage;
  }, [password]);

  useEffect(() => {
    if (touched.confirmPassword) {
      validateField('confirmPassword', confirmPassword);
    }
  }, [password, confirmPassword, touched.confirmPassword, validateField]);

  const handlePhoneChange = (text: string) => {
    const masked = maskPhone(text);
    setPhone(masked);

    if (touched.phone) {
      validateField('phone', masked);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        if (errors.email && errors.email.includes('cadastrado')) {
          setErrors(prev => ({ ...prev, email: '' }));
        }
        break;
      case 'password':
        setPassword(value);
        if (value === '') {
          setShowPassword(false);
        }
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        if (value === '') {
          setShowConfirmPassword(false);
        }
        break;
    }

    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'password') {
      setIsPasswordFocused(false);
    }

    let value = '';
    switch (field) {
      case 'firstName':
        value = firstName;
        break;
      case 'lastName':
        value = lastName;
        break;
      case 'email':
        value = email;
        break;
      case 'phone':
        value = phone;
        break;
      case 'password':
        value = password;
        break;
      case 'confirmPassword':
        value = confirmPassword;
        break;
    }

    validateField(field, value);
  };

  const handleFocus = (field: string) => {
    if (field === 'password') {
      setIsPasswordFocused(true);
      if (!touched.password) {
        setTouched(prev => ({ ...prev, password: true }));
      }
    }
  };

  const validateForm = async (): Promise<boolean> => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const firstNameError = await validateField('firstName', firstName);
    const lastNameError = await validateField('lastName', lastName);
    const emailError = await validateField('email', email);
    const phoneError = await validateField('phone', phone);
    const passwordError = await validateField('password', password);
    const confirmError = await validateField('confirmPassword', confirmPassword);

    return !firstNameError && !lastNameError && !emailError && !phoneError && !passwordError && !confirmError;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleRegister = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      showToast('Por favor, corrija os erros no formulário.', 'error');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signUp(email, password);
      const user = userCredential.user;

      await set(ref(database, 'users/' + user.uid), {
        firstName,
        lastName,
        email,
        phone,
        role: 'user',
        createdAt: new Date().toISOString(),
      });

      showToast(`🎉 Conta criada com sucesso! Bem-vindo(a) ${firstName}!`, 'success');
      
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        showToast('E-mail já cadastrado no sistema.', 'error');
        setErrors(prev => ({ ...prev, email: 'E-mail já cadastrado no sistema' }));
        setTouched(prev => ({ ...prev, email: true }));
      } else if (error.code === 'auth/weak-password') {
        showToast('Senha muito fraca. Use letras, números e símbolos.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showToast('E-mail inválido.', 'error');
      } else {
        showToast(error.message || 'Ocorreu um erro ao criar sua conta.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMismatch = () => {
    return touched.confirmPassword && confirmPassword.length > 0 && password !== confirmPassword;
  };

  const shouldShowRequirements = () => {
    return (isPasswordFocused || (touched.password && !isValidPassword(password))) && password.length > 0;
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
            <Toast
              visible={toastVisible}
              message={toastMessage}
              type={toastType}
              onHide={() => setToastVisible(false)}
            />

            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>AZ</Text>
              </View>
              <Text style={styles.logoSubtext}>Autos</Text>
            </View>

            <View style={[styles.card, isSmallDevice && styles.cardSmall]}>
              <Text style={styles.title}>Crie sua conta</Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.firstName && errors.firstName ? styles.inputError : null,
                    ]}
                    placeholder="Nome"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={text => handleFieldChange('firstName', text)}
                    onBlur={() => handleBlur('firstName')}
                    editable={!loading}
                  />
                </View>
                {touched.firstName && errors.firstName ? (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.lastName && errors.lastName ? styles.inputError : null,
                    ]}
                    placeholder="Sobrenome"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={text => handleFieldChange('lastName', text)}
                    onBlur={() => handleBlur('lastName')}
                    editable={!loading}
                  />
                </View>
                {touched.lastName && errors.lastName ? (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email ? styles.inputError : null,
                    ]}
                    placeholder="E-mail"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={text => handleFieldChange('email', text)}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {checkingFields.email && touched.email && !errors.email && email.length > 0 && (
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
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.phone && errors.phone ? styles.inputError : null,
                    ]}
                    placeholder="Celular"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    onBlur={() => handleBlur('phone')}
                    keyboardType="phone-pad"
                    maxLength={15}
                    editable={!loading}
                  />
                  {checkingFields.phone && touched.phone && !errors.phone && phone.length > 0 && (
                    <View style={styles.checkingIndicator}>
                      <ActivityIndicator size="small" color="#d32f2f" />
                    </View>
                  )}
                </View>
                {touched.phone && errors.phone ? (
                  <Text style={styles.errorText}>{errors.phone}</Text>
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
                    placeholder="Crie uma senha"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={text => handleFieldChange('password', text)}
                    onFocus={() => handleFocus('password')}
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

                {shouldShowRequirements() && (
                  <View style={styles.requirementsContainer}>
                    <Text style={styles.requirementsTitle}>A senha deve conter:</Text>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={passwordReqs.minLength ? 'check-circle' : 'circle'}
                        size={16}
                        color={passwordReqs.minLength ? '#4caf50' : '#999'}
                      />
                      <Text style={[styles.requirementText, passwordReqs.minLength && styles.requirementMet]}>
                        Mínimo de 8 caracteres
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={passwordReqs.hasLowercase ? 'check-circle' : 'circle'}
                        size={16}
                        color={passwordReqs.hasLowercase ? '#4caf50' : '#999'}
                      />
                      <Text style={[styles.requirementText, passwordReqs.hasLowercase && styles.requirementMet]}>
                        Letra minúscula (a-z)
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={passwordReqs.hasUppercase ? 'check-circle' : 'circle'}
                        size={16}
                        color={passwordReqs.hasUppercase ? '#4caf50' : '#999'}
                      />
                      <Text style={[styles.requirementText, passwordReqs.hasUppercase && styles.requirementMet]}>
                        Letra maiúscula (A-Z)
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={passwordReqs.hasNumber ? 'check-circle' : 'circle'}
                        size={16}
                        color={passwordReqs.hasNumber ? '#4caf50' : '#999'}
                      />
                      <Text style={[styles.requirementText, passwordReqs.hasNumber && styles.requirementMet]}>
                        Número (0-9)
                      </Text>
                    </View>
                    <View style={styles.requirementItem}>
                      <Feather
                        name={passwordReqs.hasSymbol ? 'check-circle' : 'circle'}
                        size={16}
                        color={passwordReqs.hasSymbol ? '#4caf50' : '#999'}
                      />
                      <Text style={[styles.requirementText, passwordReqs.hasSymbol && styles.requirementMet]}>
                        Símbolo (@$!%*?&)
                      </Text>
                    </View>
                  </View>
                )}

                {touched.password && errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      touched.confirmPassword && errors.confirmPassword ? styles.inputError : null,
                      isPasswordMismatch() && styles.inputError,
                    ]}
                    placeholder="Confirmar senha"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={text => handleFieldChange('confirmPassword', text)}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                  {confirmPassword.length > 0 && (
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={loading}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={22}
                        color="#999"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {touched.confirmPassword && errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>CADASTRAR</Text>
                )}
              </TouchableOpacity>

              <Link href="/login" asChild>
                <TouchableOpacity style={styles.linkButton} disabled={loading} activeOpacity={0.7}>
                  <Text style={styles.linkText}>Já tem uma conta? <Text style={styles.linkHighlight}>Faça login</Text></Text>
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
  requirementsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  requirementMet: {
    color: '#4caf50',
    textDecorationLine: 'line-through',
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