# 区块链彩票项目 

#### 智能合约的设计

- 字段

1. manager
2. player

- 函数

1. manger的开奖函数 pickWinner()
2. player的投注函数 enter()

#### 智能合约的编写

```
pragma solidity ^0.4.17;

contract Lottery{
    address public manager;
    address[] public players;

    //构造方法中完成manager的初始化
    function Lottery() public{
        manager=msg.sender;
    }

    //投注流程，注意需要投注金额的确认
    function enter() public payable {
        require(msg.value==1 ether);
        players.push(msg.sender);
    }

    //获取所有的投注者
    function allPlayers() public view returns(address[]) {
        return players;
    }

    //获取奖池金额
    function getBalance() public view returns(uint){
        return this.balance;
    }

    //获取购买彩票的人数
    function getPlayersCount() public view returns(uint){
        return players.length;
    }

    //随机数逻辑，只有区块链内部可以进行调用
    function randomOne() private view returns(uint){
        return uint(keccak256(block.difficulty,now,players));
    }

    //选择一个幸运儿，由管理员挑选
    function pickWinner() public onlyManagerCanCall returns(address){
        uint index=randomOne() % players.length;
        address winner = players[index];
        players = new address[](0) ;
        winner.transfer(this.balance);
        return winner;
    }

    //退款流程
    function refund() public onlyManagerCanCall{
        for(uint i=0;i<players.length;i++){
            players[i].transfer(1 ether);
        }
        players=new address[](0);
    }

    modifier onlyManagerCanCall(){
        require(msg.sender == manager);
        _;
    }
}
```

#### 智能合约的编译

```
//智能合约的编译
const path=require("path");
const fs=require("fs");
const solc=require("solc");

//获取智能合约的文件路径
const srcpath = path.resolve(__dirname,"contracts","Lottery.sol");
//读取文件
const source = fs.readFileSync(srcpath,"utf-8");
//solc对文件进行编译
const  result = solc.compile(source,1);
//导出
console.log(result.contracts[':Lottery']);
module.exports = result.contracts[':Lottery'];

```

#### 智能合约的测试

```
//引入测试框架
const ganache = require('ganache-cli');
//引入web3
const Web3 = require('web3');
//设置测试的provider
const web3 = new Web3(ganache.provider());
const {interface,bytecode} = require('../compile');
//引入断言
const assert = require('assert');

//智能合约
let lottery;
//账户
let accounts;

beforeEach(async ()=>{
    accounts = await new web3.eth.getAccounts();
    lottery= await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data:bytecode
        }).send({
            from:accounts[0],
            gas:"1000000"
        })
})

describe('彩票智能合约的测试', function () {
    it('测试智能合约的编译和部署', function () {
        assert.ok(lottery.options.address)
    });
    it('一个账户投注彩票，正确流程测试', async function () {
        const beginMoney=await lottery.methods.getBalance().call()
        await lottery.methods.enter().send({
            from:accounts[1],
            value: 1000000000000000000
        })
        const endMoney=await lottery.methods.getBalance().call()
        console.log(endMoney-beginMoney);
        assert.equal("1000000000000000000",endMoney-beginMoney);
    });
    it('一个账户投注彩票，错误流程测试', async function () {
        let flag=false;
        try {
            await lottery.methods.enter().send({
                from: accounts[1],
                value: 2000000000000000000
            })
            flag=false;
        } catch (e) {
            flag=true
        }
        assert.equal("false",flag);
    });
    it('测试开奖，正确测试',async function () {
        await lottery.methods.enter().send({
            from:accounts[1],
            value: 1000000000000000000
        })
        await lottery.methods.enter().send({
            from:accounts[2],
            value: 1000000000000000000
        })
        await lottery.methods.enter().send({
            from:accounts[3],
            value: 1000000000000000000
        })
        await lottery.methods.enter().send({
            from:accounts[1],
            value: 1000000000000000000
        })
        const startMoney=await lottery.methods.getBalance().call()
        console.log(startMoney)
        await lottery.methods.pickWinner().send({
            from:accounts[0],
        })
        const endMoney=await lottery.methods.getBalance().call()
        console.log(endMoney)
        assert.equal("0",endMoney)

    });
    it('测试开奖，错误测试',async function () {
        let flag=false;
        await lottery.methods.enter().send({
            from:accounts[1],
            value: 1000000000000000000
        })
        await lottery.methods.enter().send({
            from:accounts[2],
            value: 1000000000000000000
        })
        await lottery.methods.enter().send({
            from:accounts[3],
            value: 1000000000000000000
        })
        await lottery.methods.enter().send({
            from:accounts[1],
            value: 1000000000000000000
        })
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            })
            flag=false;
        } catch (e) {
            flag=true;
        }
        assert.equal("false",flag)
    });
});
```

#### 智能合约的部署

```
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
```

