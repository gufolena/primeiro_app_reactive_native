import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native'; // Adicionado ActivityIndicator e Text
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {
  // Não precisamos de 'query' para a busca inicial de todos os agentes
  // const [query, setQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true); // Novo estado para controle de carregamento
  const [error, setError] = useState(null);     // Novo estado para controle de erros

  // Função para carregar os agentes
  const loadAgents = async () => {
    setLoading(true); // Inicia o loading
    setError(null);   // Reseta o erro
    try {
      // A API de agentes retorna todos os agentes, não aceita um parâmetro 's='
      const response = await axios.get('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
      // A API retorna um objeto com uma propriedade 'data' que é um array de agentes
      // Filtrar apenas personagens jogáveis se desejar
      setAgents(response.data.data.filter(agent => agent.isPlayableCharacter));
    } catch (err) {
      console.error("Erro ao carregar agentes:", err);
      setError("Não foi possível carregar os agentes. Tente novamente mais tarde.");
    } finally {
      setLoading(false); // Finaliza o loading
    }
  };

  // Carrega os agentes assim que o componente é montado
  useEffect(() => {
    loadAgents();
  }, []); // O array vazio [] garante que rode apenas uma vez na montagem

  // Se você quiser uma funcionalidade de busca/filtro por nome na Home, você faria assim:
  const [searchText, setSearchText] = useState('');
  const filteredAgents = agents.filter(agent =>
    agent.displayName.toLowerCase().includes(searchText.toLowerCase())
  );


  // Renderização condicional para loading e erro
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando agentes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadAgents}>Tentar Novamente</Button>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Filtrar por nome do agente..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.input}
      />
      {/* O botão "Buscar" não é mais necessário para a carga inicial, mas pode ser para uma "busca" manual se não usar onChangeText no filtro */}
      {/* <Button mode="contained" onPress={loadAgents} style={styles.button}>
        Recarregar Agentes
      </Button> */}

      <FlatList
        data={filteredAgents} // Agora usa os agentes filtrados
        keyExtractor={(item) => item.uuid} // O ID único dos agentes é 'uuid'
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {/* A API do Valorant tem displayIcon, fullPortrait, etc. Escolha o que preferir */}
            <Card.Cover source={{ uri: item.fullPortrait || item.displayIcon }} />
            <Card.Content>
              <Title>{item.displayName}</Title>
              {/* Você pode exibir o papel (role) do agente, se quiser */}
              {item.role && <Paragraph>{item.role.displayName}</Paragraph>}
            </Card.Content>
            <Card.Actions>
              {/* Passamos o uuid do agente para a tela de detalhes */}
              <Button onPress={() => navigation.navigate('Details', { uuid: item.uuid })}>
                Ver Detalhes
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.noResultsText}>Nenhum agente encontrado.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0', // Um fundo claro para melhor contraste
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
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
  input: {
    height: 50, // Um pouco maior
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8, // Bordas arredondadas
    marginBottom: 15, // Mais espaço
    paddingHorizontal: 15, // Padding horizontal
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 15, // Mais espaço entre os cards
    borderRadius: 8,
    overflow: 'hidden', // Para garantir que a imagem se ajuste ao borderRadius
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default HomeScreen;