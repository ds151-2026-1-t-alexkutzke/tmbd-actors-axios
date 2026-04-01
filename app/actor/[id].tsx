import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable,} from 'react-native';
import { api } from '../../src/api/tmdb';

interface Ator {
  name: string;
  biography: string;
  profile_path: string | null;
}

interface Filme {
  id: number;
  poster_path: string | null;
  title: string;
  popularity: number,
}

export default function ActorScreen() {
  const { id } = useLocalSearchParams();

  const [ator, setAtor] = useState<Ator | null>(null);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [atorRes, filmesRes] = await Promise.all([
          api.get(`/person/${id}`),
          api.get(`/person/${id}/movie_credits`),
        ]);

        setAtor(atorRes.data);
        setFilmes(filmesRes.data.cast);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!ator) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoErro}>Ator não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cabecalho}>
        <Image
          source={{
            uri: ator.profile_path
              ? `https://image.tmdb.org/t/p/w300${ator.profile_path}`
              : 'https://via.placeholder.com/300x450',
          }}
          style={styles.imagemAtor}
        />

        <Text style={styles.nomeAtor}>{ator.name}</Text>
      </View>

      <View style={styles.conteudo}>
        <Text style={styles.tituloSecao}>Biografia</Text>
        <Text style={styles.biografia}>
          {ator.biography || 'Biografia não disponível.'}
        </Text>

        <Text style={styles.tituloSecao}>Filmografia</Text>

        {filmes.length === 0 ? (
          <Text style={styles.textoErro}>Nenhum filme encontrado.</Text>
        ) : (
          <FlatList
            data={[...filmes]
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 10)}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Link href={`/movie/${item.id}`} asChild>
                <Pressable style={styles.cardFilme}>
                  <Image
                    source={{
                      uri: item.poster_path
                        ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                        : 'https://via.placeholder.com/200x300',
                    }}
                    style={styles.imagemFilme}
                  />
                  <Text style={styles.tituloFilme} numberOfLines={1}>
                    {item.title}
                  </Text>
                </Pressable>
              </Link>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  cabecalho: {
    alignItems: 'center',
    padding: 20,
  },

  imagemAtor: {
    width: 200,
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },

  nomeAtor: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  conteudo: {
    padding: 20,
  },

  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },

  biografia: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
  },

  textoErro: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  cardFilme: {
    marginRight: 12,
    width: 120,
  },

  imagemFilme: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 6,
  },

  tituloFilme: {
    color: '#FFFFFF',
    fontSize: 12,
    paddingBottom:25,
  },
});