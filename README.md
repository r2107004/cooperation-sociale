#  Coopération Sociale

Plateforme collaborative pour générer des revenus passifs sur les réseaux sociaux.

##  Fonctionnalités

- ✅ Authentification sécurisée avec Firebase
- 🔄 Synchronisation en temps réel entre utilisateurs
- 📱 Interface responsive (mobile, tablette, desktop)
- 🌓 Mode sombre / clair
- 🔔 Système de notifications
- ✓ Vérification des missions
- 🎯 Système de points

##  Déploiement rapide

### Prérequis
- Compte Firebase (gratuit)
- Compte Vercel (gratuit)
- Compte GitHub (gratuit)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/VOTRE_USERNAME/cooperation-sociale.git
cd cooperation-sociale
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**
- Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
- Activez Firestore Database et Authentication
- Copiez vos clés de configuration

4. **Variables d'environnement**
Créez un fichier `.env.local` :
```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

5. **Lancer en local**
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000)

6. **Déployer sur Vercel**
```bash
# Pousser sur GitHub
git add .
git commit -m "Initial commit"
git push

# Puis connectez votre repo sur Vercel
# Ajoutez les variables d'environnement
# Déployez !
```

##  Documentation complète

Consultez [GUIDE_DEPLOIEMENT.md](./GUIDE_DEPLOIEMENT.md) pour des instructions détaillées.

##  Technologies utilisées

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Firebase (Firestore + Auth)
- **Déploiement**: Vercel
- **Icons**: Lucide React

##  Limites gratuites

**Firebase Spark Plan:**
- 50,000 lectures/jour
- 20,000 écritures/jour
- 1 GB stockage

**Vercel Hobby Plan:**
- 100 GB bande passante/mois
- Déploiements illimités

##  Sécurité

- Authentification Firebase
- Règles Firestore configurées
- Variables d'environnement sécurisées
- Validation côté serveur

##  License

MIT License - Libre d'utilisation

##  Auteur

Créé avec ❤️ pour la communauté

##  Support

Besoin d'aide ? Ouvrez une issue sur GitHub !

---

**⭐ Si ce projet vous aide, n'hésitez pas à mettre une étoile !**# cooperation-sociale
