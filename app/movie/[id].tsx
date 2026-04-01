import { useLocalSearchParams, Link } from 'expo-router';
import { useState, useEffect } from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable,} from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

interface CastMember {
  id: number;
  name: string;
  profile_path: string | null;
  order: number,
}

export default function MovieDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [movieRes, creditsRes] = await Promise.all([
          api.get(`/movie/${id}`),
          api.get(`/movie/${id}/credits`),
        ]);

        setMovie(movieRes.data);
        setCast(creditsRes.data.cast);
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

  if (!movie) {
    return (
      <View style={styles.centro}>
        <Text style={styles.textoErro}>Filme não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}

      <View style={styles.conteudo}>
        <Text style={styles.titulo}>{movie.title}</Text>

        <View style={styles.containerStats}>
          <Text style={styles.textoStat}>
            ⭐ {movie.vote_average.toFixed(1)}/10
          </Text>
          <Text style={styles.textoStat}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.tituloSecao}>Sinopse</Text>
        <Text style={styles.sinopse}>
          {movie.overview || 'Sinopse não disponível para este filme.'}
        </Text>

        <Text style={styles.tituloSecao}>Elenco</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[...cast]
          .sort((a, b) => a.order - b.order)
          .slice(0, 10)
          .map((actor) => (
            <Link key={actor.id} href={`/actor/${actor.id}`} asChild>
              <Pressable style={styles.cardAtor}>
                <Image
                  source={{
                    uri: actor.profile_path
                      ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                      : 'https://via.placeholder.com/200x300',
                  }}
                  style={styles.imagemAtor}
                />
                <Text style={styles.nomeAtor} numberOfLines={1}>
                  {actor.name}
                </Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  poster: { width: '100%', height: 400 },

  conteudo: { padding: 20 },

  titulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  containerStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },

  textoStat: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '600',
  },

  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 20,
  },

  sinopse: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
  },

  textoErro: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  cardAtor: {
    marginRight: 12,
    width: 100,
  },

  imagemAtor: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 6,
  },

  nomeAtor: {
    color: '#FFFFFF',
    fontSize: 12,
    paddingBottom:25,
  },
});