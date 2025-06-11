import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para favoritos

const DetailsScreen = ({ route, navigation }) => {
  const { uuid } = route.params; // Captura o UUID passado da tela anterior
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false); // Novo estado para controlar se é favorito

  // Função para carregar os detalhes do agente
  const fetchAgentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // A API de detalhes de agente usa o UUID na URL
      const response = await axios.get(`https://valorant-api.com/v1/agents/${uuid}`);
      // A resposta tem a estrutura { status: 200, data: {...detalhes do agente...} }
      setAgent(response.data.data);
      checkFavoriteStatus(response.data.data); // Verifica se é favorito após carregar
    } catch (err) {
      console.error("Erro ao carregar detalhes do agente:", err);
      setError("Não foi possível carregar os detalhes do agente. Tente novamente.");
      setAgent(null); // Garante que o estado do agente seja nulo em caso de erro
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar se o agente já está nos favoritos
  const checkFavoriteStatus = async (currentAgent) => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites);
        // Verifica se o agente atual está na lista de favoritos pelo UUID
        setIsFavorite(favoritesArray.some(favAgent => favAgent.uuid === currentAgent.uuid));
      }
    } catch (err) {
      console.error("Erro ao verificar status de favorito:", err);
    }
  };

  // Função para adicionar/remover dos favoritos
  const toggleFavorite = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {
        // Remover dos favoritos
        favoritesArray = favoritesArray.filter(favAgent => favAgent.uuid !== agent.uuid);
        setIsFavorite(false);
        alert('Agente removido dos favoritos!');
      } else {
        // Adicionar aos favoritos
        // Certifique-se de salvar apenas as informações essenciais
        const { uuid, displayName, displayIcon, fullPortrait, role } = agent;
        favoritesArray.push({ uuid, displayName, displayIcon, fullPortrait, role });
        setIsFavorite(true);
        alert('Agente adicionado aos favoritos!');
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
      alert('Ocorreu um erro ao salvar/remover dos favoritos.');
    }
  };


  // Efeito para carregar os detalhes do agente quando o componente é montado ou o UUID muda
  useEffect(() => {
    if (uuid) { // Garante que temos um UUID antes de tentar buscar
      fetchAgentDetails();
    }
  }, [uuid]); // Dependência no uuid garante que se a rota mudar, ele recarrega

  // --- Renderização Condicional ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando detalhes do agente...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchAgentDetails}>Tentar Novamente</Button>
      </View>
    );
  }

  // Se não houver agente e não estiver carregando, significa que algo deu errado
  if (!agent) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Nenhum detalhe do agente encontrado.</Text>
      </View>
    );
  }

  // --- Renderização do Agente ---
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* Imagem do Agente - fullPortraitV2 ou fullPortrait são boas opções */}
        <Card.Cover source={{ uri: agent.fullPortraitV2 || agent.fullPortrait || agent.displayIcon }} style={styles.agentImage} />
        
        <Card.Content style={styles.content}>
          <Title style={styles.agentName}>{agent.displayName}</Title>
          {agent.role && (
            <View style={styles.roleContainer}>
              <Image source={{ uri: agent.role.displayIcon }} style={styles.roleIcon} />
              <Paragraph style={styles.roleName}>{agent.role.displayName}</Paragraph>
            </View>
          )}
          <Paragraph style={styles.description}>{agent.description}</Paragraph>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={toggleFavorite}
              icon={isFavorite ? "heart" : "heart-outline"}
              style={styles.favoriteButton}
              labelStyle={styles.favoriteButtonText}
            >
              {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            </Button>
          </View>
          
          {/* Habilidades do Agente */}
          <Text style={styles.sectionTitle}>Habilidades:</Text>
          {agent.abilities.map((ability, index) => (
            <Card key={index} style={styles.abilityCard}>
              <Card.Title
                title={ability.displayName}
                subtitle={ability.slot}
                left={(props) => ability.displayIcon && <Image {...props} source={{ uri: ability.displayIcon }} style={styles.abilityIcon} />}
              />
              <Card.Content>
                <Paragraph>{ability.description}</Paragraph>
              </Card.Content>
            </Card>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  agentImage: {
    height: 300, // Altura ajustada para a imagem do agente
    resizeMode: 'contain', // Garante que a imagem se ajuste sem cortar
    backgroundColor: '#000', // Fundo escuro para contrastar com agentes claros
  },
  content: {
    padding: 15,
  },
  agentName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  roleName: {
    fontSize: 18,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 20,
    color: '#444',
  },
  buttonContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  favoriteButton: {
    marginTop: 10,
    backgroundColor: '#FF4500', // Cor de destaque para o botão de favorito
  },
  favoriteButtonText: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  abilityCard: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  abilityIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
});

export default DetailsScreen;