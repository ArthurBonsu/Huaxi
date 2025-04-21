import { createStandaloneToast } from '@chakra-ui/react'
import { UseToastOptions } from '@chakra-ui/react';
import { useRef, useEffect } from 'react'
import { useToast } from '@chakra-ui/react'

const toast = useToast()
const toastRef = useRef<string | number | undefined>()
export const showToast = (description: string, status: UseToastOptions['status'], duration = 3000) => {
 
 
  if (toastRef.current) toast.close(toastRef.current)
    toastRef.current = toast({
      variant: 'left-accent',
      description,
      status,
      position: 'top',
      duration,
    })

    
  }

