import type { NextPage } from 'next';
import { TransferTokenCard } from '../features/transfer/TransferTokenCard';

const Home: NextPage = () => {
  return (
    <div className="relative w-100 sm:w-[31rem]">
      <TransferTokenCard />
    </div>
  );
};

export default Home;
