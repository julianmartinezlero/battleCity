import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Auto } from '@/models/auto';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect, useState } from 'react';


const autoAncho=100


export default function RootLayout() {
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const [autos, setAutos] = useState([
  { 
    id: 12,
    'modelo' : '12321',
    'color' : '#fa434a',
    'heigth' : 120,
    width: 100,
    'ubicacionX': (screenWidth/4) - (100 /2),
    ubicacionY:  200,
    carril: 'izq'
 },
  { 
    id: 14,
    'modelo' : '12321',
    'color' : '#faa34a',
    'heigth' : 120,
    width: 100,
    'ubicacionX': ((screenWidth/4) * 3) - (100 /2),
    ubicacionY: 0,
    carril: 'der'
  }
])

  const colorScheme = useColorScheme();


  const  [ubicacion, setUbicacion] = useState('der');

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const iniciarMotor = () => {
    // PARA X; condicion; incrementar HACER:

    for (const au of autos) {
      if(au.ubicacionY < screenHeight - 50) {
        au.ubicacionY = au.ubicacionY + 1
      }
    }


    const nuevoAuto: Auto = {
      id: (new Date()).getTime(),
      'modelo' : '12321',
      'color' : '#003bfeff',
      'heigth' : 120,
      width: 100,
      'ubicacionX': (screenWidth/4) - (100 /2),
      ubicacionY:  0,
      carril: 'izq'
    }
    setAutos([...autos, nuevoAuto])

    console.log(autos.length)
  }


  useEffect(() => {
    // iniciarMotor()
    setInterval(() => {
      iniciarMotor()
    }, 50)
  }, [])



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

  const moverDerecha = () => {
    console.log(ubicacion)
    if (ubicacion === 'izq')
      setUbicacion('der')
  }

  const moverIzquierda = () => {
    if (ubicacion === 'der')
      setUbicacion('izq')
    console.log(ubicacion)


  }



  const dibujarAutos = () => {
    return autos.map(r => {
      return (<View key={r.id} style={
        {...styles.autoEnemigo,
        backgroundColor: r.color,
        left: r.ubicacionX, top: r.ubicacionY}}>

      </View>)
    })
  }



  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <View style={styles.contenedor}>
        <View style={styles.canvas}>
          {dibujarAutos()}
          <View style={{...styles.auto, left: ubicacion === 'izq' ? calcularIzquierda() : calcularDerecha()}}></View>
        </View>
        <View style={styles.botones}>
        <Pressable style={styles.btnIzq} onPress={ () => moverIzquierda()}>
        </Pressable>
        <Pressable style={styles.btnDer} onPress={() => moverDerecha()}>

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
    position: 'absolute',
    bottom: 0,
    opacity: 0.3,
    display: 'flex',
    flexDirection: 'row',
  },
  btnIzq: {
    backgroundColor: 'green',
    height: '100%',
    width: '50%',

  },
  btnDer: {
    backgroundColor: 'red',
    height: '100%',
    width: '50%',

  },
  auto: {
    width: autoAncho,
    height: 120,
    backgroundColor: "yellow",
    position: 'absolute',
    bottom: 200
  },
  autoEnemigo: {
    width: autoAncho,
    height: 120,
    position: 'absolute',
    // bottom: 200
  }
})


