// File: app/api/auth/users/[user].ts
import { ComponentType, FC, useState, useEffect,useContext } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.query;

  if (req.method === 'GET') {
    // Handle fetching user data
    res.status(200).json({ message: `User data for ${user}` });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
