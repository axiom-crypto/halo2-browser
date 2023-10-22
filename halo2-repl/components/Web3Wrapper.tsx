'use client'

import React from 'react';
import { WagmiConfig, createConfig } from 'wagmi';
import {
    goerli
} from 'wagmi/chains';
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

export default function Web3Wrapper(props: { children: React.ReactNode }) {

    const wagmiConfig = createConfig(
        getDefaultConfig({
            alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID as string,
            walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
            appName: "Halo2REPL",
            autoConnect: true,
            chains: [goerli],
        }),
    );

    return (
        <WagmiConfig config={wagmiConfig}>
            <ConnectKitProvider theme="minimal">
                {props.children}
            </ConnectKitProvider>
        </WagmiConfig>
    )
}