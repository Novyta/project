import React, { useState, useEffect } from "react";
import { Contract, getDefaultProvider, providers, utils } from "ethers";
import { config } from "../config";
import abi from "../fixtures/abi.json";
import axios from "axios";

const provider = getDefaultProvider("rinkeby", { alchemy: config.alchemyKey });
const contract = new Contract(
  "0x30b4Dc580B413a06390eCd50dcd6b9fB721BdC01",
  abi,
  provider
);

const formatIpfsUrl = (url) => {
  return url.replace(/ipfs:\/\//g, "https://cloudflare-ipfs.com/");
};

export const HomePage = () => {
  const [mintedNftState, setMintedNftState] = useState({
    state: "UNINITIALIZED",
  });
  const [purchaseState, setPurchaseState] = useState({
    state: "UNINITIALIZED",
  });
  const modalVisible =
    purchaseState.state === "PENDING_METAMASK" ||
    purchaseState.state === "PENDING_SIGNER" ||
    purchaseState.state === "PENDING_CONFIRMAION";

  const loadRobotsData = async () => {
    setMintedNftState({
      state: "PENDING",
    });
    const totalSupply = await contract.totalSupply();
    const ids = [...Array(totalSupply.toNumber()).keys()];
    const deferredData = ids.map(async (id) => {
      const ipfsUri = await contract.tokenURI(id);
      const owner = await contract.ownerOf(id);
      const formattedUri = formatIpfsUrl(ipfsUri);
      const metadata = (await axios.get(formattedUri)).data;
      const formattedImage = formatIpfsUrl(metadata.image);
      return {
        id,
        name: metadata.name,
        image: formattedImage,
        description: metadata.description,
        owner,
      };
    });
    const data = await Promise.all(deferredData);
    setMintedNftState({
      state: "SUCCESS",
      data,
    });
  };

  useEffect(() => {
    loadRobotsData();
  }, []);

  const handlePurchase = async () => {
    const { ethereum } = window;
    if (typeof ethereum == "undefined") alert("Metamask is not detected");

    // Prompts Metamask to connect
    setPurchaseState({ state: "PENDING_METAMASK" });
    await ethereum.enable();

    // Create new provider from Metamask
    const provider = new providers.Web3Provider(window.ethereum);

    // Get the signer from Metamask
    const signer = provider.getSigner();

    // Create the contract instance
    const contract = new Contract(
      "0x30b4Dc580B413a06390eCd50dcd6b9fB721BdC01",
      abi,
      signer
    );

    // Call the purchase method
    setPurchaseState({ state: "PENDING_SIGNER" });

    

    try {
      const receipt = await contract.purchase({ value: utils.parseEther("1") });
      setPurchaseState({ state: "PENDING_CONFIRMAION" });
      const transaction = await receipt.wait();
      setPurchaseState({ state: "SUCCESS", transaction });
    } catch (err) {
        console.log(err);
        return setPurchaseState({ state: "UNINITIALIZED" });
      }
  




    // Reload the Robots
    await loadRobotsData();
  };

  return (
    <div className="bg-green-400 border-2 border-none border-pink-700">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 border-2 border-none border-purple-600 ">
      
        
      <div className=" text-blue-900 text-7xl font font font italic border-2 border-none border-black">

        <div className="w-auto border-2 border-none">

          <div className=" border-2 border-none border-red-900 mx-auto justify-center h-48 pt-10 px-60 ">
            <div className="border-2 border-none border-green-900 h-24 mx-auto">
              <div className="border-none border-2 border-yellow-500 float-left">
              COOL ELEPHANTS
              
              </div>
              <div className="border-2 border-none w-20 float-left">
                <img src="https://img.icons8.com/officel/70/000000/elephant.png" alt=""/>
              </div>
            </div>
          </div>

        </div>

        </div>

      <div className="mt-1">

          <button
          onClick={handlePurchase}
          type="button"
          className="inline-flex items-center px-6 py-3 border mb-10 text-white bg-pink-700 border-transparent text-base font-medium rounded-sm"
        >
          Buy Elephant 
          </button>

       </div>

       {mintedNftState.state === "PENDING" && (
          <div className="text-xl text-white border-2 border-none h-screen">
            <div className="border-2 border-none border-red-900 w-40 h-14 justify-center mx-auto mt-44">
              <div className="float-left w-8 h-8"><img src="images/output-onlinegiftools.gif" alt=""></img></div>
              <div className="border-2 border-none float-right text-black">
                LOADING...
              </div>
            </div>
          </div>
        )}
       
        {mintedNftState.state === "SUCCESS" && (
          <div className="grid grid-cols-3 gap-4 border-2 border-none clear-both">
            {mintedNftState.data.map(
              ({ id, image, name, description, owner }) => {
                return (
                  <div key={id} className="bg-white rounded p-2">
                    <img src={image} className="mx-auto p-4" alt={name} />
                    <div className="text-xl">{name}</div>
                    <div className="">{description}</div>
                    <hr className="my-4" />
                    <div className="text-left text-sm">Owned By:</div>
                    <div className="text-left text-xs">{owner}</div>
                  </div>
                );
              }
            )}
          </div>
        )}
       
      </div>
      {modalVisible && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-6 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-blue-800 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            />
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              ​
            </span>
            <div className="inline-block align-bottom bg-black rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-500"
                    id="modal-title"
                  >
                    {purchaseState.state === "PENDING_METAMASK" &&
                      "Connecting Metamask..."}
                    {purchaseState.state === "PENDING_SIGNER" &&
                      "Waiting for Signed Transaction"}
                    {purchaseState.state === "PENDING_CONFIRMAION" &&
                      "Waiting for Block Confirmation"}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {purchaseState.state === "PENDING_METAMASK" &&
                        "Allow Metamask to connect to this application in the extension."}
                      {purchaseState.state === "PENDING_SIGNER" &&
                        "Approve the purchase transaction within the Metamask extension"}
                      {purchaseState.state === "PENDING_CONFIRMAION" &&
                        "Transaction has been sent to the blockchain. Please wait while the transaction is being confirmed."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
