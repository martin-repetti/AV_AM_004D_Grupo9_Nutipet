<div align="center">

# NutriPET

### Proyecto Capstone

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## Descripción

**NutriPET** es un producto dirigido a mejorar la decisión de compra de usuarios que buscan productos específicos según la necesidad y el entorno de sus mascotas.

Mejora la experiencia de compra y entrega opciones de mejor calidad en lo que a alimentación respecta.

## Tecnologías utilizadas

| Área | Tecnologías |
|------|-------------|
| **Framework** | [Next.js](https://nextjs.org/) |
| **Frontend** | [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) y CSS |
| **Backend** | [Node.js](https://nodejs.org/) junto a [NestJS](https://nestjs.com/) |
| **Base de datos** | [PostgreSQL](https://www.postgresql.org/) |

## Ejecución local

### Requisitos previos

- [Node.js](https://nodejs.org/es/download) (versión LTS reciente).
- [PostgreSQL](https://www.postgresql.org/download/) (incluye `psql`). Recuerda la contraseña del usuario `postgres`.
- Git para clonar el repositorio.

Los comandos son para PowerShell en Windows, ejecutados desde la raíz del proyecto.

### 1. Clonar el repositorio

```powershell
git clone https://github.com/martin-repetti/AV_AM_004D_Grupo9_Nutipet.git
cd AV_AM_004D_Grupo9_Nutipet
```

### 2. Crear la base de datos

```powershell
psql -U postgres -c "CREATE DATABASE nutripet_db;"
```

### 3. Cargar el esquema y las razas

```powershell
psql -U postgres -d nutripet_db -f database\schema.sql
psql -U postgres -d nutripet_db -f database\seed_breeds.sql
```

Si necesitas volver a empezar, elimina la base con `psql -U postgres -c "DROP DATABASE nutripet_db;"` y repite los pasos 2 y 3.

### 4. Configurar las variables de entorno

```powershell
copy frontend\.env.example frontend\.env.local
```

Abre `frontend\.env.local` y completa:

- `DB_USER` y `DB_PASSWORD`: tu usuario y contraseña de PostgreSQL (por ejemplo `postgres`).
- `DB_NAME`: `nutripet_db`.
- `JWT_SECRET`: una cadena larga y aleatoria, propia de tu equipo.

No subas `frontend\.env.local` al repositorio: ya está ignorado por Git.

### 5. Instalar dependencias y ejecutar

```powershell
cd frontend
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Equipo

| Integrante | Rol |
|------------|-----|
| **Valentina Campos** | Product Owner |
| **Martin Repetti** | Scrum Master |
| **Felipe Trejo** | Desarrollador |
| **Christopher Vial** | Desarrollador |

## Metodología

La metodología empleada en el desarrollo de este proyecto es **Scrum**, organizando sprints, reuniones semanales y revisando el avance constante del desarrollo del proyecto.
<img width="750" height="500" alt="imagen" src="https://github.com/user-attachments/assets/643a012f-58da-4d37-b0a7-57282669feab" />

## Arquitectura

La arquitectura elegida para el desarrollo fue **MVP (Modelo Vista Presentador)**, lo que nos da un manejo completo y simple de la plataforma, tanto para pruebas como para mantención.
<img width="546" height="461" alt="imagen" src="https://github.com/user-attachments/assets/f962d0ab-46cf-4ceb-b826-5e4820ed33df" />

<div align="center">



</div>
