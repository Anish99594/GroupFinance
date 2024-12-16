import React, { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import "./App.css";

import {
  GROUPLENDINGANDBORROWINGABI,
  GROUPLENDINGANDBORROWINGADDRESS,
} from "./abi/constant";

function App() {
  const [activeTab, setActiveTab] = useState("Borrower"); // Borrower, Lender, Admin
  const handleTabChange = (tab) => setActiveTab(tab);

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // Input states
  const [groupMembers, setGroupMembers] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [repaymentDays, setRepaymentDays] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [defaultCoverAmount, setDefaultCoverAmount] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupDetails, setGroupDetails] = useState(null);
  const [repaymentProgress, setRepaymentProgress] = useState(null);
  const [defaultingMembers, setDefaultingMembers] = useState(null);

  const { writeContractAsync, isPending } = useWriteContract();

  //fetch group details
  const { data: details, isError: detailsError } = useReadContract({
    address: GROUPLENDINGANDBORROWINGADDRESS,
    abi: GROUPLENDINGANDBORROWINGABI,
    functionName: "getGroupDetails",
    args: [groupId],
  });

  console.log(details);

  const { data: RepaymentProgressDetails, isError: RepaymentProgressError } =
    useReadContract({
      address: GROUPLENDINGANDBORROWINGADDRESS,
      abi: GROUPLENDINGANDBORROWINGABI,
      functionName: "getRepaymentProgress",
      args: [groupId],
    });

  console.log(RepaymentProgressDetails);

  const { data: defaultingMembersDetails, isError: defaultingMembersError } =
    useReadContract({
      address: GROUPLENDINGANDBORROWINGADDRESS,
      abi: GROUPLENDINGANDBORROWINGABI,
      functionName: "getDefaultingMembers",
      args: [groupId],
    });

  console.log("defaultmembers:", defaultingMembersDetails);

  // Helper function to restrict negative values and non-numeric input
  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    // Allow only valid positive numbers or decimals
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setter(value);
    }
  };

  // Admin Functions

  async function createGroup() {
    console.log("Creating group...");

    try {
      // Validate input data
      if (!groupMembers || !loanAmount || !repaymentDays) {
        toast.error("All fields are required.");
        return;
      }

      // Check if the group has at least two members
      const members = groupMembers.split(",").map((addr) => addr.trim());
      if (members.length < 2) {
        toast.error("Group must have at least two members.");
        return;
      }

      // Convert loanAmount to Wei using ethers
      const loanAmountInWei = ethers.utils.parseEther(loanAmount);

      // Call the smart contract function to create the group
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "createGroup",
        args: [members, loanAmountInWei, repaymentDays],
      });

      console.log("Group created successfully!", transaction);
      toast.success("Group created successfully!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (
        error.message.includes("Group must have at least two members")
      ) {
        // Handle the specific error from the smart contract
        toast.error("Group must have at least two members.");
      } else if (
        error.message.includes("Loan amount must be greater than zero")
      ) {
        // Handle the specific error from the smart contract
        toast.error("Loan amount must be greater than zero.");
      } else if (error.message.includes("revert")) {
        // Handle revert errors (could be from the contract)
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Group creation failed: ${error.message || error}`);
      }
    }
  }

  async function disburseLoan(groupId) {
    console.log("Disbursing loan...");

    try {
      // Check if the groupId is valid
      if (!groupId || groupId <= 0) {
        toast.error("Invalid group ID.");
        return;
      }

      // Call the smart contract function to disburse the loan
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "disburseLoan",
        args: [groupId],
      });

      console.log("Loan disbursed successfully!", transaction);
      toast.success("Loan disbursed successfully!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (error.message.includes("Loan already disbursed")) {
        // Handle the specific error from the smart contract
        toast.error("Loan has already been disbursed for this group.");
      } else if (error.message.includes("revert")) {
        // Handle revert errors (could be from the contract)
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Loan disbursement failed: ${error.message || error}`);
      }
    }
  }

  // Lender Functions
  async function invest() {
    console.log("Investing...");

    try {
      // Check if investment amount is valid
      if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
        toast.error("Investment amount must be greater than zero");
        return;
      }

      // Convert investmentAmount to Wei using ethers
      const valueToInvest = ethers.utils.parseEther(investmentAmount);

      // Send the investment transaction to the contract
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "invest",
        args: [],
        value: valueToInvest,
      });

      console.log("Investment successful!", transaction);
      toast.success("Investment successful!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (
        error.message.includes("Investment must be greater than zero")
      ) {
        // Handle the specific error from the smart contract
        toast.error("Investment amount must be greater than zero.");
      } else if (error.message.includes("revert")) {
        // Handle revert errors (could be from the contract)
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Investment failed: ${error.message || error}`);
      }
    }
  }

  async function withdrawPrincipal() {
    console.log("Withdrawing principal...");

    try {
      // Check if withdrawal amount is valid
      if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
        toast.error("Withdrawal amount must be greater than zero");
        return;
      }

      // Convert withdrawal amount to Wei using ethers
      const valueToWithdraw = ethers.utils.parseEther(withdrawAmount);

      // Send the withdrawal transaction to the contract
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "withdrawPrincipal",
        args: [valueToWithdraw],
      });

      console.log("Withdrawal successful!", transaction);
      toast.success("Withdrawal successful!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (
        error.message.includes("Withdrawal amount must be greater than zero")
      ) {
        // Handle the specific error from the smart contract
        toast.error("Withdrawal amount must be greater than zero.");
      } else if (
        error.message.includes("Cannot withdraw more than invested amount")
      ) {
        // Handle the specific error from the smart contract
        toast.error("Cannot withdraw more than the invested amount.");
      } else if (error.message.includes("revert")) {
        // Handle revert errors (could be from the contract)
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Withdrawal failed: ${error.message || error}`);
      }
    }
  }

  async function withdrawInterest() {
    console.log("Withdrawing interest...");

    try {
      // Send the withdraw interest transaction to the contract
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "withdrawInterest",
        args: [],
      });

      console.log("Interest withdrawal successful!", transaction);
      toast.success("Interest withdrawal successful!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (error.message.includes("No interest accrued")) {
        // Handle the specific error from the smart contract
        toast.error("No interest accrued to withdraw.");
      } else if (error.message.includes("revert")) {
        // Handle revert errors (could be from the contract)
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Interest withdrawal failed: ${error.message || error}`);
      }
    }
  }

  // Borrower Functions
  async function makeRepayment() {
    console.log("Making repayment...");

    try {
      // Ensure groupId and repayment amount are valid
      if (!groupId || groupId <= 0) {
        toast.error("Please enter a valid group ID.");
        return;
      }

      if (!repaymentAmount || parseFloat(repaymentAmount) <= 0) {
        toast.error("Repayment amount must be greater than zero.");
        return;
      }

      // Convert repayment amount to Wei using ethers
      const valueToRepay = ethers.utils.parseEther(repaymentAmount);

      // Send the repayment transaction to the contract
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "makeRepayment",
        args: [groupId],
        value: valueToRepay,
      });

      console.log("Repayment successful!", transaction);
      toast.success("Repayment successful!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (
        error.message.includes("Repayment amount must be greater than zero")
      ) {
        toast.error("Repayment amount must be greater than zero.");
      } else if (error.message.includes("Exceeds repayment amount")) {
        toast.error("Exceeds the allowed repayment amount.");
      } else if (error.message.includes("Loan not disbursed yet")) {
        toast.error("The loan has not been disbursed yet.");
      } else if (error.message.includes("revert")) {
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Repayment failed: ${error.message || error}`);
      }
    }
  }

  async function coverDefault() {
    console.log("Covering default...");

    try {
      // Ensure groupId and contribution amount are valid
      if (!groupId || groupId <= 0) {
        toast.error("Please enter a valid group ID.");
        return;
      }

      if (!defaultCoverAmount || parseFloat(defaultCoverAmount) <= 0) {
        toast.error("Contribution amount must be greater than zero.");
        return;
      }

      // Convert contribution amount to Wei using ethers
      const valueToContribute = ethers.utils.parseEther(defaultCoverAmount);

      // Send the contribution transaction to the contract
      const transaction = await writeContractAsync({
        address: GROUPLENDINGANDBORROWINGADDRESS,
        abi: GROUPLENDINGANDBORROWINGABI,
        functionName: "coverDefault",
        args: [groupId],
        value: valueToContribute,
      });

      console.log("Cover default successful!", transaction);
      toast.success("Contribution for covering default successful!");
    } catch (error) {
      // Handle common errors from the contract call
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction failed: Gas estimation failed. Please try again."
        );
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Transaction failed: Insufficient funds.");
      } else if (error.code === "USER_REJECTED") {
        toast.error("Transaction cancelled by user.");
      } else if (
        error.message.includes("Contribution must be greater than zero")
      ) {
        toast.error("Contribution must be greater than zero.");
      } else if (error.message.includes("Loan not overdue yet")) {
        toast.error("The loan is not overdue yet.");
      } else if (error.message.includes("revert")) {
        toast.error("Transaction failed: Contract reverted. Please try again.");
      } else {
        // For all other errors
        console.error(error);
        toast.error(`Contribution failed: ${error.message || error}`);
      }
    }
  }

  // Effect that runs whenever `details` is updated
  useEffect(() => {
    if (details) {
      // Assuming details is an array of group data
      const formattedDetails = {
        members: details[0] || [],
        totalLoan: ethers.utils.formatEther(
          ethers.BigNumber.from(details[1] || 0)
        ),
        repaymentPerMember: ethers.utils.formatEther(
          ethers.BigNumber.from(details[2] || 0)
        ),
        paidAmount: ethers.utils.formatEther(
          ethers.BigNumber.from(details[3] || 0)
        ),
        loanDueDate: details[4]
          ? new Date(Number(details[4]) * 1000).toLocaleDateString() // Convert BigInt to number
          : "N/A",
        loanActive: details[5] || false,
      };
      setGroupDetails(formattedDetails); // Store the details in state
    }
  }, [details]); // Effect triggered when `details` changes

  // Error handling if details are unavailable or error occurs
  useEffect(() => {
    if (detailsError) {
      toast.error("Failed to fetch group details. Please try again.");
    }
  }, [detailsError]);

  // Effect that runs whenever `getRepaymentProgress` is updated
  useEffect(() => {
    if (RepaymentProgressDetails) {
      // Assuming RepaymentProgressDetails is the response from the smart contract
      const formattedProgress = {
        members: RepaymentProgressDetails[0] || [], // Array of members
        repayments: RepaymentProgressDetails[1] || [], // Array of repayments
        dues: RepaymentProgressDetails[2] || [], // Array of dues
      };

      // Format repayment amounts and dues using ethers.utils.formatEther
      const formattedRepayments = formattedProgress.repayments.map(
        (repayment) => {
          // Ensure repayment is valid and not '0.0' or an invalid string
          const validRepayment = ethers.BigNumber.from(repayment || "0");
          return ethers.utils.formatEther(validRepayment);
        }
      );

      const formattedDues = formattedProgress.dues.map((due) => {
        // Ensure due is valid and not '0.0' or an invalid string
        const validDue = ethers.BigNumber.from(due || "0");
        return ethers.utils.formatEther(validDue);
      });

      // Prepare the final formatted details object
      const formattedDetails = {
        members: formattedProgress.members,
        repayments: formattedRepayments,
        dues: formattedDues,
      };

      setRepaymentProgress(formattedDetails); // Store formatted details in state
    }
  }, [RepaymentProgressDetails]); // Effect triggered when RepaymentProgressDetails changes

  // Error handling for when RepaymentProgressDetails is unavailable or an error occurs
  useEffect(() => {
    if (detailsError) {
      toast.error("Failed to fetch repayment progress. Please try again.");
    }
  }, [RepaymentProgressError]);

  //get deatils of default.
  useEffect(() => {
    if (defaultingMembersDetails) {
      const formattedDetails = {
        defaulters: defaultingMembersDetails[0] || [],
        dueAmounts: defaultingMembersDetails[1] || [],
      };
      setDefaultingMembers(formattedDetails); // Store formatted details in state
    }
  }, [defaultingMembersDetails]);

  useEffect(() => {
    if (defaultingMembersError) {
      toast.error("Failed to fetch group details. Please try again.");
    }
  }, [defaultingMembersError]);

  return (
    <div className="App">
      <h1>GroupFinance Protocol</h1>
      <div className="wallet-container">
        <ConnectButton />
      </div>
      <div className="tabs">
        <button
          onClick={() => handleTabChange("Admin")}
          className={activeTab === "Admin" ? "active" : ""}
        >
          Admin
        </button>
        <button
          onClick={() => handleTabChange("Lender")}
          className={activeTab === "Lender" ? "active" : ""}
        >
          Lender
        </button>
        <button
          onClick={() => handleTabChange("Borrower")}
          className={activeTab === "Borrower" ? "active" : ""}
        >
          Borrower
        </button>
      </div>

      <div className="content">
        {activeTab === "Admin" && (
          <div className="admin-content">
            <h2>Admin Actions</h2>
            <input
              placeholder="Group Members (comma-separated)"
              onChange={(e) => setGroupMembers(e.target.value)}
            />
            <input
              placeholder="Loan Amount"
              value={loanAmount}
              onChange={handleInputChange(setLoanAmount)}
            />
            <input
              placeholder="Repayment Days"
              value={repaymentDays}
              onChange={handleInputChange(setRepaymentDays)}
            />
            <input
              placeholder="Group ID for Loan Disbursement"
              value={groupId}
              onChange={handleInputChange(setGroupId)} // Using handleInputChange for validation
            />
            <button onClick={createGroup}>Create Group</button>
            <button onClick={() => disburseLoan(groupId)}>Disburse Loan</button>
          </div>
        )}

        {activeTab === "Lender" && (
          <div className="lender-content">
            <h2>Lender Actions</h2>
            <input
              placeholder="Investment Amount in (XFI)"
              value={investmentAmount}
              onChange={handleInputChange(setInvestmentAmount)}
            />
            <button onClick={invest}>Invest</button>
            <input
              placeholder="Withdraw Amount"
              value={withdrawAmount}
              onChange={handleInputChange(setWithdrawAmount)}
            />
            <button onClick={withdrawPrincipal}>Withdraw Principal</button>
            <button onClick={withdrawInterest}>Withdraw Interest</button>
          </div>
        )}

        {activeTab === "Borrower" && (
          <div className="borrower-content">
            <h2>Borrower Actions</h2>

            {/* Input for Group ID */}
            <input
              placeholder="Enter Group ID"
              value={groupId}
              onChange={handleInputChange(setGroupId)} // Use the same handleInputChange utility
            />

            {/* Repayment Actions */}
            <input
              placeholder="Repayment Amount"
              value={repaymentAmount}
              onChange={handleInputChange(setRepaymentAmount)} // Numeric validation applied
            />
            <button onClick={makeRepayment}>Make Repayment</button>

            {/* Cover Default */}
            <input
              placeholder="Default Cover Amount"
              value={defaultCoverAmount}
              onChange={handleInputChange(setDefaultCoverAmount)} // Numeric validation applied
            />
            <button onClick={coverDefault}>Cover Default</button>

            {/* Repayment Progress */}

            {/* Display Group Details */}
            {groupDetails && (
              <div className="result-card">
                <h3>Group Details:</h3>
                <div>
                  <strong>Members: </strong>
                  {groupDetails.members.join(", ")}
                </div>
                <div>
                  <strong>Total Loan: </strong>
                  {groupDetails.totalLoan} XFI
                </div>
                <div>
                  <strong>Repayment Per Member: </strong>
                  {groupDetails.repaymentPerMember} XFI
                </div>
                <div>
                  <strong>Paid Amount: </strong>
                  {groupDetails.paidAmount} XFI
                </div>
                <div>
                  <strong>Loan Due Date: </strong>
                  {groupDetails.loanDueDate}
                </div>
                <div>
                  <strong>Loan Active: </strong>
                  {groupDetails.loanActive ? "Yes" : "No"}
                </div>
              </div>
            )}

            {/* Display Repayment Progress */}
            {repaymentProgress &&
              repaymentProgress.members &&
              repaymentProgress.members.length > 0 && (
                <div className="result-card">
                  <h3>Repayment Progress:</h3>
                  <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                    {repaymentProgress.members.map((member, index) => {
                      const repayment = repaymentProgress.repayments[index];
                      const due = repaymentProgress.dues[index];

                      // Ensure repayment and due values are not zero (to avoid 0.0 XFI)
                      const formattedRepayment =
                        repayment !== "0" ? repayment : "0";
                      const formattedDue = due !== "0" ? due : "0";

                      return (
                        <li key={index}>
                          <strong>Member:</strong> {member} <br />
                          <strong>Repayment:</strong> {formattedRepayment} XFI{" "}
                          <br />
                          <strong>Due:</strong> {formattedDue} XFI
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            {/* Display Defaulting Members */}
            {defaultingMembers?.defaulters.length > 0 && (
              <div className="result-card">
                <p>Defaulting Members:</p>
                <ul>
                  {defaultingMembers.defaulters.map((member, index) => (
                    <li key={index}>
                      <strong>{member}</strong>:{" "}
                      {ethers.utils.formatEther(
                        defaultingMembers.dueAmounts[index]
                      )}{" "}
                      XFI
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
