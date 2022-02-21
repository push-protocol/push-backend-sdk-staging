export default {
  /**
   * EPNS Related
   */
  // addresses for the core contract
  coreNetwork: "42",
  coreContractAddress: '0x97D7c5f14B8fe94Ef2b4bA589379f5Ec992197dA',
  coreContractABI: require('../data/epns_contract.json'),
  // addresses for the communicator contract
  communicatorContractAddress: {
    1: "0x97D7c5f14B8fe94Ef2b4bA589379f5Ec992197dA",
    42: "0x87da9Af1899ad477C67FeA31ce89c1d2435c77DC",
    80001: "0xD2ee1e96e3592d5945dDc1808834d7EE67400823",
    137: "0xb3971BCef2D791bc4027BbfedFb47319A4AAaaAa"
  },
  communicatorContractABI: require('../data/epns_communicator.json')
};
