import type { NextPage } from 'next';
import { TransferTokenCard } from '../features/transfer/TransferTokenCard';

const Home: NextPage = () => {
  return (
    <div className="relative z-10 flex justify-center items-center">
      <TransferTokenCard />
    </div>
  );
};

export default Home;
