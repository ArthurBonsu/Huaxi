"use client"
import Rect from 'react'
import { getSession, useSession } from "next-auth/react"

import { useRouter } from 'next/router'
const  {Heading} =require ('@chakra-ui/react');
const Protected  = ( ) => {
    const {push} = useRouter()
         // router.push can also be used 
    const {data:session, status }  = useSession({
        required:true,
        onUnauthenticated: () => {
             push('/auth/signin')

        },
    })
    if (status === 'unauthenticated' )
    return <Heading> You are unauthenticated. This is a protected page </Heading>
    
    return <Heading> {session.user.email} </Heading>
}


export const getServerSideProps = async (ctx) => {
    const session = await getSession(ctx)

    if(!session)
    return {
        redirect:{
        destination: 'auth/signin ',
    },
}
    return {
        props: {session},
    }
}




export default Protected 