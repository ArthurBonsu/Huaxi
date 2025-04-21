// pages/welcome.tsx
import { ComponentType, FC, useState, useEffect,useContext } from 'react';

import Head from 'next/head';
import Link from 'next/link';

const Welcome: FC = () => {
  return (
    <>
      <Head>
        <title>Welcome Page</title>
        <meta name="description" content="Welcome to our Next.js application!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Welcome to Our Next.js App!</h1>
        <p className="mb-4">We are glad to have you here. Explore our features and enjoy your stay!</p>
        <Link href="/">
          <a className="text-blue-500 hover:underline">Go to Home</a>
        </Link>
      </main>
    </>
  );
};

export default Welcome;
