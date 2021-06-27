import nc from 'next-connect';
import axios from 'axios';
import { ethers } from 'ethers';
import { App } from '../../../src/config';
import supabase from '../../../src/lib/supabase';

const INITIAL_AMOUNT = 1000000000000000000;
const uniswapRouter = new ethers.Contract(
  App.QUICKSWAP_ROUTER_ADDRESS,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  ],
  new ethers.providers.JsonRpcProvider(App.MATIC_RPC),
);

const fetchExchangeRate = async () => {
  const rates = await uniswapRouter.getAmountsOut(
    ethers.BigNumber.from(INITIAL_AMOUNT.toString()),
    [App.REWARDS_ADDRESS, App.UNDERLYING_ASSET_ADDRESS],
  );

  return rates[1].mul(10000).div(rates[0]).toNumber() / 10000;
};

const fetchAaveReserveData = async () =>
  axios
    .post(App.AAVE_SUBGRAPH_URL, {
      query: `
    {
      reserves {
        name
        underlyingAsset
        
        liquidityRate 
        stableBorrowRate
        variableBorrowRate
        
        aEmissionPerSecond
        vEmissionPerSecond
        sEmissionPerSecond
        
        totalATokenSupply
        totalCurrentVariableDebt
      }
    }
    `,
    })
    .then((r) => r.data.data.reserves);

const amountInPoolAtNPeriods = async (period, mem, constants) => {
  const { initialDeposit, supplyAPR, RewardsPerPeriod, rewardsSwapRate, totalATokenSupply } =
    constants;

  const wrapper = (p) => {
    return new Promise((resolve) => {
      process.nextTick(() => {
        resolve(amountInPoolAtNPeriods(p, mem, constants));
      });
    });
  };

  if (mem[period]) return mem[period];

  if (period === 0) {
    mem[period] = initialDeposit;
  } else if (period === 1) {
    mem[period] = (await wrapper(period - 1)) * (1 + supplyAPR);
  } else {
    mem[period] =
      ((await wrapper(period - 1)) +
        RewardsPerPeriod * ((await wrapper(period - 2)) / totalATokenSupply) * rewardsSwapRate) *
      (1 + supplyAPR);
  }

  return mem[period];
};

const calculateAutoCompoundingAPY = async (reserveData, exchangeRate) => {
  const initialDeposit = INITIAL_AMOUNT;
  const totalATokenSupply = reserveData.totalATokenSupply;
  const supplyAPY = reserveData.liquidityRate / 1e27;

  const rewardsEmissionsPerSecond = reserveData.aEmissionPerSecond;
  const rewardsSwapRate = exchangeRate;

  const numberOfPeriodsPerYear = 525600;

  const supplyAPR = Math.pow(supplyAPY + 1, 1 / numberOfPeriodsPerYear) - 1;
  const RewardsPerPeriod = (rewardsEmissionsPerSecond * 31536000) / numberOfPeriodsPerYear;

  const mem = new Array(numberOfPeriodsPerYear).fill(null);
  const constants = {
    initialDeposit,
    supplyAPR,
    RewardsPerPeriod,
    rewardsSwapRate,
    totalATokenSupply,
  };
  return (
    (await amountInPoolAtNPeriods(numberOfPeriodsPerYear, mem, constants)) / initialDeposit - 1
  );
};

export default nc()
  .use((req, res, next) => {
    if (req.headers['authorization'] === process.env.SUPABASE_KEY) {
      next();
    } else {
      res.status(401).end('Unauthorized');
    }
  })
  .post(async (_, res) => {
    const [reserve, exchangeRate] = await Promise.all([
      fetchAaveReserveData(),
      fetchExchangeRate(),
    ]);
    const APY = await calculateAutoCompoundingAPY(
      reserve.find((r) => r.underlyingAsset === App.UNDERLYING_ASSET_ADDRESS),
      exchangeRate,
    );

    const { data, error } = await supabase.from('SaversAnnualPercentageYield').insert([{ APY }]);

    if (error) {
      res.status(500).end(error.message);
    } else {
      res.json({ data });
    }
  });
