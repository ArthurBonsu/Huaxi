// useSession.ts
import { useSession as useNextAuthSession } from 'next-auth/react';
import {useContext, useEffect} from 'react'
export const useSession = () => {
  return useNextAuthSession();
};