import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, Image, ActivityIndicator } from 'react-native'; // <--- Adicione ActivityIndicator aqui
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Componente para renderizar um item de favorito individual
const FavoriteItem = ({ item, removeFavorite, navigateToDetails }) => {
  return (
    <Card style={styles.card}>
      {/* O item.Poster dos filmes agora será item.displayIcon ou item.fullPortrait para agentes */}
      <Card.Cover source={{ uri: item.fullPortrait || item.displayIcon }} style={styles.agentImageCover} />
      <Card.Content>
        {/* O item.Title dos filmes agora será item.displayName para agentes */}
        <Title>{item.displayName}</Title>
        {/* Adicionado o papel do agente, se existir */}
        {item.role && (
          <View style={styles.roleContainerSmall}>
            <Image source={{ uri: item.role.displayIcon }} style={styles.roleIconSmall} />
            <Paragraph>{item.role.displayName}</Paragraph>
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        {/* O item.imdbID dos filmes agora será item.uuid para agentes */}
        <Button onPress={() => navigateToDetails(item.uuid)}>Ver Detalhes</Button>
        <Button onPress={() => removeFavorite(item.uuid)}>Remover dos Favoritos</Button>
      </Card.Actions>
    </Card>
  );
};

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true); // Adicionado estado de loading
  const [error, setError] = useState(null); // Adicionado estado de erro

  // Função para carregar os favoritos do AsyncStorage
  const loadFavorites = async () => {
    setLoading(true); // Inicia o loading
    setError(null);   // Reseta o erro
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        console.log('Favoritos Carregados:', parsedFavorites);
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]); // Garante que favorites seja um array vazio se nada for encontrado
      }
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
      setError("Não foi possível carregar seus agentes favoritos.");
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

  // Usa useFocusEffect para recarregar favoritos sempre que a tela for focada
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []) // O array de dependências vazio garante que o callback seja memorizado
  );

  // Função para remover um agente dos favoritos
  const removeFavorite = async (uuidToRemove) => {
    try {
      const updatedFavorites = favorites.filter((agent) => agent.uuid !== uuidToRemove);
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      alert('Agente removido dos favoritos!');
    } catch (err) {
      console.error("Erro ao remover favorito:", err);
      alert('Ocorreu um erro ao remover dos favoritos.');
    }
  };

  // Função para navegar para a tela de detalhes de um agente
  const navigateToDetails = (uuid) => {
    navigation.navigate('Details', { uuid });
  };

  // --- Renderização Condicional ---
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando favoritos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadFavorites}>Tentar Novamente</Button>
      </View>
    );
  }

  // --- Renderização da Lista ---
  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.uuid} // Usamos 'uuid' para agentes
        renderItem={({ item }) => (
          <FavoriteItem
            key={item.uuid}
            item={item}
            removeFavorite={removeFavorite}
            navigateToDetails={navigateToDetails}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>Você ainda não adicionou nenhum agente favorito.</Text>
            <Button mode="outlined" onPress={() => navigation.navigate('Home')}>
              Ir para a Busca
            </Button>
          </View>
        }
        // As otimizações de FlatList são mantidas
        initialNumToRender={5}
        getItemLayout={(data, index) => (
          {length: 100, offset: 100 * index, index} // Ajuste 'length' e 'offset' se o card for muito diferente
        )}
        windowSize={10}
        maxToRenderPerBatch={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  agentImageCover: {
    height: 150, // Ajuste de altura para a imagem do agente no card
    resizeMode: 'cover', // Pode ser 'contain' dependendo da preferência
  },
  roleContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  roleIconSmall: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default FavoritesScreen;