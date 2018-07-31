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