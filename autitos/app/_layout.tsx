import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Image, Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AUTO_URI } from '@/constants/imagenes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Auto } from '@/models/auto';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';


const AUTO_ANCHO=100
const AUTO_ALTO=200
const CARRILES = 2
const COLORES = [
  '#fc0a0aff',
  '#f6ff00ff',
  '#1303ffff',
  '#ff01c4ff',
  '#00fffbff', 
  '#ffb700ff',
  '#313131',
  '#00e004ff'
]



export default function RootLayout() {
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const [autos, setAutos] = useState<Auto[]>([])
  const [velocidad, setVelocidad] = useState(4)

  const autosRef = useRef(autos)
  const ultimoTiempo = useRef<number>(0)

  const colorScheme = useColorScheme();


  const  [ubicacion, setUbicacion] = useState('der');

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const calcularIzquierda = () => {
    return (screenWidth/4) - (AUTO_ANCHO /2)
  }
  const calcularDerecha = () => {
    return ((screenWidth/4) * 3) - (AUTO_ANCHO /2)
  }


  const crearAuto = () => {
    
    const ubi = Math.floor(Math.random() * CARRILES)

    const ubi1 = ubi > 0 ? 'der': 'izq'
    
    // Math.floor(Math.random() * COLORES.length)
    //  Math.floor(0.99 * 8)
      const nuevoAuto: Auto = {
      id: Math.floor(new Date().getTime() * Math.random()),
      'modelo' : '12321',
      'color' : COLORES[Math.floor(Math.random() * COLORES.length)],
      'heigth' : AUTO_ALTO,
      width: AUTO_ANCHO,
      'ubicacionX': ubi1==='izq' ? calcularIzquierda() : calcularDerecha(),
      ubicacionY:  0 - AUTO_ALTO,
      carril: ubi1
    }



    return nuevoAuto
  }


  autosRef.current = autos
  const iniciarMotor = (tiempo: any) => {
    
    const autoActuales = autosRef.current;

    const ubicacionActualAutos = autoActuales.map( auto => {
      return {...auto, ubicacionY: auto.ubicacionY + velocidad }
    })

    const filtrarValidos = ubicacionActualAutos.filter(auto => {
      return auto.ubicacionY < screenHeight + auto.heigth
    })

    let autosFinales= [...filtrarValidos]

    const ahora = Date.now()

    if (ahora - ultimoTiempo.current > 5000) {
      const nuevoAuto = crearAuto()
      autosFinales.push(nuevoAuto)
      ultimoTiempo.current = ahora
    }

    setAutos(autosFinales)

    requestAnimationFrame(iniciarMotor)
  }


  useEffect(() => {
    // iniciarMotor()
    requestAnimationFrame(iniciarMotor)
  }, [])



  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
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
          <View style={{...styles.auto, left: ubicacion === 'izq' ? calcularIzquierda() : calcularDerecha()}}>
          
              <Image
          style={styles.autoImagen}
          source={{
            uri: AUTO_URI,
          }}
        />
          </View>
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
  autoImagen: {
    width: 'auto',
    height: '100%'
  },

  auto: {
    width: AUTO_ANCHO,
    height: AUTO_ALTO,
    backgroundColor: "transparent",
    position: 'absolute',
    bottom: 200,
    backgroundImage: '/assets/images/autito.png'
  },
  autoEnemigo: {
    width: AUTO_ANCHO,
    height: AUTO_ALTO,
    position: 'absolute',
    // bottom: 200
  }
})


