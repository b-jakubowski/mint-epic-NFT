import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNFT from "./utils/MyEpicNFT.json";

const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/assets";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x007594b7888FD59aF7eC9d260A28b07f40E448E9"; // 05.12

const App = () => {
	const [walletError, setWalletError] = useState(false);
	const [nftLink, setNftLink] = useState(null);
	const [minted, setMinted] = useState(false);
	const [mintCount, setMintCount] = useState(0);
	const [currentAccount, setCurrentAccount] = useState("");

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			setWalletError(true);
			console.log("Make sure you have metamask!");
			return;
		} else {
			setWalletError(false);
			console.log("We have the ethereum object", ethereum);
		}

		const accounts = await ethereum.request({ method: "eth_accounts" });

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log("Found an authorized account:", account);
			setCurrentAccount(account);
			setupEventListener();
		} else {
			console.log("No authorized account found");
		}
	};

	const setupEventListener = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNFT.abi,
					signer
				);

				connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
					setNftLink(
						`${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
					);
					setMintCount(Number(tokenId) + 1);
					setMinted(true);
					console.warn(
						"+++++++ NFT Link:",
						`${OPENSEA_LINK}/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
					);
				});

				console.log("Setup event listener!");
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			/*
			 * Fancy method to request access to account.
			 */
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			/*
			 * Boom! This should print out public address once we authorize Metamask.
			 */
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const askContractToMintNft = async () => {
		try {
			const { ethereum } = window;
			setMinted(false);

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const connectedContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					myEpicNFT.abi,
					signer
				);

				console.log("Going to pop wallet now to pay gas...");
				let nftTxn = await connectedContract.makeAnEpicNFT();

				console.log("Mining...please wait.");
				await nftTxn.wait();

				console.log(
					`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
				);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();

		if (currentAccount !== "") {
			setupEventListener();
		}
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">My NFT Collection</p>
					<p className="sub-text">
						Each unique. Each beautiful. Discover your NFT today.
					</p>

					{currentAccount === "" ? (
						<button
							onClick={connectWallet}
							className="cta-button connect-wallet-button"
						>
							Connect to Wallet
						</button>
					) : (
						<button
							onClick={askContractToMintNft}
							className="cta-button connect-wallet-button"
						>
							Mint NFT
						</button>
					)}

					{minted && (
						<>
							<a href={nftLink} className="cta-button connect-wallet-button">
								Check Your NFT on Opensea
							</a>
							<p className="sub-text">
								Minted NFTs: {mintCount} / {TOTAL_MINT_COUNT}
							</p>
						</>
					)}
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built on @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
