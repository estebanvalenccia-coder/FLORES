# FLORES · Sistema interno de floristería

Software interno para floristería conectado en red local.

## Arquitectura

- Ordenador administrador
- Tablet clientes
- Comunicación LAN
- Backend Node.js
- Preparado para Grok/xAI

---

# Ejecutar en red interna

## Instalar

```bash
npm install
```

## Ejecutar frontend + backend

```bash
npm run dev:full
```

---

# Abrir desde otros dispositivos

Buscar la IP local del ordenador.

Ejemplo:

```txt
192.168.1.50
```

Abrir desde la tablet:

```txt
http://192.168.1.50:5173/clientes
```

Admin:

```txt
http://192.168.1.50:5173/admin
```

---

# IA Grok/xAI

Crear archivo:

```txt
.env
```

Añadir:

```txt
XAI_API_KEY=tu_api_key
```

---

# Objetivo

- Control stock
- Calcular ramos
- IA recomendaciones
- Generar imágenes IA
- TPV interno
- Tiempo real LAN
