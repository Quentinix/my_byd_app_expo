# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Mesures et Règles de Sécurité

Tout agent intervenant sur cette base de code DOIT respecter scrupuleusement les consignes de sécurité suivantes :

## 1. Gestion des Identifiants et Mots de Passe
- **Aucun mot de passe en clair** : Ne JAMAIS stocker ou persister le mot de passe utilisateur, que ce soit dans `SecureStore` (mobile) ou dans `localStorage` (web).
- **Persistance minimale** : Seuls les jetons de session chiffrés (`user_id`, `sign_token`, `encry_token`) et les identifiants publics (`username`, `countryCode`, `rememberMe`) peuvent être sauvegardés via `BydSecureStorage`.
- **Expiration** : Si la session expire (`BydSessionExpiredError`), la session locale doit être invalidée et l'utilisateur doit ressaisir son mot de passe manuellement.

## 2. Communications Réseau et Chiffrement en Transit
- **HTTPS direct obligatoire sur mobile** : Toutes les requêtes vers l'API Cloud BYD (`https://dilinkappoversea-eu.byd.auto`) doivent s'effectuer directement en HTTPS sécurisé, y compris en mode développement (`__DEV__`). Ne jamais router le trafic mobile vers du HTTP en clair sur le réseau local.
- **Proxy Metro sécurisé pour le Web** : Le middleware `/byd-api` dans `metro.config.js` est strictement réservé au Web local (`Platform.OS === 'web'`) pour le contournement CORS :
  - Accès restreint uniquement aux origines locales (`localhost`, `127.0.0.1` ou hôte de dev local). Jamais de wildcard `Access-Control-Allow-Origin: *`.
  - Méthodes strictement limitées à `POST` et `OPTIONS`.
  - Protection contre la traversée de chemin (*path traversal*) et les injections d'URL.

## 3. Cryptographie et Aléatoire
- **Générateur aléatoire sécurisé (CSPRNG)** : Ne jamais utiliser `Math.random()` ni `CryptoJS.lib.WordArray.random()` (inopérant sous React Native natif sans CSPRNG polyfillé). Utiliser exclusivement `secureRandomHex()` (basé sur le module natif `expo-crypto`).
- **Validation du padding PKCS#7** : Toujours vérifier la cohérence et l'intégrité de tous les octets de padding lors du déchiffrement (`stripPkcs7`) avant tout découpage de mémoire.

## 4. Protection de l'Interface Utilisateur (UI)
- **Confidentialité des jetons** : Ne jamais afficher les jetons sensibles (`sign_token`, `encry_token`) dans l'interface graphique (protection contre le *shoulder surfing* et les captures d'écran indiscrètes).
- **Saisie sécurisée sur claviers mobiles** : Sur les formulaires d'authentification (`TextInput`), toujours définir :
  - Sur le mot de passe : `autoCorrect={false}`, `spellCheck={false}`, `autoCapitalize="none"`, `autoComplete="password"`, `textContentType="password"`.
  - Sur l'identifiant : `autoCorrect={false}`, `spellCheck={false}`, `autoCapitalize="none"`, `autoComplete="username"`, `textContentType="username"`.

## 5. Résilience Réseau
- Toujours protéger les désérialisations `JSON.parse` des réponses HTTP afin de gérer élégamment les retours non-JSON (portails captifs Wi-Fi, erreurs WAF Cloudflare, etc.) sans faire crasher l'application.

# Règles d'Architecture, Clarté et Ergonomie du Code

## 1. Modularité et Composants Compréhensibles par l'Humain
- **Composants ciblés (< 150-200 lignes)** : Bannir les composants monolithiques géants. Un composant doit avoir une responsabilité claire. Découper les tableaux de bord et écrans riches en sous-composants cohésifs (ex: sous-dossiers `components/.../dashboard/`).
- **Code auto-documenté sans surcharge** : La clarté doit émerger directement des noms de variables, fonctions et types explicites, sans dépendre de pavés de commentaires.

## 2. Défilement et Gestes React Native (Zéro Nested ScrollViews)
- **Interdiction stricte des ScrollViews verticales imbriquées** : Ne jamais imbriquer un composant `<ScrollView>` vertical dans un autre `<ScrollView>` (comme `ScreenLayout`). Le conteneur parent assure le défilement ; les composants enfants utilisent `<View>`.

## 3. Routage Déclaratif et Écrans Protégés (Expo Router)
- **Redirection propre** : Ne jamais restituer de texte brut ou de fragment non stylisé en cas d'absence de session (ex: `<>Pas de session</>`). Utiliser systématiquement `<Redirect href="/Authentication" />` pour rediriger proprement l'utilisateur.

## 4. Asynchronisme et Calculs Pures
- **Pas d'asynchronisme factice** : Ne jamais marquer une fonction `async` si elle n'exécute aucune I/O asynchrone réelle (pas de fausse `Promise<void>`).
- **Initialisation paresseuse et singleton** : Mettre en cache synchrone les tables ou structures statiques volumineuses (ex: tables binaires Bangcle) pour éviter tout recalcul ou rechargement inutile à chaque requête.
- **Cycle de vie React 19** : Respecter les règles React Compiler / ESLint sur les effets (`react-hooks/set-state-in-effect`) pour éviter les rendus en cascade.

## 5. Hygiène et Élimination du Code Mort
- **Suppression directe de l'obsolète** : Supprimer immédiatement les scripts et dépendances de template inutilisées (ex: `reset-project.js`) et garder `package.json` strictement aligné.

