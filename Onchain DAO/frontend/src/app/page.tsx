"use client";
import styles from "./page.module.css";
import {
  CryptoDevsDAOABI,
  CryptoDevsDAOAddress,
  CryptoDevsNFTABI,
  CryptoDevsNFTAddress,
} from "@/constants";
import Head from "next/head";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useContractRead,
  usePublicClient,
} from "wagmi";

import { walletClient } from "@/config";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nftTokenId, setNftTokenId] = useState("");
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState("");
  const publicClient = usePublicClient();

  const daoOwner = useContractRead({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: "owner",
  });

  const daoBalance = useBalance({
    address: CryptoDevsDAOAddress,
  });

  const numOfProposalsInDAO = useContractRead({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: "numProposals",
  });

  const nftBalanceOfUser = useContractRead({
    abi: CryptoDevsNFTABI,
    address: CryptoDevsNFTAddress,
    functionName: "balanceOf",
    args: [address],
  });

  async function createProposal() {
    setLoading(true);

    try {
      const { request } = await publicClient.simulateContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "createProposal",
        args: [nftTokenId],
      });
      const hash = await walletClient.writeContract(request);
      window.alert(`Tx hash: ${hash}`);
    } catch (err) {
      console.error(err);
      window.alert(err);
    }

    setLoading(false);
  }

  async function executeProposal(proposalId: number) {
    setLoading(true);

    try {
      const { request } = await publicClient.simulateContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "executeProposal",
        args: [proposalId],
      });
      const hash = await walletClient.writeContract(request);
      window.alert(`Tx hash: ${hash}`);
    } catch (err) {
      console.error(err);
      window.alert(err);
    }

    setLoading(false);
  }

  async function withdrawDAOEther() {
    setLoading(true);

    try {
      const { request } = await publicClient.simulateContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "withdrawEther",
        args: [],
      });
      const hash = await walletClient.writeContract(request);
      window.alert(`Tx hash: ${hash}`);
    } catch (err) {
      console.error(err);
      window.alert(err);
    }

    setLoading(false);
  }

  async function fetchProposalById(id: number) {
    try {
      const proposal = await publicClient.readContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "proposals",
        args: [id],
      });

      // @ts-ignore
      const [nftTokenId, deadline, yayVotes, nayVotes, executed] = proposal;

      const parsedProposal = {
        proposalId: id,
        nftTokenId: nftTokenId.toString(),
        deadline: new Date(parseInt(deadline.toString()) * 1000),
        yayVotes: yayVotes.toString(),
        nayVotes: nayVotes.toString(),
        executed: Boolean(executed),
      };

      return parsedProposal;
    } catch (err) {
      console.error(err);
      window.alert(err);
    }
  }

  async function fetchAllProposals() {
    try {
      const proposals = [];

      for (let i = 0; i < (numOfProposalsInDAO.data as number); i++) {
        const proposal = await fetchProposalById(i);
        proposals.push(proposal);
      }

      setProposals(proposals);
      return proposals;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  async function voteForProposal(proposalId: number, vote: "YAY" | "NAY") {
    setLoading(true);

    try {
      const { request } = await publicClient.simulateContract({
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: "voteOnProposal",
        args: [proposalId, vote === "YAY" ? 0 : 1],
      });
      const hash = await walletClient.writeContract(request);
      window.alert(`Tx hash: ${hash}`);
    } catch (err) {
      console.error(err);
      window.alert(err);
    }

    setLoading(false);
  }

  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalanceOfUser.data === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.card}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteForProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div>
        <ConnectButton />
      </div>
    );

  return (
    <>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance:{" "}
            {
              // @ts-ignore
              nftBalanceOfUser.data.toString()
            }
            <br />
            {daoBalance.data && (
              <>
                Treasury Balance:{" "}
                {formatEther(daoBalance.data.value).toString()} ETH
              </>
            )}
            <br />
            Total Number of Proposals:{" "}
            {
              // @ts-ignore
              numOfProposalsInDAO.data.toString()
            }
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("Create Proposal")}
            >
              Create Proposal
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("View Proposals")}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {
            // @ts-ignore
            address && address.toLowerCase() === daoOwner.data.toLowerCase() ? (
              <div>
                {loading ? (
                  <button className={styles.button}>Loading...</button>
                ) : (
                  <button className={styles.button} onClick={withdrawDAOEther}>
                    Withdraw DAO ETH
                  </button>
                )}
              </div>
            ) : (
              ""
            )
          }
        </div>
        <div>
          <img className={styles.image} src="https://i.imgur.com/buNhbF7.png" />
        </div>
      </div>
    </>
  );
}
