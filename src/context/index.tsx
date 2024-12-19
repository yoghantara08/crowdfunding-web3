import { useContext, createContext, ReactNode } from "react";

import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
  SmartContract,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext<{
  address: string;
  contract: SmartContract | undefined;
  connect: () => void;
  createCampaign: (form: any) => Promise<void>;
  getCampaigns: () => Promise<any[]>;
  getUserCampaigns: () => Promise<any[]>;
  donate: (pId: any, amount: string) => Promise<any>;
  getDonations: (pId: any) => Promise<any[]>;
}>({
  address: "",
  contract: undefined,
  connect: () => {},
  createCampaign: async (form: any) => {},
  getCampaigns: async () => [],
  getUserCampaigns: async () => [],
  donate: async (pId: any, amount: string) => {},
  getDonations: async (pId: any) => [],
});

export const StateContextProvider = ({ children }: { children: ReactNode }) => {
  const { contract } = useContract(
    "0x47E65CCE65eA13fF4f9C36417F47f85FB8F0eb4D"
  );
  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  const address = useAddress() || "";
  const connect = useMetamask();

  const publishCampaign = async (form: {
    title: any;
    description: any;
    target: any;
    deadline: string | number | Date;
    image: any;
  }) => {
    try {
      const data = await createCampaign({
        args: [
          address, // owner
          form.title, // title
          form.description, // description
          form.target,
          new Date(form.deadline).getTime(), // deadline,
          form.image,
        ],
      });

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    if (!contract) return [];

    const campaigns = await contract.call("getCampaigns");

    const parsedCampaings = campaigns.map(
      (
        campaign: {
          owner: any;
          title: any;
          description: any;
          target: { toString: () => ethers.BigNumberish };
          deadline: { toNumber: () => any };
          amountCollected: { toString: () => ethers.BigNumberish };
          image: any;
        },
        i: any
      ) => ({
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        target: ethers.utils.formatEther(campaign.target.toString()),
        deadline: campaign.deadline.toNumber(),
        amountCollected: ethers.utils.formatEther(
          campaign.amountCollected.toString()
        ),
        image: campaign.image,
        pId: i,
      })
    );

    return parsedCampaings;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign: { owner: string | undefined }) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async (pId: any, amount: string) => {
    if (!contract) return [];

    const data = await contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getDonations = async (pId: any) => {
    if (!contract) return [];

    const donations = await contract.call("getDonators", [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
