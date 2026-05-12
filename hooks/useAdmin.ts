import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../services/connectionFirebase';
import { ref, onValue } from 'firebase/database';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.log('useAdmin: sem usuário, isAdmin = false');
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    console.log(`useAdmin: usuário ${user.uid} - buscando role...`);
    const roleRef = ref(database, `users/${user.uid}/role`);
    const unsubscribe = onValue(roleRef, (snapshot) => {
      const role = snapshot.val();
      console.log(`useAdmin: role encontrado = ${role}`);
      setIsAdmin(role === 'admin');
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar role:', error);
      setIsAdmin(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { isAdmin, loading: loading || authLoading };
};