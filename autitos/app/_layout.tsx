import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';


const autoAncho=100


export default function RootLayout() {
  const colorScheme = useColorScheme();

  const screenWidth = Dimensions.get('screen').width;

  const  [ubicacion, setUbicacion] = useState('der');

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });



  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const calcularIzquierda = () => {
    return (screenWidth/4) - (autoAncho /2)
  }
  const calcularDerecha = () => {
    return ((screenWidth/4) * 3) - (autoAncho /2)
  }

  const moverDerecha = ()=> {
    if (ubicacion === 'izq')
      setUbicacion('der')
    console.log(ubicacion)
  }

  const moverIzquierda = () => {
    setUbicacion('izq')
    console.log(ubicacion)

  }



  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <View style={styles.contenedor}>
        <View style={styles.canvas}>
          <View style={{...styles.auto, left: ubicacion === 'izq' ? calcularIzquierda() : calcularDerecha()}}></View>
        </View>
        <View style={styles.botones}>
        <Pressable style={styles.btnIzq} onPress={ () => moverIzquierda()}>
        </Pressable>
        <Pressable style={styles.btnDer} onPress={()=> moverDerecha()}>

        </Pressable>
        </View>
      </View>
    </ThemeProvider>
  );

}

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    height: '100%',
    backgroundColor: 'red'
  },
  canvas: {
    backgroundColor: 'grey',
    width: '100%',
    height: '100%',
  },
  botones: {
    height:'25%',
    width: '100%',
    backgroundColor:'blue',
    position: 'absolute',
    bottom: 0,
    opacity: 0.3
  },
  btnIzq: {
    backgroundColor: 'green',
    height: '100%',
    width: '50%',
        // opacity: 0
  },
  btnDer: {
    backgroundColor: 'blue',
    height: '100%',
    width: '50%',
        // opacity: 0.2
  },
  auto: {
    width: autoAncho,
    height: 120,
    backgroundColor: "yellow",
    position: 'absolute',
    bottom: 100
  }
})


