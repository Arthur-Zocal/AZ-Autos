import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function AboutScreen() {
  const contactData = {
    phone: '(17) 997144009',
    email: 'arthurzocal7275@gmail.com',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    instagram: 'https://instagram.com/arthur.zocal_',
    facebook: 'https://facebook.com/arthur.zocalribeirodasilva.9',
    linkedin: 'https://www.linkedin.com/in/arthur-zocal-ribeiro-da-silva-b86b09275/'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>AZ</Text>
          </View>
        </View>

        {/* História */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="clock" size={24} color="#d32f2f" />
            <Text style={styles.cardTitle}>Nossa História</Text>
          </View>
          <Text style={styles.cardText}>
            Fundada em 2026, a AZ Autos nasceu da paixão por carros e do desejo de transformar a experiência de compra e venda de veículos no Brasil. Começamos como um pequeno sonho, movidos pela crença de que adquirir um carro vai muito além de uma transação comercial, é sobre realização, liberdade e confiança. Com dedicação, transparência e um atendimento que coloca o cliente em primeiro lugar, crescemos rapidamente e hoje somos referência em qualidade e credibilidade no setor automotivo. Cada veículo que passa por nossas mãos é tratado com o mesmo cuidado que teríamos para um membro da família.
          </Text>
        </View>

        {/* Missão */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="target" size={24} color="#d32f2f" />
            <Text style={styles.cardTitle}>Nossa Missão</Text>
          </View>
          <Text style={styles.cardText}>
            Conectar pessoas aos carros dos seus sonhos com segurança, transparência e as melhores condições do mercado. Queremos que cada cliente se sinta especial e confiante na sua escolha, desde o primeiro contato até a entrega das chaves. Por isso, trabalhamos incansavelmente para oferecer uma experiência completa, com curadoria criteriosa de veículos, suporte personalizado e soluções financeiras que cabem no seu bolso. Na AZ Autos, sua satisfação é o que nos move e a confiança que depositamos em nosso trabalho é o que nos torna diferentes.
          </Text>
        </View>

        {/* Visão */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="eye" size={24} color="#d32f2f" />
            <Text style={styles.cardTitle}>Nossa Visão</Text>
          </View>
          <Text style={styles.cardText}>
            Ser a maior e mais confiável plataforma de compra e venda de veículos do Brasil, reconhecida pela inovação, qualidade no atendimento e compromisso inabalável com nossos clientes. Almejamos não apenas liderar o mercado, mas transformar a forma como as pessoas se relacionam com a compra e venda de automóveis, utilizando tecnologia de ponta, processos ágeis e um time apaixonado pelo que faz. Queremos que, ao pensar em carros, você pense na AZ Autos, sinônimo de segurança, transparência e uma experiência que vai muito além da expectativa.
          </Text>
        </View>

        {/* Valores */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="heart" size={24} color="#d32f2f" />
            <Text style={styles.cardTitle}>Nossos Valores</Text>
          </View>
          <View style={styles.valuesList}>
            <View style={styles.valueItem}>
              <Feather name="check" size={18} color="#d32f2f" />
              <Text style={styles.valueText}>Transparência em todas as negociações</Text>
            </View>
            <View style={styles.valueItem}>
              <Feather name="check" size={18} color="#d32f2f" />
              <Text style={styles.valueText}>Compromisso com a qualidade</Text>
            </View>
            <View style={styles.valueItem}>
              <Feather name="check" size={18} color="#d32f2f" />
              <Text style={styles.valueText}>Inovação constante</Text>
            </View>
            <View style={styles.valueItem}>
              <Feather name="check" size={18} color="#d32f2f" />
              <Text style={styles.valueText}>Respeito aos clientes</Text>
            </View>
          </View>
        </View>

        {/* Contato */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="phone" size={24} color="#d32f2f" />
            <Text style={styles.cardTitle}>Fale Conosco</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL(`tel:${contactData.phone}`)}
          >
            <Feather name="phone" size={20} color="#d32f2f" />
            <Text style={styles.contactText}>{contactData.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL(`mailto:${contactData.email}`)}
          >
            <Feather name="mail" size={20} color="#d32f2f" />
            <Text style={styles.contactText}>{contactData.email}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(contactData.address)}`)}
          >
            <Feather name="map-pin" size={20} color="#d32f2f" />
            <Text style={styles.contactText}>{contactData.address}</Text>
          </TouchableOpacity>
        </View>

        {/* Redes Sociais */}
        <View style={styles.socialCard}>
          <Text style={styles.socialTitle}>Siga a gente nas redes sociais</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL(contactData.instagram)}
            >
              <Feather name="instagram" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL(contactData.facebook)}
            >
              <Feather name="facebook" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL(contactData.linkedin)}
            >
              <Feather name="linkedin" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Creditos */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AZ Autos. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'left',
  },
  valuesList: {
    marginTop: 5,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactText: {
    fontSize: 14,
    color: '#333',
  },
  socialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  socialButton: {
    backgroundColor: '#d32f2f',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  footer: {
    padding: 15,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
});