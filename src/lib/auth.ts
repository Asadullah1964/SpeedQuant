import GoogleProvider from "next-auth/providers/google";

import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {

    providers: [

        GoogleProvider({
            clientId:
                process.env.GOOGLE_CLIENT_ID!,

            clientSecret:
                process.env
                    .GOOGLE_CLIENT_SECRET!,
        }),

    ],

    secret:
        process.env.NEXTAUTH_SECRET,

    session: {
        strategy: "jwt",
    },

    callbacks: {

        async jwt({
            token,
            user,
        }) {

            if (user) {
                token.email =
                    user.email;
            }

            return token;
        },

        async session({
            session,
            token,
        }) {

            if (
                token &&
                session.user
            ) {
                session.user.email =
                    token.email as string;
            }

            return session;
        },
    },
};