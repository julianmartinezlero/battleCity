import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Auto } from '@/models/auto';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';


const AUTO_ANCHO=100
const AUTO_ALTO=200
const CARRILES = 2
const COLORES = [
  'rojo',
  'amarillo',
  'verde',
  'azul',
  'lila',
  'negro'
]



export default function RootLayout() {
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const [autos, setAutos] = useState<Auto[]>([])
  const [velocidad, setVelocidad] = useState(5)

  const animationRef = useRef<number>(0);
  const ultimoFrameTime = useRef<number>(0);

  const autosRef = useRef(autos)
  const ultimoTiempo = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)

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


  // Mantener autosRef actualizado
  useEffect(() => {
    autosRef.current = autos;
  }, [autos]);

  const iniciarMotor = useCallback((tiempo: number) => {
    // Control de FPS
    if (tiempo - ultimoFrameTime.current < 16.67) {
      animationRef.current = requestAnimationFrame(iniciarMotor);
      return;
    }
    ultimoFrameTime.current = tiempo;

    // Lógica principal
    const nuevosAutos = autosRef.current.map(auto => ({
      ...auto,
      ubicacionY: auto.ubicacionY + velocidad
    })).filter(auto => auto.ubicacionY < screenHeight + auto.heigth);

    // Agregar nuevo auto cada 4 segundos
    const ahora = Date.now();
    if (ahora - ultimoTiempo.current > 3000) {
      nuevosAutos.push(crearAuto());
      ultimoTiempo.current = ahora;
    }

    setAutos(nuevosAutos);
    animationRef.current = requestAnimationFrame(iniciarMotor);
  }, [velocidad, screenHeight]);

  // Inicialización
  useEffect(() => {
    animationRef.current = requestAnimationFrame(iniciarMotor);
    return () => cancelAnimationFrame(animationRef.current);
  }, [iniciarMotor]);



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
  }

  // '',
  // '',
  // '',
  // '',
  // '',
  const obtenerImagen = (auto: Auto) => {
    switch(auto.color) {
      case 'negro':
        return require('./../assets/images/autito_negro.png');
      case 'rojo':
        return require('./../assets/images/autito_rojo.png');
      case 'azul':
        return require('./../assets/images/autito_azul.png');
      case 'verde':
        return require('./../assets/images/autito_verde.png');
      case 'lila':
        return require('./../assets/images/autito_lila.png');
      default:
        return require('./../assets/images/autito.png');
    }
  };


  const dibujarAutos = () => {
    return autos.map(r => {
      return (<Image key={r.id} style={
        {...styles.autoEnemigo,
        left: r.ubicacionX, top: r.ubicacionY}}
        source={obtenerImagen(r)}
        />

      )
    })
  }



  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
            <ImageBackground
      
        source={require('./../assets/images/carretera.jpg')}
        resizeMode="repeat" // ✅ Patrón repetitivo
        style={styles.contenedor}
      >
        {/* Si necesitas contenido dentro del auto */}
   
      {/* <View style={styles.contenedor}> */}
        <View style={styles.canvas}>
          {dibujarAutos()}
          <View style={{...styles.auto, left: ubicacion === 'izq' ? calcularIzquierda() : calcularDerecha()}}>
          
              <Image
          style={styles.autoImagen}
          source={require('./../assets/images/autito.png')}
        />
          </View>
        </View>
        <View style={styles.botones}>
        <Pressable style={styles.btnIzq} onPress={ () => moverIzquierda()}>
        </Pressable>
        <Pressable style={styles.btnDer} onPress={() => moverDerecha()}>

        </Pressable>
        </View>
           </ImageBackground>
      {/* </View> */}
    </ThemeProvider>
  );

}

const styles = StyleSheet.create({
  contenedor: {
    width: '100%',
    height: '100%',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  botones: {
    height:'50%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    opacity: 0,
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


