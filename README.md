
# EPYTODO - API pour une Todo List

## 📌 Description du projet

**EpyTodo** est une API REST développée avec **Node.js** et **Express**, connectée à une base de données **MySQL**.  
Elle permet de gérer une liste de tâches (todos) assignées à des utilisateurs.  
L’objectif est de fournir un backend robuste pour la gestion d’un système CRUD avec authentification via JWT.

---

## ⚙️ Installation

### 1. Cloner le dépôt
```bash
git clone <URL_DU_REPO>
cd <NOM_DU_REPO>
```

### 2. Installer les dépendances Node.js
```bash
npm install
```

### 📦 Packages utilisés

- `express`
- `mysql2`
- `dotenv`
- `jsonwebtoken`
- `bcryptjs`

---

### 3. Fichier `.env`
Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
MYSQL_DATABASE=epytodo
MYSQL_HOST=localhost
MYSQL_USER=user
MYSQL_ROOT_PASSWORD=password
PORT=3000
SECRET=test
```

> Modifiez les valeurs selon votre configuration locale.

### 4. Démarrer le serveur
```bash
npm start
```

> Le serveur Node.js s’exécutera sur `http://localhost:3000` par défaut.

---

## 🧱 Base de données

Créez la base de données MySQL avec deux tables : `user` et `todo`.
> Le script `.sql` de création doit être placé à la racine du projet.

---

## 🔒 Authentification

- Utilise **JWT (jsonwebtoken)** pour sécuriser les routes.
- Les routes protégées nécessitent un token valide dans l’en-tête `Authorization`.

---

## 📡 Endpoints principaux (REST API)

| Route                | Méthode | Protégée | Description                       |
|---------------------|---------|----------|-----------------------------------|
| `/register`         | POST    | ❌       | Créer un utilisateur              |
| `/login`            | POST    | ❌       | Se connecter                      |
| `/user`             | GET     | ✅       | Infos de l’utilisateur connecté   |
| `/user/todos`       | GET     | ✅       | Todos de l’utilisateur            |
| `/users/:id`        | GET     | ✅       | Infos d’un utilisateur            |
| `/users/:id`        | PUT     | ✅       | Mettre à jour un utilisateur      |
| `/users/:id`        | DELETE  | ✅       | Supprimer un utilisateur          |
| `/todos`            | GET     | ✅       | Voir tous les todos               |
| `/todos/:id`        | GET     | ✅       | Voir un todo                      |
| `/todos`            | POST    | ✅       | Créer un todo                     |
| `/todos/:id`        | PUT     | ✅       | Mettre à jour un todo             |
| `/todos/:id`        | DELETE  | ✅       | Supprimer un todo                 |
