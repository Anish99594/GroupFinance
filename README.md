# GroupFinance

## Overview

The **GroupFinance** contract is a decentralized lending and borrowing system designed for groups of borrowers to collectively take out a loan. Each member of the group is responsible for repaying a portion of the loan, and lenders can invest in the system to earn interest on their investments. The contract also includes features like loan repayments, handling defaults, covering defaults, and reward distribution for borrowers who repay their loan on time.

## Key Features

- **Group Loan Creation**: Admin can create a group with a loan amount and repayment period.
- **Loan Disbursement**: Loan is disbursed equally to all members of the group.
- **Repayment System**: Each member can make repayments on their portion of the loan, with service fees applied.
- **Default Handling**: If the loan is not repaid on time, the admin can handle defaults and track defaulters.
- **Lender Investment**: Lenders can invest in the contract and earn interest on their investments.
- **Interest Accrual**: Lenders accrue interest on their investments, which can be withdrawn.
- **Reward System**: Borrowers who repay their loan on time receive rewards.
- **Default Handling and Coverage**: Group members can contribute to covering defaults, and the admin can manage defaults.

## Getting Started

### Prerequisites

- Basic understanding of Crossifi chain contracts and Solidity.
- MetaMask or any wallet for interacting with the contract.

### Installation

1. Clone this repository to your local machine.
2. Compile and deploy the contract using Remix IDE or any other Solidity development environment.
3. Ensure your wallet is connected to the network where the contract is deployed.

### Deployment

Deploy the contract with the desired parameters. After deployment, users can interact with the contract for lending and borrowing functions.

## Contract Functions

### Group Functions

- **createGroup(address[] memory members, uint256 loanAmount, uint256 repaymentPeriodDays)**: Admin creates a group with the specified members, loan amount, and repayment period.
- **disburseLoan(uint256 groupId)**: Admin disburses the loan to the group members.
- **makeRepayment(uint256 groupId)**: Members make repayments towards the loan.
- **handleDefault(uint256 groupId)**: Admin handles defaulted loans by checking if the loan was not repaid by the due date.
- **coverDefault(uint256 groupId)**: Group members can contribute to cover defaulted loan amounts.

### Lender Functions

- **invest()**: Lenders can invest in the contract to earn interest.
- **withdrawPrincipal(uint256 amount)**: Lenders can withdraw a portion of their principal investment.
- **withdrawInterest()**: Lenders can withdraw the interest accrued on their investment.

### Utility Functions

- **getGroupDetails(uint256 groupId)**: Retrieves details about a specific group, including loan amount, repayment per member, and loan status.
- **getRepaymentProgress(uint256 groupId)**: Provides information about the repayments made by each group member.
- **getDefaultingMembers(uint256 groupId)**: Returns a list of members who have not made their required repayments.

## Events

- **GroupCreated(uint256 groupId, address[] members, uint256 loanAmount, uint256 dueDate)**: Triggered when a new group is created.
- **LoanDisbursed(uint256 groupId, uint256 loanAmount)**: Triggered when the loan is disbursed to the group members.
- **RepaymentMade(uint256 groupId, address member, uint256 amount, uint256 dueAmount)**: Triggered when a group member makes a repayment.
- **DefaultHandled(uint256 groupId, address defaulter, uint256 dueAmount)**: Triggered when a default is handled for a member.
- **InvestmentMade(address lender, uint256 amount)**: Triggered when a lender invests in the contract.
- **InterestPaid(address lender, uint256 interest)**: Triggered when a lender withdraws their earned interest.
- **RewardIssued(address member, uint256 amount)**: Triggered when a borrower receives a reward.

## Contract Variables

- `MONTHLY_INTEREST_RATE`: The monthly interest rate applied to lenders' investments (default 7%).
- `serviceFeeRate`: The service fee rate on repayments (default 2%).
- `admin`: The address of the contract admin.
- `groupCount`: A counter that tracks the number of groups created.

## Future Development

- **Group-specific Repayment Plans**: Allow more flexibility in how repayments are structured for each group.
- **Enhanced Default Handling**: Introduce more advanced mechanisms to handle defaults, including partial loan forgiveness.
- **Cross-Chain Lending**: Expansion to other blockchain networks for decentralized lending and borrowing.

## Contributing

Contributions are welcome! To contribute, fork this repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For any inquiries or support, please open an issue on the GitHub repository or contact us via email.

## Links

- **GitHub Repository**: [https://github.com/Anish99594/GroupLending](https://github.com/Anish99594/GroupFinance.git)
- **Demo Video**: [Watch here](#)
- **Project Website**: [https://group-lending.vercel.app/](https://group-finance.vercel.app/)
