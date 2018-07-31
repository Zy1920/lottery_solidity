//智能合约的部署
const Web3 = require("web3");
const  {interface,bytecode} = require("./compile");
const ganache = require("ganache-cli");
const web3 = new Web3(ganache.provider());

deploy = async ()=>{
    const accounts = await web3.eth.getAccounts();
    const result = await web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data:bytecode
        }).send({
            from:accounts[0],
            gas:52000000
        })
    console.log("address:"+result.options.address)
}


