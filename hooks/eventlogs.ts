/*
  const userLoadSafeAddresses = async () => {
    setIsLoading(true)

    if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
      let provider = new ethers.providers.Web3Provider(window.ethereum);
      let myprovider: typeof provider = provider;

      console.log(myprovider)
      let signer = myprovider.getSigner(0)
      let mysigner: typeof signer = signer;
      console.log(mysigner);

      let GnosisSafeContractInstance: ContractFactory = await ethers.getContractFactory("GnosisSafeGetAddresses", mysigner);
      let GnosisSafeContractActual: Contract = await GnosisSafeContractInstance.deploy();
      await GnosisSafeContractActual.deployed();

      let GnosisContractAddress: string = await GnosisSafeContractActual.address;
      let GnosisSafeContractInstanceSigned = GnosisSafeContractActual.connect(myprovider);

      addresslisttx = await GnosisSafeContractActual.getSafeAddresses(userAddress);
      receipt = await addresslisttx.wait();

      let filter = GnosisSafeContractActual.filters.getSafeAddressListEvent(userAddress);

      GnosisSafeContractActual.on(filter, (safeaddresskeylist, event) => {
        console.log("SafeAdressList", safeaddresskeylist);
      })

      transactionalreceipt = await provider.getTransactionReceipt(addresslisttx.hash);

      let gnosissafeandinterface = new ethers.utils.Interface(["event getSafeAddressListEvent(string[] safeaddresskey)"]);
      const data = transactionalreceipt.logs[0].data;
      const topics = transactionalreceipt.logs[0].topics;
      const event = gnosissafeandinterface.decodeEventLog("getSafeAddressListEvent", data, topics);
      safeaddresses = event.safeaddresskey;
      setIsLoading(false)
      return safeaddresses
    }
  }
*/