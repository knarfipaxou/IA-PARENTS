import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BUILD_ID } from '../constants/buildInfo';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/** Affiche l'erreur à l'écran au lieu d'un écran noir/blanc silencieux. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={s.root}>
          <Text style={s.title}>Erreur au démarrage</Text>
          <Text style={s.build}>{BUILD_ID}</Text>
          <ScrollView style={s.box}>
            <Text style={s.msg}>{this.state.error.message}</Text>
            <Text style={s.stack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a0000', padding: 20, paddingTop: 64 },
  title: { color: '#FF6B5A', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  build: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '700', marginBottom: 12 },
  box: { flex: 1, backgroundColor: '#000', borderRadius: 12, padding: 14 },
  msg: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  stack: { color: '#FF9683', fontSize: 11, lineHeight: 16 },
});
