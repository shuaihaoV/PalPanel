import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import crypto from 'crypto';
interface UserType {
  name?: string;
  id?: string;
  username: string;
  isLogedIn:boolean;
}

declare module "next-auth" {
  interface Session {
    user?: UserType;
  }
}

async function authenticate(username: string, password: string) {
  if(!process.env.WEB_USERNAME || !process.env.WEB_PASSWORD) return null;
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  if(username === process.env.WEB_USERNAME && hashedPassword === process.env.WEB_PASSWORD){
    const user:UserType = {
      id: username,
      name: username,
      username: username,
      isLogedIn:true
    }
    return user;
  }else{
    return null;
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "username" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string
          password: string
        };
        const result = await authenticate(username, password);
        return result;
      }
    }),
  ],
  callbacks: {
    async session({ session, token }:{ session:any, token?:any }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isLogedIn = token.isLogedIn;
      }
      return session;
    },
    async jwt({ token, user }:{ token:any, user?:any }) {
      if (user) {
        return {id:user.id,username:user.username,isLogedIn:true};
      }
      return token
    }
  }
});
