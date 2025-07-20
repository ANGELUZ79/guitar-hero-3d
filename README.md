# Guitar Hero 3D - Pentagrama Musical

Una aplicación web interactiva similar a Guitar Hero con vista 3D que incluye un pentagrama musical completo, cilindros 3D en movimiento y sistema de sonido MIDI.

![Guitar Hero 3D](https://img.shields.io/badge/Status-Ready-green) ![Three.js](https://img.shields.io/badge/Three.js-r128-blue) ![Web%20Audio%20API](https://img.shields.io/badge/Web%20Audio%20API-Enabled-orange)

## 🎵 Características Principales

### Vista 3D con Three.js
- **Pentagrama musical en 3D** con perspectiva realista
- **Cilindros 3D** que se mueven desde el fondo hacia la pantalla
- **Nombres de notas visibles** en los cilindros
- **Efectos de luz y sombras** para mayor inmersión

### Sistema de Líneas del Pentagrama

#### Líneas Principales (Visibles)
- **1era línea** (izquierda) = E4 (MI)
- **2da línea** = G4 (SOL)
- **3ra línea** = B4 (SI)
- **4ta línea** = D5 (RE)
- **5ta línea** (derecha) = F5 (FA)

#### Espacios Entre Líneas
- **1er espacio** = F4 (FA)
- **2do espacio** = A4 (LA)
- **3er espacio** = C5 (DO)
- **4to espacio** = E5 (MI)

#### Líneas Invisibles
Se iluminan con efectos especiales cuando pasa un cilindro:
- **C4** (DO4) - Línea adicional inferior
- **D4** (RE4) - Espacio adicional inferior
- **A5** (LA5) - Espacio adicional superior
- **C6** (DO6) - Línea adicional superior

### Sistema de Notas y Colores
Cada nota tiene un color distintivo:
- **MI (E)** = Rojo (#ff6b6b)
- **FA (F)** = Turquesa (#4ecdc4)
- **SOL (G)** = Amarillo (#ffe66d)
- **LA (A)** = Naranja (#ff9f43)
- **SI (B)** = Púrpura (#6c5ce7)
- **DO (C)** = Rosa (#fd79a8)
- **RE (D)** = Verde (#00b894)

### Duraciones y Velocidad
- **Duraciones soportadas**: 4s, 3s, 2s, 1s, 0.5s, 0.25s
- **Velocidad dinámica**: Los cilindros se mueven más rápido para notas de menor duración
- **Tamaño variable**: Los cilindros son más grandes para notas de mayor duración

## 🎮 Controles

### Teclado
- **Teclas 1-9**: Tocar las notas correspondientes
  - `1` = E4 (MI) | `2` = F4 (FA) | `3` = G4 (SOL)
  - `4` = A4 (LA) | `5` = B4 (SI) | `6` = C5 (DO)
  - `7` = D5 (RE) | `8` = E5 (MI) | `9` = F5 (FA)
- **Barra espaciadora**: Play/Pause
- **Escape**: Detener el juego

### Interfaz
- **▶ Play**: Iniciar la canción
- **⏸ Pause**: Pausar/Reanudar
- **⏹ Stop**: Detener completamente
- **🔄 Restart**: Reiniciar desde el principio

## 🎼 Canción Incluida

La aplicación incluye una melodía de 30 notas:

```json
{
  "song": [
    {"name": "SOL", "duration": 0.5}, {"name": "SOL", "duration": 0.5},
    {"name": "MI", "duration": 0.5}, {"name": "MI", "duration": 0.5},
    {"name": "SOL", "duration": 0.5}, {"name": "SOL", "duration": 0.5},
    {"name": "MI", "duration": 0.5}, {"name": "MI", "duration": 0.5},
    {"name": "SOL", "duration": 0.5}, {"name": "SOL", "duration": 0.5},
    {"name": "LA", "duration": 0.5}, {"name": "SOL", "duration": 0.5},
    {"name": "FA", "duration": 0.5}, {"name": "MI", "duration": 0.5},
    {"name": "RE", "duration": 1}, {"name": "FA", "duration": 0.5},
    {"name": "FA", "duration": 0.5}, {"name": "RE", "duration": 0.5},
    {"name": "RE", "duration": 0.5}, {"name": "FA", "duration": 0.5},
    {"name": "FA", "duration": 0.5}, {"name": "RE", "duration": 0.5},
    {"name": "RE", "duration": 0.5}, {"name": "FA", "duration": 0.5},
    {"name": "FA", "duration": 0.5}, {"name": "SOL", "duration": 0.5},
    {"name": "FA", "duration": 0.5}, {"name": "MI", "duration": 0.5},
    {"name": "RE", "duration": 0.5}, {"name": "DO", "duration": 1}
  ]
}
```

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno con soporte para:
  - WebGL (Three.js)
  - Web Audio API
  - ES6+ JavaScript

### Ejecución Local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/ANGELUZ79/guitar-hero-3d.git
   cd guitar-hero-3d
   ```

2. Abre `index.html` en tu navegador web
   ```bash
   # Usando Python (recomendado para desarrollo)
   python -m http.server 8000
   # Luego ve a http://localhost:8000
   
   # O usando Node.js
   npx serve .
   ```

3. ¡Haz clic en cualquier lugar para activar el audio y comienza a jugar!

### Uso en Producción
- Simplemente aloja los archivos en cualquier servidor web
- No requiere instalación de dependencias adicionales
- Compatible con GitHub Pages, Netlify, Vercel, etc.

## 📁 Estructura del Proyecto

```
guitar-hero-3d/
├── index.html          # Estructura principal con canvas 3D
├── style.css           # Estilos CSS para la interfaz
├── script.js           # Lógica principal con Three.js
├── midi-sounds.js      # Sistema de sonidos MIDI
└── README.md          # Documentación del proyecto
```

## 🛠 Tecnologías Utilizadas

- **Three.js r128**: Renderizado 3D y animaciones
- **Web Audio API**: Generación de sonidos MIDI sintéticos
- **CSS3**: Interfaz de usuario moderna
- **JavaScript ES6+**: Lógica del juego y controles

## 🎯 Sistema de Puntuación

- **Perfect Hit** (distancia < 0.2): 100 puntos
- **Good Hit** (distancia < 0.5): 75 puntos
- **OK Hit** (distancia < 1.0): 50 puntos
- **Combo Multiplier**: +20% cada 5 hits consecutivos
- **Miss**: Reinicia el combo

## 🎨 Efectos Visuales

- **Partículas**: Explosión de colores al tocar una nota correctamente
- **Iluminación dinámica**: Las líneas invisibles se iluminan cuando pasan cilindros
- **Sombras y profundidad**: Efecto 3D realista con Three.js
- **Feedback visual**: Highlighting de las teclas presionadas

## 🔊 Sistema de Audio

- **Síntesis en tiempo real**: Generación de notas musicales usando osciladores
- **Efectos sonoros**: Sonidos de acierto, fallo y efectos especiales
- **Instrumentos**: Piano, guitarra y campana disponibles
- **ADSR Envelope**: Ataque, decaimiento, sostenimiento y liberación naturales

## 🐛 Solución de Problemas

### Audio no funciona
- Asegúrate de hacer clic en la página para activar el contexto de audio
- Verifica que tu navegador soporte Web Audio API
- Comprueba el volumen del sistema y del navegador

### Rendimiento lento
- Usa un navegador moderno con soporte WebGL completo
- Cierra otras pestañas que consuman muchos recursos
- Reduce la calidad gráfica si es necesario

### Controles no responden
- Verifica que el foco esté en la ventana del juego
- Usa las teclas numéricas (1-9) en la parte superior del teclado
- Asegúrate de que JavaScript esté habilitado

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**ANGELUZ79**
- GitHub: [@ANGELUZ79](https://github.com/ANGELUZ79)

---

¡Disfruta tocando música en 3D! 🎵🎮
