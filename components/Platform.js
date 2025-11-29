
        import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock, Award, Plus, Bell, CheckCircle, Moon, Sun, LogOut, Mail, Lock, X, Settings, Trash2 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,  
  updateDoc, 
  deleteDoc,
  query, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment 
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

export default function Platform() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [missions, setMissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFacebook, setRegFacebook] = useState('');
  const [regTiktok, setRegTiktok] = useState('');
  const [regInstagram, setRegInstagram] = useState('');
  const [regYoutube, setRegYoutube] = useState('');

  const [postPlatform, setPostPlatform] = useState('facebook');
  const [postUrl, setPostUrl] = useState('');
  const [postActions, setPostActions] = useState(['like']);
  const [postTarget, setPostTarget] = useState(10);
  const [postPoints, setPostPoints] = useState(5);

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() });
          setView('dashboard');
        }
      } else {
        setUser(null);
        setView('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Écouter les missions en temps réel
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'missions'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const missionsData = [];
        snapshot.forEach((doc) => {
          missionsData.push({ id: doc.id, ...doc.data() });
        });
        setMissions(missionsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Écouter les notifications en temps réel
  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'notifications'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === user.email) {
            notifsData.push({ id: doc.id, ...data });
          }
        });
        notifsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(notifsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Charger le thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  // Sauvegarder le thème
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const addNotification = async (message, type = 'info') => {
    if (!user) return;
    
    const notifData = {
      userId: user.email,
      message,
      type,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    try {
      await setDoc(doc(collection(db, 'notifications')), notifData);
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };

  const handleRegister = async () => {
    if (!regEmail || !regPassword) {
      alert('Email et mot de passe requis');
      return;
    }
    
    if (regPassword !== regConfirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (regPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const firebaseUser = userCredential.user;

      const userData = {
        email: regEmail,
        facebook: regFacebook,
        tiktok: regTiktok,
        instagram: regInstagram,
        youtube: regYoutube,
        points: 100,
        totalHelped: 0,
        totalReceived: 0,
        verified: false,
        joinDate: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser({ uid: firebaseUser.uid, ...userData });
      await addNotification('Bienvenue ! Vous avez reçu 100 points de démarrage 🎉', 'success');
      setView('dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Cet email est déjà utilisé');
      } else {
        alert('Erreur lors de l\'inscription: ' + error.message);
      }
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    
    if (!authEmail || !authPassword) {
      setLoginError('Email et mot de passe requis');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      const firebaseUser = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        await addNotification('Bon retour parmi nous ! 👋', 'success');
        setView('dashboard');
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        setLoginError('Aucun compte trouvé avec cet email');
      } else if (error.code === 'auth/wrong-password') {
        setLoginError('Mot de passe incorrect. Veuillez réessayer.');
      } else if (error.code === 'auth/invalid-credential') {
        setLoginError('Email ou mot de passe incorrect');
      } else {
        setLoginError('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setView('login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  const toggleAction = (action) => {
    if (postActions.includes(action)) {
      if (postActions.length > 1) {
        setPostActions(postActions.filter(a => a !== action));
      }
    } else {
      if (postActions.length < 2) {
        setPostActions([...postActions, action]);
      }
    }
  };

  const addPost = async () => {
    if (!postUrl) {
      alert('Veuillez entrer une URL');
      return;
    }
    
    if (postTarget < 1 || postPoints < 1) {
      alert('Valeurs invalides');
      return;
    }

    const totalCost = postPoints * postTarget * postActions.length;
    if (user.points < totalCost) {
      alert('Pas assez de points');
      return;
    }

    try {
      for (const action of postActions) {
        const missionData = {
          platform: postPlatform,
          url: postUrl,
          action: action,
          pointCost: postPoints,
          status: 'active',
          completed: 0,
          target: postTarget,
          needsVerification: [],
          owner: user.email,
          ownerId: user.uid,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(collection(db, 'missions')), missionData);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        points: increment(-totalCost)
      });

      setUser({ ...user, points: user.points - totalCost });
      await addNotification(`Demande publiée : ${postActions.join(' + ')} (${totalCost} points)`, 'info');

      setPostUrl('');
      setPostTarget(10);
      setPostPoints(5);
      setPostActions(['like']);
    } catch (error) {
      console.error('Erreur ajout mission:', error);
      alert('Erreur lors de la publication');
    }
  };

  const completeMission = async (mission) => {
    if (mission.ownerId === user.uid) {
      alert('Vous ne pouvez pas accomplir votre propre mission');
      return;
    }

    const verificationData = {
      id: `${user.uid}_${Date.now()}`,
      user: user.email,
      userId: user.uid,
      time: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'missions', mission.id), {
        needsVerification: arrayUnion(verificationData)
      });

      await addNotification(`Mission en attente de vérification pour ${mission.action} sur ${mission.platform}`, 'warning');
    } catch (error) {
      console.error('Erreur completion mission:', error);
      alert('Erreur lors de la soumission');
    }
  };

  const verifyCompletion = async (mission, verificationId, approve) => {
    if (mission.ownerId !== user.uid) return;

    const verification = mission.needsVerification.find(v => v.id === verificationId);
    if (!verification) return;

    try {
      if (approve) {
        await updateDoc(doc(db, 'missions', mission.id), {
          completed: Math.min(mission.completed + 1, mission.target),
          needsVerification: arrayRemove(verification)
        });

        await updateDoc(doc(db, 'users', verification.userId), {
          points: increment(mission.pointCost),
          totalHelped: increment(1)
        });

        await updateDoc(doc(db, 'users', user.uid), {
          totalReceived: increment(1)
        });

        const notifData = {
          userId: verification.user,
          message: `Mission validée ! +${mission.pointCost} points 🎉`,
          type: 'success',
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          read: false
        };
        await setDoc(doc(collection(db, 'notifications')), notifData);

        setUser({ ...user, totalReceived: user.totalReceived + 1 });
        await addNotification(`Mission validée pour ${verification.user}`, 'success');
      } else {
        await updateDoc(doc(db, 'missions', mission.id), {
          needsVerification: arrayRemove(verification)
        });
        await addNotification('Mission refusée', 'info');
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
      alert('Erreur lors de la vérification');
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const markNotificationAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), {
        read: true
      });
    } catch (error) {
      console.error('Erreur notification:', error);
    }
  };
  const deleteNotification = async (e, notifId) =>{
    e.stopPropagation();
    try {
       await deleteDoc(doc(db, 'notifications', notifId));
    } catch (error) {
      console.error('Erreur suppression notif:', error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid),{
        facebook: user.facebook || '',
        tiktok: user.tiktok ||'',
        instagram: user.instagram || '',
        youtube: user.youtube|| ''
      });
      await addNotification('Profil mis à jour succès','success');
      setView('dashboard');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-300';

  // --- AJOUT DE LA VUE PROFIL ---
  if (view === 'profile') {
    return (
      <div className={`min-h-screen ${bgClass} p-4`}>
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setView('dashboard')}
            className={`mb-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow flex items-center gap-2`}
          >
            ← Retour au tableau de bord
          </button>

          <div className={`${cardBgClass} rounded-xl shadow-lg p-8`}>
            <h2 className={`text-2xl font-bold ${textClass} mb-6 flex items-center gap-2`}>
              <Settings className="text-indigo-600" />
              Modifier mon profil
            </h2>
<div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Facebook</label>
                <input
                  type="text"
                  value={user?.facebook || ''}
                  onChange={(e) => setUser({ ...user, facebook: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Nom d'utilisateur ou lien"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>TikTok</label>
                <input
                  type="text"
                  value={user?.tiktok || ''}
                  onChange={(e) => setUser({ ...user, tiktok: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="@username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Instagram</label>
                <input
                  type="text"
                  value={user?.instagram || ''}
                  onChange={(e) => setUser({ ...user, instagram: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="@username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>YouTube</label>
                <input
                  type="text"
                  value={user?.youtube || ''}
                  onChange={(e) => setUser({ ...user, youtube: e.target.value })}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="Nom de chaîne"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleUpdateProfile}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'login' || view === 'register') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-indigo-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center p-4`}>
        <div className={`${cardBgClass} rounded-2xl shadow-xl p-8 max-w-md w-full`}>
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h1 className={`text-3xl font-bold ${textClass}`}>Coopération Sociale</h1>
            <p className={`${textSecondaryClass} mt-2`}>Générez des revenus passifs ensemble</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setView('login'); setLoginError(''); }}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${view === 'login' ? 'bg-indigo-600 text-white' : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setView('register'); setLoginError(''); }}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${view === 'register' ? 'bg-indigo-600 text-white' : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700')}`}
            >
              Inscription
            </button>
          </div>

          {view === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Email</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-3 ${textSecondaryClass}`} size={18} />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className={`w-full pl-10 pr-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Mot de passe</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3 ${textSecondaryClass}`} size={18} />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className={`w-full pl-10 pr-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Se connecter
              </button>
              
              {loginError && (
                <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  <strong>Erreur :</strong> {loginError}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Email *</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Mot de passe * (min. 6 caractères)</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Confirmer mot de passe *</label>
                <input
                  type="password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Facebook</label>
                <input
                  type="text"
                  value={regFacebook}
                  onChange={(e) => setRegFacebook(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="@username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>TikTok</label>
                <input
                  type="text"
                  value={regTiktok}
                  onChange={(e) => setRegTiktok(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="@username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Instagram</label>
                <input
                  type="text"
                  value={regInstagram}
                  onChange={(e) => setRegInstagram(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="@username"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>YouTube</label>
                <input
                  type="text"
                  value={regYoutube}
                  onChange={(e) => setRegYoutube(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="@channel"
                />
              </div>

              <button
                onClick={handleRegister}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                S'inscrire
              </button>
              
              <p className={`text-xs text-center ${textSecondaryClass} mt-2`}>
                Vous recevez 100 points de départ pour commencer !
              </p>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Mode clair' : 'Mode sombre'}
          </button>
        </div>
      </div>
    );
  }

  const myMissionsWithVerifications = missions.filter(m => 
    m.ownerId === user?.uid && m.needsVerification && m.needsVerification.length > 0
  );

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <nav className={`${cardBgClass} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" size={28} />
            <span className={`text-lg md:text-xl font-bold ${textClass}`}>Coopération Sociale</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} relative hover:opacity-80 transition`}
              >
                <Bell className="text-indigo-600" size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className={`fixed md:absolute right-4 md:right-0 top-16 md:top-auto md:mt-2 w-[calc(100vw-2rem)] md:w-80 ${cardBgClass} rounded-lg shadow-xl border ${borderClass} z-50 max-h-96 overflow-y-auto`}>
                  <div className={`p-4 border-b ${borderClass} flex justify-between items-center sticky top-0 ${cardBgClass}`}>
                    <h3 className={`font-bold ${textClass}`}>Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>
                      <X size={18} className={textSecondaryClass} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className={`p-4 text-center ${textSecondaryClass}`}>
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b ${borderClass} flex justify-between items-start gap-2 hover:opacity-90 ${!notif.read ? (darkMode ? 'bg-gray-700' : 'bg-blue-50') : ''}`}
                        onClick={() => markNotificationAsRead(notif.id)}
                      >
                      <div className="flex-1">
                        <p className={`text-sm ${textClass}`}>{notif.message}</p>
                        <p className={`text-xs ${textSecondaryClass} mt-1`}>{notif.time}</p>
                      </div>
                      <button 
                        onClick={(e) => deleteNotification(e, notif.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Supprimer">
                          <Trash2 size={16}/>
                      </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className={`flex items-center gap-2 ${darkMode ? 'bg-indigo-900' : 'bg-indigo-50'} px-3 md:px-4 py-2 rounded-lg`}>
              <Award className="text-indigo-600" size={18} />
              <span className="font-bold text-indigo-600 text-sm md:text-base">{user?.points || 0} pts</span>
            </div>
            
    
            <button
              onClick={() => setView('profile')}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} hover:opacity-80 transition`}
              title="Mon Profil"
            >
             <Settings size={20} />
            </button>

            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-red-400' : 'bg-gray-100 text-red-600'} hover:opacity-80 transition`}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${cardBgClass} rounded-xl shadow p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondaryClass} text-sm`}>Points disponibles</p>
                <p className="text-3xl font-bold text-indigo-600">{user?.points || 0}</p>
              </div>
              <Award className="text-indigo-600" size={40} />
            </div>
          </div>

          <div className={`${cardBgClass} rounded-xl shadow p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondaryClass} text-sm`}>Actions effectuées</p>
                <p className="text-3xl font-bold text-green-600">{user?.totalHelped || 0}</p>
              </div>
              <TrendingUp className="text-green-600" size={40} />
            </div>
          </div>

          <div className={`${cardBgClass} rounded-xl shadow p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`${textSecondaryClass} text-sm`}>Aide reçue</p>
                <p className="text-3xl font-bold text-blue-600">{user?.totalReceived || 0}</p>
              </div>
              <Users className="text-blue-600" size={40} />
            </div>
          </div>
        </div>

        {myMissionsWithVerifications.length > 0 && (
          <div className={`${cardBgClass} rounded-xl shadow p-6 mb-8`}>
            <h2 className={`text-2xl font-bold ${textClass} mb-4 flex items-center gap-2`}>
              <CheckCircle className="text-orange-500" />
              Vérifications en attente ({myMissionsWithVerifications.reduce((sum, m) => sum + m.needsVerification.length, 0)})
            </h2>
            <div className="space-y-4">
              {myMissionsWithVerifications.map(mission => (
                <div key={mission.id} className={`border ${borderClass} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-semibold uppercase">
                        {mission.platform}
                      </span>
                      <p className={`text-sm ${textSecondaryClass} mt-1`}>{mission.action}</p>
                    </div>
                  </div>
                  {mission.needsVerification.map(verif => (
                    <div key={verif.id} className={`flex justify-between items-center p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg mb-2`}>
                      <div>
                        <p className={`text-sm ${textClass} font-medium`}>{verif.user}</p>
                        <p className={`text-xs ${textSecondaryClass}`}>{new Date(verif.time).toLocaleString('fr-FR')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifyCompletion(mission, verif.id, true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                          ✓ Valider
                        </button>
                        <button
                          onClick={() => verifyCompletion(mission, verif.id, false)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                        >
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`${cardBgClass} rounded-xl shadow p-6`}>
            <h2 className={`text-2xl font-bold ${textClass} mb-6 flex items-center gap-2`}>
              <Plus className="text-indigo-600" />
              Demander de l'aide
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>Plateforme</label>
                <select
                  value={postPlatform}
                  onChange={(e) => setPostPlatform(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                >
                  <option value="facebook">Facebook</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-1`}>URL du contenu</label>
                <input
                  type="url"
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>Actions demandées (max 2)</label>
                <div className="grid grid-cols-2 gap-2">
                  {['like', 'comment', 'view', 'share'].map(action => (
                    <button
                      key={action}
                      onClick={() => toggleAction(action)}
                      className={`py-2 px-4 rounded-lg font-medium transition ${
                        postActions.includes(action)
                          ? 'bg-indigo-600 text-white'
                          : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700')
                      }`}
                    >
                      {action === 'like' && '👍 Like'}
                      {action === 'comment' && '💬 Commentaire'}
                      {action === 'view' && '👁️ Vue'}
                      {action === 'share' && '🔄 Partage'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${textClass} mb-1`}>Nombre souhaité</label>
                  <input
                    type="number"
                    value={postTarget}
                    onChange={(e) => setPostTarget(Number(e.target.value))}
                    min="1"
                    className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textClass} mb-1`}>Points/action</label>
                  <input
                    type="number"
                    value={postPoints}
                    onChange={(e) => setPostPoints(Number(e.target.value))}
                    min="1"
                    className={`w-full px-4 py-2 border ${borderClass} rounded-lg focus:ring-2 focus:ring-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
                  />
                </div>
              </div>

              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm ${textClass} font-medium`}>
                  Coût total : {postPoints * postTarget * postActions.length} points
                </p>
                <p className={`text-xs ${textSecondaryClass} mt-1`}>
                  {postActions.length} action(s) × {postTarget} fois × {postPoints} pts
                </p>
              </div>

              <button
                onClick={addPost}
                disabled={!user || user.points < postPoints * postTarget * postActions.length || !postUrl}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Publier la demande
              </button>
              {user && user.points < postPoints * postTarget * postActions.length && (
                <p className="text-xs text-red-500 text-center">
                  Pas assez de points ! Effectuez des missions pour en gagner.
                </p>
              )}
            </div>
          </div>

          <div className={`${cardBgClass} rounded-xl shadow p-6`}>
            <h2 className={`text-2xl font-bold ${textClass} mb-6 flex items-center gap-2`}>
              <TrendingUp className="text-green-600" />
              Missions disponibles
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {missions.filter(m => m.completed < m.target && m.ownerId !== user?.uid).length === 0 ? (
                <div className={`text-center py-8 ${textSecondaryClass}`}>
                  <Clock size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Aucune mission disponible pour le moment</p>
                  <p className="text-sm mt-2">Soyez le premier à publier une demande !</p>
                </div>
              ) : (
                missions
                  .filter(m => m.completed < m.target && m.ownerId !== user?.uid)
                  .map((mission) => (
                    <div key={mission.id} className={`border ${borderClass} rounded-lg p-4 hover:border-indigo-300 transition`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-semibold uppercase">
                            {mission.platform}
                          </span>
                          <p className={`text-sm ${textSecondaryClass} mt-1`}>
                            {mission.action === 'like' && '👍 Like'}
                            {mission.action === 'comment' && '💬 Commentaire'}
                            {mission.action === 'view' && '👁️ Vue'}
                            {mission.action === 'share' && '🔄 Partage'}
                          </p>
                        </div>
                        <span className="text-green-600 font-bold">+{mission.pointCost} pts</span>
                      </div>

                      <div className="mb-3">
                        <div className={`flex justify-between text-xs ${textSecondaryClass} mb-1`}>
                          <span>Progression</span>
                          <span>{mission.completed}/{mission.target}</span>
                        </div>
                        <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${(mission.completed / mission.target) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <a
                          href={mission.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'} py-2 px-4 rounded-lg text-center text-sm font-medium hover:opacity-80 transition`}
                        >
                          Voir le contenu
                        </a>
                        <button
                          onClick={() => completeMission(mission)}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                          Mission accomplie
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
